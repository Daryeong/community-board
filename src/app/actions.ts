"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  changePassword,
  createComment,
  createNotification,
  createPost,
  deleteAccount,
  deleteComment,
  deletePost,
  loginUser,
  registerUser,
  updateComment,
  updatePost,
  updateUserProfile,
  togglePostLike,
  toggleBookmark,
  toggleCommentLike,
} from "@/lib/board-data";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import type { FormState } from "@/lib/form-state";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAction } from "@/lib/action-log";
import { safeNextPath } from "@/lib/security";
import { clearSession, createSession, getViewer, clearAllUserSessions } from "@/lib/session";

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

function noticeUrl(path: string, message: string) {
  const [pathname, existingQuery] = path.split("?");
  const params = new URLSearchParams(existingQuery ?? "");
  params.set("notice", message);
  return `${pathname}?${params.toString()}`;
}

function getResultMessage(result: unknown, fallback: string) {
  if (typeof result === "object" && result !== null && "message" in result) {
    const message = (result as { message?: string }).message;
    return message ?? fallback;
  }

  return fallback;
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(ip, "register");
  if (!rateLimit.allowed) {
    return { message: "잠시 후 다시 시도해주세요." };
  }

  const nextPath = safeNextPath(formData.get("next"));
  const result = await registerUser({
    username: formData.get("username"),
    nickname: formData.get("nickname"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: "입력 내용을 다시 확인해주세요.",
    };
  }

  await logAction("register", "user", result.userId, result.userId, await getClientIp());
  await createSession(result.userId);
  redirect(nextPath);
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(ip, "login");
  if (!rateLimit.allowed) {
    return { message: "잠시 후 다시 시도해주세요." };
  }

  const nextPath = safeNextPath(formData.get("next"));
  const result = await loginUser({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: getResultMessage(result, "로그인에 실패했습니다."),
    };
  }

  await logAction("login", "session", result.userId, result.userId, await getClientIp());
  await createSession(result.userId);
  redirect(nextPath);
}

export async function logoutAction() {
  const viewer = await getViewer();
  if (viewer) {
    await logAction("logout", "session", viewer.id, viewer.id, await getClientIp());
  }
  await clearSession();
  redirect("/");
}

export async function createPostAction(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fwrite");
  }

  const rateLimit = checkRateLimit(`user:${viewer.id}`, "createPost");
  if (!rateLimit.allowed) {
    return { message: "잠시 후 다시 시도해주세요." };
  }

  const attachmentsJson = formData.get("attachments") as string | null;
  let attachments: Array<{ filename: string; originalName: string; mimeType: string; size: number; url: string }> = [];
  if (attachmentsJson) {
    try {
      attachments = JSON.parse(attachmentsJson);
    } catch {
      attachments = [];
    }
  }

  const categoryIdStr = formData.get("categoryId") as string | null;
  const categoryId = categoryIdStr ? Number(categoryIdStr) : null;

  const tagsStr = formData.get("tags") as string;
  const tags = tagsStr ? JSON.parse(tagsStr) : [];

  const result = await createPost(viewer.id, {
    title: formData.get("title"),
    content: formData.get("content"),
  }, attachments, categoryId, tags);

  if (!result.ok) {
    return {
      errors: result.errors,
      message: getResultMessage(result, "게시글을 저장하지 못했습니다."),
    };
  }

  await logAction("create_post", "post", result.postId, viewer.id, await getClientIp());
  revalidatePath("/");
  redirect(`/posts/${result.postId}`);
}

