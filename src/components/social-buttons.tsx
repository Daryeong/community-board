"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { likePostAction, bookmarkPostAction, likeCommentAction } from "@/app/actions";

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg className={`h-5 w-5 ${filled ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled?: boolean }) {
  return (
    <svg className={`h-5 w-5 ${filled ? "fill-blue-500 text-blue-500" : "text-slate-400"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

type PostSocialProps = {
  postId: number;
  likeCount: number;
  viewCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isLoggedIn: boolean;
};

export function PostSocial({ postId, likeCount: initialLikeCount, viewCount, isLiked: initialIsLiked, isBookmarked: initialIsBookmarked, isLoggedIn }: PostSocialProps) {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const handleLike = () => {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      const result = await likePostAction(postId);
      if ("liked" in result) {
        setIsLiked(result.liked);
        setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
      }
    });
  };

  const handleBookmark = () => {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      const result = await bookmarkPostAction(postId);
      if ("bookmarked" in result) {
        setIsBookmarked(result.bookmarked);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <EyeIcon />
        <span>{viewCount.toLocaleString()}</span>
      </div>

      <button
        onClick={handleLike}
        disabled={!isLoggedIn}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
          isLiked ? "text-rose-500" : "text-slate-500 hover:bg-rose-50"
        } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <HeartIcon filled={isLiked} />
        <span>{likeCount.toLocaleString()}</span>
      </button>

      <button
        onClick={handleBookmark}
        disabled={!isLoggedIn}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
          isBookmarked ? "text-blue-500" : "text-slate-500 hover:bg-blue-50"
        } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <BookmarkIcon filled={isBookmarked} />
        <span>북마크</span>
      </button>
    </div>
  );
}

type CommentLikeProps = {
  commentId: number;
  likeCount: number;
  isLiked: boolean;
  isLoggedIn: boolean;
};

export function CommentLike({ commentId, likeCount: initialLikeCount, isLiked: initialIsLiked, isLoggedIn }: CommentLikeProps) {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleLike = () => {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      const result = await likeCommentAction(commentId);
      if ("liked" in result) {
        setIsLiked(result.liked);
        setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
      }
    });
  };

  if (likeCount === 0 && !isLiked) return null;

  return (
    <button
      onClick={handleLike}
      disabled={!isLoggedIn}
      className={`flex items-center gap-1 text-xs transition ${
        isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
      } ${!isLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <HeartIcon filled={isLiked} />
      <span>{likeCount}</span>
    </button>
  );
}
