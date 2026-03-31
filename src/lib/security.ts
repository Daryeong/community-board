import { createHmac } from "node:crypto";

export function safeNextPath(raw: FormDataEntryValue | string | null | undefined) {
  const value = typeof raw === "string" ? raw : raw?.toString() ?? "";
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function hashSessionToken(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("hex");
}
