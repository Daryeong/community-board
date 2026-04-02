import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_BYTES: Record<string, Buffer> = {
  "image/jpeg": Buffer.from([0xFF, 0xD8, 0xFF]),
  "image/png": Buffer.from([0x89, 0x50, 0x4E, 0x47]),
  "image/gif": Buffer.from([0x47, 0x49, 0x46]),
  "image/webp": Buffer.from([0x52, 0x49, 0x46, 0x46]),
  "application/pdf": Buffer.from([0x25, 0x50, 0x44, 0x46]),
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const magic = MAGIC_BYTES[mimeType];
  if (!magic) return true;
  return buffer.subarray(0, magic.length).equals(magic);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "지원하지 않는 파일 확장자입니다." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하만 가능합니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!verifyMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: "파일 내용이 형식과 일치하지 않습니다." }, { status: 400 });
    }

    const randomName = crypto.randomBytes(16).toString("hex");
    const safeExt = ALLOWED_EXTENSIONS.find((e) => e === ext) ?? ".bin";
    const filename = `${randomName}${safeExt}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const safeOriginalName = sanitizeFilename(file.name);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      originalName: safeOriginalName,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
