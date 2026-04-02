import { prisma } from "@/lib/db";

export type ActionType = 
  | "login" 
  | "logout" 
  | "register" 
  | "create_post" 
  | "update_post" 
  | "delete_post"
  | "create_comment"
  | "update_comment"
  | "delete_comment"
  | "change_password"
  | "login_failed"
  | "admin_delete_post"
  | "admin_restore_post"
  | "admin_delete_comment"
  | "admin_suspend_user"
  | "admin_resolve_report"
  | "report_submitted";

export type TargetType = "user" | "post" | "comment" | "session" | "report";

export async function logAction(
  action: ActionType,
  targetType: TargetType,
  targetId: number,
  userId?: number,
  ipAddress?: string,
  metadata?: string
) {
  try {
    await prisma.actionLog.create({
      data: {
        action,
        targetType,
        targetId,
        userId: userId ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}

export async function getRecentActions(limit: number = 50) {
  return prisma.actionLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { nickname: true, username: true },
      },
    },
  });
}

export async function getActionsByUser(userId: number, limit: number = 50) {
  return prisma.actionLog.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getLoginFailures(since: Date) {
  return prisma.actionLog.count({
    where: {
      action: "login_failed",
      createdAt: { gte: since },
    },
  });
}