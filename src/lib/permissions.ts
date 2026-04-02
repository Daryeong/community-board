import "server-only";

import { prisma } from "@/lib/db";

type ResourceType = "post" | "comment" | "attachment" | "bookmark" | "bookmarkFolder";

interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export async function checkPermission(
  resourceType: ResourceType,
  resourceId: number,
  userId: number | null
): Promise<PermissionCheck> {
  const defaultDeny: PermissionCheck = {
    canView: false,
    canEdit: false,
    canDelete: false,
    isAdmin: false,
  };

  if (!userId) {
    return defaultDeny;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  const isAdmin = user?.isAdmin ?? false;

  switch (resourceType) {
    case "post": {
      const post = await prisma.post.findUnique({
        where: { id: resourceId, deletedAt: null },
        select: { authorId: true },
      });
      if (!post) return defaultDeny;
      return {
        canView: true,
        canEdit: post.authorId === userId || isAdmin,
        canDelete: post.authorId === userId || isAdmin,
        isAdmin,
      };
    }

    case "comment": {
      const comment = await prisma.comment.findUnique({
        where: { id: resourceId, deletedAt: null },
        select: { authorId: true },
      });
      if (!comment) return defaultDeny;
      return {
        canView: true,
        canEdit: comment.authorId === userId || isAdmin,
        canDelete: comment.authorId === userId || isAdmin,
        isAdmin,
      };
    }

    case "attachment": {
      const attachment = await prisma.attachment.findUnique({
        where: { id: resourceId },
        select: { post: { select: { authorId: true } } },
      });
      if (!attachment) return defaultDeny;
      return {
        canView: true,
        canEdit: attachment.post.authorId === userId || isAdmin,
        canDelete: attachment.post.authorId === userId || isAdmin,
        isAdmin,
      };
    }

    case "bookmarkFolder": {
      const folder = await prisma.bookmarkFolder.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      if (!folder) return defaultDeny;
      return {
        canView: folder.userId === userId,
        canEdit: folder.userId === userId,
        canDelete: folder.userId === userId,
        isAdmin,
      };
    }

    default:
      return defaultDeny;
  }
}

export async function requirePermission(
  resourceType: ResourceType,
  resourceId: number,
  userId: number | null,
  action: "view" | "edit" | "delete"
): Promise<void> {
  const perm = await checkPermission(resourceType, resourceId, userId);

  const allowed = action === "view" ? perm.canView
    : action === "edit" ? perm.canEdit
    : perm.canDelete;

  if (!allowed) {
    throw new Error("권한이 없습니다.");
  }
}
