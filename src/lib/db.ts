import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const configuredUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const sqlitePath = configuredUrl.startsWith("file:")
  ? path.resolve(process.cwd(), configuredUrl.slice("file:".length))
  : configuredUrl;

if (process.env.NODE_ENV === "development") {
  console.log("[db] cwd=%s configuredUrl=%s sqlitePath=%s", process.cwd(), configuredUrl, sqlitePath);
}

const adapter = new PrismaBetterSqlite3({
  url: sqlitePath,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
