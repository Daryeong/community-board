import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import {
  buildCommentTree,
  canManageByAuthorId,
  changePasswordSchema,
  commentSchema,
  loginSchema,
  paginate,
  postSchema,
  registerSchema,
} from "@/lib/board";

const POSTS_PER_PAGE = 10;

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { id: "asc" },
  });
}

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

export async function getPostList(rawPage?: string, rawQuery?: string, rawCategory?: string, rawTag?: string) {
  const query = rawQuery?.trim() ?? "";
  const categorySlug = rawCategory?.trim() ?? "";
  const tag = rawTag?.trim() ?? "";
  const { page, take, skip } = paginate(rawPage, POSTS_PER_PAGE);
  
  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { content: { contains: query } },
      { author: { nickname: { contains: query } } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (tag) {
    where.tags = { contains: `"${tag}"` };
  }

  const pinnedWhere = { ...where, isPinned: true };
  const noticeWhere = { ...where, isNotice: true };

  const [pinnedPosts, noticePosts, posts, total] = await Promise.all([
    prisma.post.findMany({
      where: pinnedWhere,
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true, title: true, content: true, tags: true, createdAt: true, isPinned: true, isNotice: true,
        author: { select: { nickname: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
    prisma.post.findMany({
      where: noticeWhere,
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true, title: true, content: true, tags: true, createdAt: true, isPinned: true, isNotice: true,
        author: { select: { nickname: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
    prisma.post.findMany({
      where: { ...where, isPinned: false, isNotice: false },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true, title: true, content: true, tags: true, createdAt: true, isPinned: true, isNotice: true,
        author: { select: { nickname: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const formatPosts = (items: typeof posts) => items.map((post) => ({
    ...post,
    contentPreview: post.content.slice(0, 100),
    tags: parseTags(post.tags),
  }));

  return {
    pinnedPosts: formatPosts(pinnedPosts),
    noticePosts: formatPosts(noticePosts),
    posts: formatPosts(posts),
    page,
    query,
    category: categorySlug,
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
      tags: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      author: {
        select: {
          nickname: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      attachments: {
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
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
          _count: {
            select: {
              likes: true,
            },
          },
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

  const mappedComments = post.comments.map((c) => ({ ...c, likeCount: c._count.likes }));

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    viewCount: post.viewCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorId: post.authorId,
    author: post.author,
    category: post.category,
    tags: parseTags(post.tags),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    attachments: post.attachments,
    comments: mappedComments,
    commentTree: buildCommentTree(mappedComments),
  };
}

export async function createPost(authorId: number, raw: unknown, attachments?: Array<{ filename: string; originalName: string; mimeType: string; size: number; url: string }>, categoryId?: number | null, tags?: string[]) {
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
      tags: JSON.stringify(tags || []),
      ...(categoryId && { categoryId }),
      ...(attachments && attachments.length > 0 && {
        attachments: {
          create: attachments.map((a) => ({
            filename: a.filename,
            originalName: a.originalName,
            mimeType: a.mimeType,
            size: a.size,
            url: a.url,
          })),
        },
      }),
    },
    select: { id: true },
  });

  return { ok: true as const, postId: post.id };
}

export async function updatePost(postId: number, viewerId: number, raw: unknown, categoryId?: number | null, attachments?: Array<{ filename: string; originalName: string; mimeType: string; size: number; url: string }>) {
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
    return { ok: false as const, message: "이 게시글의 작성자만 수정할 수 있습니다." };
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      ...parsed.data,
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
    },
  });

  if (attachments && attachments.length > 0) {
    await prisma.attachment.createMany({
      data: attachments.map((a) => ({
        filename: a.filename,
        originalName: a.originalName,
        mimeType: a.mimeType,
        size: a.size,
        url: a.url,
        postId,
      })),
    });
  }

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
    return { ok: false as const, message: "이 게시글의 작성자만 삭제할 수 있습니다." };
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

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId,
      authorId,
      parentId,
    },
  });

  return { ok: true as const, commentId: comment.id };
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
    return { ok: false as const, message: "이 댓글의 작성자만 수정할 수 있습니다." };
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
    return { ok: false as const, message: "이 댓글의 작성자만 삭제할 수 있습니다." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date(), content: "삭제된 댓글입니다." },
  });

  return { ok: true as const, postId: comment.postId };
}

export async function changePassword(userId: number, raw: unknown) {
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return { ok: false as const, message: "사용자를 찾을 수 없습니다." };
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { ok: false as const, message: "현재 비밀번호가 맞지 않습니다." };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { ok: true as const };
}

export async function getUserPosts(userId: number, page: number = 1) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: POSTS_PER_PAGE,
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where: { authorId: userId, deletedAt: null } }),
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / POSTS_PER_PAGE) };
}

export async function getUserComments(userId: number, page: number = 1) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: POSTS_PER_PAGE,
      include: {
        post: { select: { id: true, title: true } },
      },
    }),
    prisma.comment.count({ where: { authorId: userId, deletedAt: null } }),
  ]);

  return { comments, total, page, totalPages: Math.ceil(total / POSTS_PER_PAGE) };
}

