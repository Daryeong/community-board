import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import {
  buildCommentTree,
  canManageByAuthorId,
  commentSchema,
  loginSchema,
  paginate,
  postSchema,
  registerSchema,
} from "@/lib/board";

const POSTS_PER_PAGE = 10;

export async function registerUser(raw: unknown) {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { username, nickname, email, password } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
    select: { username: true, email: true },
  });

  if (existing) {
    return {
      ok: false as const,
      errors: {
        ...(existing.username === username
          ? { username: ["이미 사용 중인 아이디입니다."] }
          : {}),
        ...(existing.email === email ? { email: ["이미 사용 중인 이메일입니다."] } : {}),
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      nickname,
      email,
      passwordHash,
    },
    select: { id: true },
  });

  return { ok: true as const, userId: user.id };
}

export async function loginUser(raw: unknown) {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { identifier, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    return {
      ok: false as const,
      message: "아이디 또는 비밀번호를 확인해주세요.",
    };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return {
      ok: false as const,
      message: "아이디 또는 비밀번호를 확인해주세요.",
    };
  }

  return {
    ok: true as const,
    userId: user.id,
  };
}

export async function getPostList(rawPage?: string, rawQuery?: string) {
  const query = rawQuery?.trim() ?? "";
  const { page, take, skip } = paginate(rawPage, POSTS_PER_PAGE);
  const where = {
    deletedAt: null,
    ...(query
      ? {
          title: {
            contains: query,
          },
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            nickname: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    page,
    query,
    totalPages: Math.max(1, Math.ceil(total / take)),
  };
}

export async function getPostDetail(postId: number) {
  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      author: {
        select: {
          nickname: true,
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          deletedAt: true,
          parentId: true,
          authorId: true,
          author: {
            select: {
              nickname: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  return {
    ...post,
    commentTree: buildCommentTree(post.comments),
  };
}

export async function createPost(authorId: number, raw: unknown) {
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId,
    },
    select: { id: true },
  });

  return { ok: true as const, postId: post.id };
}

export async function updatePost(postId: number, viewerId: number, raw: unknown) {
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, deletedAt: true },
  });

  if (!post || post.deletedAt) {
    return { ok: false as const, message: "존재하지 않는 게시글입니다." };
  }

  if (!canManageByAuthorId(post.authorId, viewerId)) {
    return { ok: false as const, message: "작성자만 수정할 수 있습니다." };
  }

  await prisma.post.update({
    where: { id: postId },
    data: parsed.data,
  });

  return { ok: true as const };
}

export async function deletePost(postId: number, viewerId: number) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, deletedAt: true },
  });

  if (!post || post.deletedAt) {
    return { ok: false as const, message: "존재하지 않는 게시글입니다." };
  }

  if (!canManageByAuthorId(post.authorId, viewerId)) {
    return { ok: false as const, message: "작성자만 삭제할 수 있습니다." };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  return { ok: true as const };
}

export async function createComment(postId: number, authorId: number, parentId: number | null, raw: unknown) {
  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null },
    select: { id: true },
  });

  if (!post) {
    return { ok: false as const, message: "존재하지 않는 게시글입니다." };
  }

  if (parentId !== null) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, postId, deletedAt: null, parentId: null },
      select: { id: true },
    });

    if (!parent) {
      return { ok: false as const, message: "답글을 달 수 없는 댓글입니다." };
    }
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId,
      authorId,
      parentId,
    },
  });

  return { ok: true as const };
}

export async function updateComment(commentId: number, viewerId: number, raw: unknown) {
  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true, deletedAt: true },
  });

  if (!comment || comment.deletedAt) {
    return { ok: false as const, message: "존재하지 않는 댓글입니다." };
  }

  if (!canManageByAuthorId(comment.authorId, viewerId)) {
    return { ok: false as const, message: "작성자만 수정할 수 있습니다." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content: parsed.data.content },
  });

  return { ok: true as const, postId: comment.postId };
}

export async function deleteComment(commentId: number, viewerId: number) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true, deletedAt: true },
  });

  if (!comment || comment.deletedAt) {
    return { ok: false as const, message: "존재하지 않는 댓글입니다." };
  }

  if (!canManageByAuthorId(comment.authorId, viewerId)) {
    return { ok: false as const, message: "작성자만 삭제할 수 있습니다." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date(), content: "삭제된 댓글입니다." },
  });

  return { ok: true as const, postId: comment.postId };
}
