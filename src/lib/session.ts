import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { hashSessionToken, safeNextPath } from "@/lib/security";

const SESSION_COOKIE = "community_board_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_SECRET = process.env.SESSION_SECRET ?? "community-board-dev-secret";

export type Viewer = {
  id: number;
  username: string;
  nickname: string;
  isAdmin: boolean;
  avatarUrl: string | null;
};

function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  };
}

export async function createSession(userId: number) {
  const token = crypto.randomUUID();
  const tokenHash = hashSessionToken(token, SESSION_SECRET);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token: hashSessionToken(token, SESSION_SECRET) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function clearAllUserSessions(userId: number) {
  await prisma.session.deleteMany({ where: { userId } });
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenHash = hashSessionToken(token, SESSION_SECRET);

  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          nickname: true,
          isAdmin: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
});

export async function requireViewer(nextPath?: string) {
  const viewer = await getViewer();
  if (viewer) return viewer;

  const next = nextPath ? `?next=${encodeURIComponent(safeNextPath(nextPath))}` : "";
  redirect(`/login${next}`);
}