export async function getUserStats(userId: number) {
  const [postsCount, commentsCount, likesReceived, bookmarksCount] = await Promise.all([
    prisma.post.count({ where: { authorId: userId, deletedAt: null } }),
    prisma.comment.count({ where: { authorId: userId, deletedAt: null } }),
    prisma.postLike.count({ where: { post: { authorId: userId } } }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  return { postsCount, commentsCount, likesReceived, bookmarksCount };
}

export async function getUserActivity(userId: number) {
  const [recentPosts, recentComments] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.comment.findMany({
      where: { authorId: userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        post: { select: { id: true, title: true } },
        _count: { select: { likes: true } },
      },
    }),
  ]);

  return { recentPosts, recentComments };
}

export async function updateUserProfile(userId: number, raw: unknown) {
  const schema = require("@/lib/board").updateProfileSchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { nickname, email, avatarUrl } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email, NOT: { id: userId } },
        { nickname, NOT: { id: userId } },
      ],
    },
  });

  if (existing?.email === email) {
    return { ok: false as const, message: "이미 사용 중인 이메일입니다." };
  }
  if (existing?.nickname === nickname) {
    return { ok: false as const, message: "이미 사용 중인 닉네임입니다." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { nickname, email, avatarUrl },
  });

  return { ok: true as const };
}

export async function deleteAccount(userId: number, raw: unknown) {
  const schema = require("@/lib/board").deleteAccountSchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return { ok: false as const, message: "사용자를 찾을 수 없습니다." };
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return { ok: false as const, message: "비밀번호가 맞지 않습니다." };
  }

  // Delete all related data (cascade will handle most, but explicitly delete sessions)
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.comment.deleteMany({ where: { authorId: userId } });
  await prisma.post.deleteMany({ where: { authorId: userId } });
  await prisma.actionLog.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return { ok: true as const };
}

export async function incrementViewCount(postId: number) {
  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getUserBookmarks(userId: number, page: number = 1) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: POSTS_PER_PAGE,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            author: { select: { nickname: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  const posts = bookmarks.map((b) => b.post);
  return { posts, total, page, totalPages: Math.ceil(total / POSTS_PER_PAGE) };
}

export async function togglePostLike(postId: number, userId: number) {
  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return { liked: false as const };
  }

  await prisma.postLike.create({ data: { userId, postId } });
  return { liked: true as const };
}

export async function getPostLikeCount(postId: number) {
  return prisma.postLike.count({ where: { postId } });
}

export async function isPostLikedByUser(postId: number, userId: number) {
  const like = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  return !!like;
}

export async function toggleBookmark(postId: number, userId: number) {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false as const };
  }

  await prisma.bookmark.create({ data: { userId, postId } });
  return { bookmarked: true as const };
}

export async function isBookmarkedByUser(postId: number, userId: number) {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  return !!bookmark;
}

export async function getBookmarkCount(postId: number) {
  return prisma.bookmark.count({ where: { postId } });
}

export async function toggleCommentLike(commentId: number, userId: number) {
  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    return { liked: false as const };
  }

  await prisma.commentLike.create({ data: { userId, commentId } });
  return { liked: true as const };
}

export async function getCommentLikeCount(commentId: number) {
  return prisma.commentLike.count({ where: { commentId } });
}

export async function isCommentLikedByUser(commentId: number, userId: number) {
  const like = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
  return !!like;
}

export async function createNotification(type: string, userId: number, actorId: number, postId: number, commentId?: number) {
  if (userId === actorId) return;

  await prisma.notification.create({
    data: { type, userId, actorId, postId, commentId },
  });
}

export async function getUnreadNotificationCount(userId: number) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function getUserNotifications(userId: number, page: number = 1) {
  const skip = (page - 1) * 20;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: 20,
      include: {
        actor: { select: { nickname: true } },
      },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { notifications, total, page, totalPages: Math.ceil(total / 20) };
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsAsRead(userId: number) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getAllUsers(page: number = 1) {
  const skip = (page - 1) * 20;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: 20,
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / 20) };
}

export async function getAllPosts(page: number = 1) {
  const skip = (page - 1) * 20;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: 20,
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: { nickname: true } },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where: { deletedAt: null } }),
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / 20) };
}

export async function adminDeletePost(postId: number) {
  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });
}

export async function adminDeleteComment(commentId: number) {
  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
}

export async function setUserAdmin(userId: number, isAdmin: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  });
}

export async function updateNotificationSettings(userId: number, settings: { notifyComment?: boolean; notifyLike?: boolean }) {
  await prisma.user.update({
    where: { id: userId },
    data: settings,
  });
}

export async function getRecentPosts(limit: number = 5) {
  return prisma.post.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      createdAt: true,
      category: { select: { name: true, color: true } },
    },
  });
}

