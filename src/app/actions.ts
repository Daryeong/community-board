"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  loginUser,
  registerUser,
  updateComment,
  updatePost,
} from "@/lib/board-data";
import type { FormState } from "@/lib/form-state";
import { safeNextPath } from "@/lib/security";
import { clearSession, createSession, getViewer } from "@/lib/session";

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

  await createSession(result.userId);
  redirect(nextPath);
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
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

  await createSession(result.userId);
  redirect(nextPath);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createPostAction(_: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fwrite");
  }

  const result = await createPost(viewer.id, {
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: getResultMessage(result, "게시글을 저장하지 못했습니다."),
    };
  }

  revalidatePath("/");
  redirect(`/posts/${result.postId}`);
}

export async function updatePostAction(postId: number, _: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}/edit`)}`);
  }

  const result = await updatePost(postId, viewer.id, {
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!result.ok) {
    return {
      errors: result.errors,
      message: getResultMessage(result, "게시글을 수정하지 못했습니다."),
    };
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePostAction(postId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  const result = await deletePost(postId, viewer.id);
  if (!result.ok) {
    redirect(noticeUrl(`/posts/${postId}`, getResultMessage(result, "게시글을 삭제할 수 없습니다.")));
  }

  revalidatePath("/");
  redirect(noticeUrl("/", "게시글이 삭제되었습니다."));
}

export async function createCommentAction(postId: number, parentId: number | null, formData: FormData) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  const result = await createComment(postId, viewer.id, parentId, {
    content: formData.get("content"),
  });

  if (!result.ok) {
    redirect(noticeUrl(`/posts/${postId}`, getResultMessage(result, "댓글을 저장할 수 없습니다.")));
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

  const result = await updateComment(commentId, viewer.id, {
    content: formData.get("content"),
  });

  const targetPostId = result.ok ? result.postId : postId;
  if (!result.ok) {
    redirect(noticeUrl(`/posts/${targetPostId}`, getResultMessage(result, "댓글을 수정할 수 없습니다.")));
  }

  revalidatePath(`/posts/${targetPostId}`);
  redirect(`/posts/${targetPostId}`);
}

export async function deleteCommentAction(commentId: number, postId: number) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  }

  const result = await deleteComment(commentId, viewer.id);
  if (!result.ok) {
    redirect(noticeUrl(`/posts/${postId}`, getResultMessage(result, "댓글을 삭제할 수 없습니다.")));
  }

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}