export async function updatePostAction(postId: number, _: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}/edit`)}`);
  }

  await requirePermission("post", postId, viewer.id, "edit");

  const categoryIdStr = formData.get("categoryId") as string | null;
  const categoryId = categoryIdStr ? Number(categoryIdStr) : null;

  const attachmentsJson = formData.get("attachments") as string | null;
  let attachments: Array<{ filename: string; originalName: string; mimeType: string; size: number; url: string }> = [];
  if (attachmentsJson) {
    try {
      attachments = JSON.parse(attachmentsJson);
    } catch {
      attachments = [];
    }
  }

  const result = await updatePost(postId, viewer.id, {
    title: formData.get("title"),
    content: formData.get("content"),
  }, categoryId, attachments);

  if (!result.ok) {
    return {
      errors: result.errors,
      message: getResultMessage(result, "게시글을 수정하지 못했습니다."),
    };
  }

  await logAction("update_post", "post", postId, viewer.id, await getClientIp());
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePostAction(postId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  await requirePermission("post", postId, viewer.id, "delete");

  const result = await deletePost(postId, viewer.id);
  if (!result.ok) {
    redirect(noticeUrl(`/posts/${postId}`, getResultMessage(result, "게시글을 삭제할 수 없습니다.")));
  }

  await logAction("delete_post", "post", postId, viewer.id, await getClientIp());
  revalidatePath("/");
  redirect(noticeUrl("/", "게시글이 삭제되었습니다."));
}

export async function createCommentAction(postId: number, parentId: number | null, formData: FormData) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  const rateLimit = checkRateLimit(`user:${viewer.id}`, "createComment");
  if (!rateLimit.allowed) {
    redirect(noticeUrl(`/posts/${postId}`, "잠시 후 다시 시도해주세요."));
  }

  const result = await createComment(postId, viewer.id, parentId, {
    content: formData.get("content"),
  });

  if (!result.ok) {
    redirect(noticeUrl(`/posts/${postId}`, getResultMessage(result, "댓글을 저장할 수 없습니다.")));
  }

  await logAction("create_comment", "comment", result.commentId!, viewer.id, await getClientIp());
  
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (post) {
    await createNotification("comment", post.authorId, viewer.id, postId, result.commentId!);
  }

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function updateCommentAction(commentId: number, formData: FormData) {
  const viewer = await getViewer();
  const postId = Number(formData.get("postId"));
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  await requirePermission("comment", commentId, viewer.id, "edit");

  const result = await updateComment(commentId, viewer.id, {
    content: formData.get("content"),
  });

  const targetPostId = result.ok ? result.postId : postId;
  if (!result.ok) {
    redirect(noticeUrl(`/posts/${targetPostId}`, getResultMessage(result, "댓글을 수정할 수 없습니다.")));
  }

  await logAction("update_comment", "comment", commentId, viewer.id, await getClientIp());
  revalidatePath(`/posts/${targetPostId}`);
  redirect(`/posts/${targetPostId}`);
}

export async function deleteCommentAction(commentId: number, postId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  await requirePermission("comment", commentId, viewer.id, "delete");

  const result = await deleteComment(commentId, viewer.id);
  if (!result.ok) {
    redirect(noticeUrl(`/posts/${postId}`, getResultMessage(result, "댓글을 삭제할 수 없습니다.")));
  }

  await logAction("delete_comment", "comment", commentId, viewer.id, await getClientIp());
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function changePasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fpassword");
  }

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { message: "새 비밀번호와 확인이 일치하지 않습니다." };
  }

  const result = await changePassword(viewer.id, {
    currentPassword: formData.get("currentPassword"),
    newPassword,
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: result.message ?? "비밀번호를 변경하지 못했습니다.",
    };
  }

  await logAction("change_password", "user", viewer.id, viewer.id, await getClientIp());
  await clearAllUserSessions(viewer.id);
  await createSession(viewer.id);
  redirect(noticeUrl("/password", "비밀번호가 변경되었습니다."));
}

export async function updateProfileAction(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fprofile");
  }

  const avatarUrl = formData.get("avatarUrl") as string;
  const result = await updateUserProfile(viewer.id, {
    nickname: formData.get("nickname"),
    email: formData.get("email"),
    avatarUrl: avatarUrl || null,
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: result.message ?? "프로필을 수정하지 못했습니다.",
    };
  }

  revalidatePath("/mypage");
  return { message: "프로필이 수정되었습니다." };
}