export async function createBookmarkFolder(userId: number, name: string) {
  return prisma.bookmarkFolder.create({
    data: { userId, name },
  });
}

export async function getBookmarkFolders(userId: number) {
  return prisma.bookmarkFolder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookmarks: true } },
    },
  });
}

export async function deleteBookmarkFolder(folderId: number, userId: number) {
  await prisma.bookmarkFolder.deleteMany({
    where: { id: folderId, userId },
  });
}

export async function moveBookmarkToFolder(bookmarkId: number, folderId: number | null, userId: number) {
  await prisma.bookmark.updateMany({
    where: { id: bookmarkId, userId },
    data: { folderId },
  });
}

export async function getUserBookmarksWithFolders(userId: number, folderId?: number) {
  const where = { userId };
  if (folderId) {
    (where as Record<string, unknown>).folderId = folderId;
  }
  
  return prisma.bookmark.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: { select: { nickname: true } },
          category: { select: { name: true, slug: true, color: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
      folder: { select: { id: true, name: true } },
    },
  });
}

export function parseTags(tagsJson: string): string[] {
  try {
    const tags = JSON.parse(tagsJson);
    return Array.isArray(tags) ? tags : [];
  } catch {
    return [];
  }
}

export async function createReport(
  reporterId: number,
  targetType: "post" | "comment",
  targetId: number,
  reason: string,
  description?: string
) {
  let targetUserId: number | null = null;
  if (targetType === "post") {
    const post = await prisma.post.findUnique({ where: { id: targetId }, select: { authorId: true } });
    targetUserId = post?.authorId ?? null;
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: targetId }, select: { authorId: true } });
    targetUserId = comment?.authorId ?? null;
  }

  return prisma.report.create({
    data: { targetType, targetId, reason, description, reporterId, targetUserId },
  });
}

export async function getReports(status: string = "pending", page: number = 1) {
  const skip = (page - 1) * 20;
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      skip,
      take: 20,
      include: {
        reporter: { select: { nickname: true } },
        target: { select: { nickname: true } },
      },
    }),
    prisma.report.count({ where: { status } }),
  ]);
  return { reports, total, page, totalPages: Math.ceil(total / 20) };
}

export async function resolveReport(reportId: number, status: "resolved" | "dismissed") {
  return prisma.report.update({
    where: { id: reportId },
    data: { status, resolvedAt: new Date() },
  });
}

export async function blockUser(blockerId: number, blockedId: number) {
  return prisma.userBlock.create({ data: { blockerId, blockedId } });
}

export async function unblockUser(blockerId: number, blockedId: number) {
  return prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
}

export async function isBlocked(userId: number, targetId: number) {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: targetId },
        { blockerId: targetId, blockedId: userId },
      ],
    },
  });
  return !!block;
}

export async function suspendUser(userId: number, suspendedUntil: Date) {
  return prisma.user.update({
    where: { id: userId },
    data: { suspendedUntil },
  });
}

export async function getBlockedUsers(userId: number) {
  return prisma.userBlock.findMany({
    where: { blockerId: userId },
    include: { blocked: { select: { id: true, nickname: true } } },
  });
}

export async function restorePost(postId: number, adminId: number) {
  const user = await prisma.user.findUnique({ where: { id: adminId }, select: { isAdmin: true } });
  if (!user?.isAdmin) throw new Error("관리자만 복구할 수 있습니다.");
  
  return prisma.post.update({
    where: { id: postId },
    data: { deletedAt: null },
  });
}

export async function restoreComment(commentId: number, adminId: number) {
  const user = await prisma.user.findUnique({ where: { id: adminId }, select: { isAdmin: true } });
  if (!user?.isAdmin) throw new Error("관리자만 복구할 수 있습니다.");
  
  return prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: null },
  });
}

export async function getDeletedPosts(page: number = 1) {
  const skip = (page - 1) * 20;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      skip,
      take: 20,
      select: {
        id: true,
        title: true,
        deletedAt: true,
        author: { select: { nickname: true } },
      },
    }),
    prisma.post.count({ where: { deletedAt: { not: null } } }),
  ]);
  return { posts, total, page, totalPages: Math.ceil(total / 20) };
}

export async function getAdminStats() {
  const [users, posts, comments, reports] = await Promise.all([
    prisma.user.count(),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.report.count({ where: { status: "pending" } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayPosts, todayComments, todayUsers] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gte: today } } }),
    prisma.comment.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
  ]);

  const topPosts = await prisma.post.findMany({
    where: { deletedAt: null },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      viewCount: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  return {
    total: { users, posts, comments, reports },
    today: { posts: todayPosts, comments: todayComments, users: todayUsers },
    topPosts,
  };
}

export async function togglePinPost(postId: number, isPinned: boolean) {
  return prisma.post.update({
    where: { id: postId },
    data: { isPinned },
  });
}

export async function toggleNoticePost(postId: number, isNotice: boolean) {
  return prisma.post.update({
    where: { id: postId },
    data: { isNotice },
  });
}
