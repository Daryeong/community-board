import { z } from "zod";

const trimmed = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label}을 입력해주세요.`);

export const registerSchema = z.object({
  username: trimmed("아이디").min(4, "아이디는 4자 이상이어야 합니다."),
  nickname: trimmed("닉네임").min(2, "닉네임은 2자 이상이어야 합니다."),
  email: z.email("올바른 이메일을 입력해주세요.").trim(),
  password: z
    .string()
    .trim()
    .min(8, "비밀번호는 8자 이상이어야 합니다."),
});

export const loginSchema = z.object({
  identifier: trimmed("아이디 또는 이메일"),
  password: trimmed("비밀번호"),
});

export const postSchema = z.object({
  title: trimmed("제목").max(100, "제목은 100자 이하로 입력해주세요."),
  content: trimmed("내용").max(5000, "내용은 5000자 이하로 입력해주세요."),
});

export const commentSchema = z.object({
  content: trimmed("댓글").max(1000, "댓글은 1000자 이하로 입력해주세요."),
});

type CommentNodeInput = {
  id: number;
  parentId: number | null;
  content: string;
  deletedAt: Date | null;
  createdAt: Date;
};

export type CommentTreeNode<T extends CommentNodeInput = CommentNodeInput> = T & {
  children: T[];
};

export function buildCommentTree<T extends CommentNodeInput>(comments: T[]): CommentTreeNode<T>[] {
  const roots = comments
    .filter((comment) => comment.parentId === null)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((comment) => ({ ...comment, children: [] as T[] }));

  const rootMap = new Map(roots.map((comment) => [comment.id, comment]));

  for (const comment of comments) {
    if (comment.parentId === null) continue;
    const parent = rootMap.get(comment.parentId);
    if (!parent) continue;
    parent.children.push(comment);
    parent.children.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  return roots;
}

export function canManageByAuthorId(authorId: number, viewerId: number | null) {
  return viewerId !== null && authorId === viewerId;
}

export function paginate(rawPage: string | undefined, take: number) {
  const page = Math.max(1, Number(rawPage) || 1);
  return {
    page,
    take,
    skip: (page - 1) * take,
  };
}