export async function deleteAccountAction(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login");
  }

  const result = await deleteAccount(viewer.id, {
    password: formData.get("password"),
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: result.message ?? "회원탈퇴를 처리하지 못했습니다.",
    };
  }

  await clearSession();
  revalidatePath("/");
  revalidatePath("/login");
  revalidatePath("/mypage");
  redirect("/?notice=탈퇴가 완료되었습니다.");
}

export async function likePostAction(postId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "로그인이 필요합니다." };
  }

  const result = await togglePostLike(postId, viewer.id);
  
  if (result.liked) {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (post) {
      await createNotification("like_post", post.authorId, viewer.id, postId);
    }
  }
  
  revalidatePath(`/posts/${postId}`);
  return result;
}

export async function bookmarkPostAction(postId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "로그인이 필요합니다." };
  }

  const result = await toggleBookmark(postId, viewer.id);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/mypage/bookmarks");
  return result;
}

export async function likeCommentAction(commentId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "로그인이 필요합니다." };
  }

  const result = await toggleCommentLike(commentId, viewer.id);
  
  if (result.liked) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { authorId: true, postId: true } });
    if (comment) {
      await createNotification("like_comment", comment.authorId, viewer.id, comment.postId, commentId);
    }
  }
  
  revalidatePath("/");
  return result;
}

export async function markAllNotificationsReadAction() {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "로그인이 필요합니다." };
  }

  const { markAllNotificationsAsRead } = await import("@/lib/board-data");
  await markAllNotificationsAsRead(viewer.id);
  revalidatePath("/");
  revalidatePath("/mypage/notifications");
}

export async function markNotificationReadAction(notificationId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "로그인이 필요합니다." };
  }

  const { markNotificationAsRead } = await import("@/lib/board-data");
  await markNotificationAsRead(notificationId, viewer.id);
  revalidatePath("/");
  revalidatePath("/mypage/notifications");
}

export async function updateNotificationSettingsAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) {
    return;
  }

  const notifyComment = formData.get("notifyComment") === "on";
  const notifyLike = formData.get("notifyLike") === "on";

  const { updateNotificationSettings } = await import("@/lib/board-data");
  await updateNotificationSettings(viewer.id, { notifyComment, notifyLike });
  
  revalidatePath("/mypage/settings");
}

export async function createBookmarkFolderAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) {
    return;
  }

  const name = formData.get("name") as string;
  if (!name?.trim()) {
    return;
  }

  const { createBookmarkFolder } = await import("@/lib/board-data");
  await createBookmarkFolder(viewer.id, name.trim());
  
  revalidatePath("/mypage/bookmarks");
}

export async function deleteBookmarkFolderAction(folderId: number): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) {
    return;
  }

  const { deleteBookmarkFolder } = await import("@/lib/board-data");
  await deleteBookmarkFolder(folderId, viewer.id);
  
  revalidatePath("/mypage/bookmarks");
}

export async function reportAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) return;

  const targetType = formData.get("targetType") as string;
  const targetId = Number(formData.get("targetId"));
  const reason = formData.get("reason") as string;
  const description = formData.get("description") as string;

  if (!targetType || !targetId || !reason) return;

  const { createReport } = await import("@/lib/board-data");
  await createReport(viewer.id, targetType as "post" | "comment", targetId, reason, description);
}

export async function blockUserAction(userId: number): Promise<void> {
  const viewer = await getViewer();
  if (!viewer || viewer.id === userId) return;

  const { blockUser } = await import("@/lib/board-data");
  await blockUser(viewer.id, userId);
  revalidatePath("/mypage/settings");
}

export async function unblockUserAction(userId: number): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) return;

  const { unblockUser } = await import("@/lib/board-data");
  await unblockUser(viewer.id, userId);
  revalidatePath("/mypage/settings");
}
