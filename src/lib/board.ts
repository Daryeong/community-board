import { z } from "zod";

const trimmed = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label}을 입력해주세요.`);

const FORBIDDEN_NICKNAMES = ["admin", "관리자", "운영자", "system", "root", "test"];
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

export const registerSchema = z.object({
  username: trimmed("아이디")
    .min(4, "아이디는 4자 이상이어야 합니다.")
    .max(20, "아이디는 20자 이하여야 합니다.")
    .regex(/^[a-zA-Z0-9_]+$/, "아이디는 영문, 숫자, 언더스코어만 가능합니다."),
  nickname: trimmed("닉네임")
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(15, "닉네임은 15자 이하여야 합니다.")
    .refine((v) => !FORBIDDEN_NICKNAMES.includes(v.toLowerCase()), "사용할 수 없는 닉네임입니다."),
  email: z.email("올바른 이메일을 입력해주세요.").trim(),
  password: z
    .string()
    .trim()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(72, "비밀번호는 72자 이하여야 합니다."),
});

export const loginSchema = z.object({
  identifier: trimmed("아이디 또는 이메일").max(100),
  password: trimmed("비밀번호").max(72),
});

export const postSchema = z.object({
  title: trimmed("제목")
    .min(2, "제목은 2자 이상이어야 합니다.")
    .max(100, "제목은 100자 이하로 입력해주세요."),
  content: trimmed("내용")
    .min(1, "내용을 입력해주세요.")
    .max(10000, "내용은 10000자 이하로 입력해주세요."),
});

export const tagsSchema = z.array(
  z.string()
    .trim()
    .min(1)
    .max(MAX_TAG_LENGTH, `태그는 ${MAX_TAG_LENGTH}자 이하여야 합니다.`)
    .regex(/^[가-힣a-zA-Z0-9]+$/, "태그는 한글, 영문, 숫자만 가능합니다.")
).max(MAX_TAGS, `태그는 ${MAX_TAGS}개 이하만 가능합니다.`).default([]);

export const commentSchema = z.object({
  content: trimmed("댓글")
    .min(1, "댓글을 입력해주세요.")
    .max(1000, "댓글은 1000자 이하로 입력해주세요."),
});

export const changePasswordSchema = z.object({
  currentPassword: trimmed("현재 비밀번호").max(72),
  newPassword: z
    .string()
    .trim()
    .min(8, "새 비밀번호는 8자 이상이어야 합니다.")
    .max(72, "비밀번호는 72자 이하여야 합니다."),
});

export const updateProfileSchema = z.object({
  nickname: trimmed("닉네임")
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(15, "닉네임은 15자 이하여야 합니다.")
    .refine((v) => !FORBIDDEN_NICKNAMES.includes(v.toLowerCase()), "사용할 수 없는 닉네임입니다."),
  email: z.email("올바른 이메일을 입력해주세요.").trim(),
  bio: z.string().trim().max(60, "소개는 60자 이하여야 합니다.").optional().default(""),
  profileTheme: z.enum(["ocean", "sunset", "forest", "violet"]).optional().default("ocean"),
  avatarUrl: z.string().nullable().optional(),
});

export const deleteAccountSchema = z.object({
  password: trimmed("비밀번호").max(72),
});

export const searchSchema = z.object({
  query: z.string().trim().max(50, "검색어는 50자 이하로 입력해주세요.").optional(),
  page: z.number().min(1).max(100).optional(),
});

export { MAX_TAGS, MAX_TAG_LENGTH };

type CommentNodeInput = {
  id: number;
  parentId: number | null;
  content: string;
  deletedAt: Date | null;
  createdAt: Date;
  authorId: number;
  likeCount?: number;
  author: {
    nickname: string;
  };
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
  const page = Math.min(Math.max(1, Number(rawPage) || 1), 100);
  return {
    page,
    take,
    skip: (page - 1) * take,
  };
}

export function sanitizeSearchQuery(query: string | undefined): string {
  if (!query) return "";
  return query.trim().slice(0, 50);
}
