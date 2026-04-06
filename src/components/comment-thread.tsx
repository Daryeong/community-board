"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { createCommentAction, deleteCommentAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { CommentLike } from "@/components/social-buttons";
import { formatRelativeTime } from "@/lib/utils";

type Viewer = {
  id: number;
  nickname: string;
} | null;

type CommentNode = {
  id: number;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
  parentId: number | null;
  authorId: number;
  likeCount?: number;
  author: {
    nickname: string;
  };
  children: Array<{
    id: number;
    content: string;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
    authorId: number;
    likeCount?: number;
    author: {
      nickname: string;
    };
  }>;
};

type CommentThreadProps = {
  postId: number;
  comments: CommentNode[];
  viewer: Viewer;
  notice?: string;
  highlightedCommentId?: number;
};

function Avatar({ nickname }: { nickname: string }) {
  const initial = nickname.charAt(0).toUpperCase();
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];
  const colorIndex = nickname.charCodeAt(0) % colors.length;
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors[colorIndex]} text-sm font-medium text-white`}>
      {initial}
    </div>
  );
}

function CommentForm({ postId, parentId, onCancel }: { postId: number; parentId: number | null; onCancel?: () => void }) {
  const action = createCommentAction.bind(null, postId, parentId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [contentLength, setContentLength] = useState(0);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [contentLength]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentLength(event.target.value.length);
  };

  return (
    <form action={action} className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">{parentId ? "답글 작성" : "댓글 작성"}</p>
        <span className={`text-xs ${contentLength > 900 ? "text-amber-600" : "text-slate-400"}`}>
          {contentLength}/1000
        </span>
      </div>
      <textarea
        ref={textareaRef}
        name="content"
        rows={parentId ? 6 : 8}
        maxLength={1000}
        required
        onChange={handleChange}
        className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
        placeholder={parentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">예의 있는 표현으로 대화를 이어가 주세요.</p>
        <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            취소
          </button>
        )}
        <button type="submit" className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          {parentId ? "답글 등록" : "댓글 등록"}
        </button>
        </div>
      </div>
    </form>
  );
}

function CommentActions({ commentId, postId, isAuthor, editHref }: { commentId: number; postId: number; isAuthor: boolean; editHref: string }) {
  if (!isAuthor) return null;
  const deleteAction = deleteCommentAction.bind(null, commentId, postId);
  return (
    <div className="flex items-center gap-2 text-xs">
      <Link href={editHref} className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
        수정
      </Link>
      <form action={deleteAction}>
        <button type="submit" className="rounded-lg px-2 py-1 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600">
          삭제
        </button>
      </form>
    </div>
  );
}

function ReplyIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function ReplyFormToggle({ postId, parentId }: { postId: number; parentId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
        <ReplyIcon />
        답글 작성
      </button>
    );
  }
  return (
    <div className="mt-3 animate-fadeIn">
      <CommentForm postId={postId} parentId={parentId} onCancel={() => setIsOpen(false)} />
    </div>
  );
}

function ReplyToggle({ count, children }: { count: number; children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(count <= 3);

  if (count === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-200 hover:text-[var(--color-primary)]"
      >
        <svg
          className={`h-4 w-4 transition ${isExpanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        답글 {count}개 {isExpanded ? "접기" : "펼치기"}
      </button>
      {isExpanded && children}
    </div>
  );
}

function DeletedComment() {
  return <div className="rounded-2xl bg-slate-100 p-4"><p className="text-sm italic text-slate-400">삭제된 댓글입니다.</p></div>;
}

export function CommentThread({ postId, comments, viewer, notice, highlightedCommentId }: CommentThreadProps) {
  const totalComments = comments.reduce((count, comment) => count + 1 + comment.children.length, 0);

  useEffect(() => {
    if (!highlightedCommentId) return;

    const element = document.getElementById(`comment-${highlightedCommentId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("ring-2", "ring-[var(--color-primary)]", "ring-offset-2", "bg-blue-50");

    const timeout = window.setTimeout(() => {
      element.classList.remove("ring-2", "ring-[var(--color-primary)]", "ring-offset-2", "bg-blue-50");
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [highlightedCommentId]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">댓글 <span className="text-[var(--color-primary)]">{totalComments}</span></h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">대화 참여</span>
      </div>

      {notice ? <Notice message={notice} tone="info" /> : null}

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        {viewer ? (
          <CommentForm postId={postId} parentId={null} />
        ) : (
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>댓글 작성은 로그인 후 가능합니다.</p>
            <div className="flex gap-2">
              <Link href={`/login?next=${encodeURIComponent(`/posts/${postId}`)}`} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 font-medium text-white">
                로그인하기
              </Link>
              <Link href={`/register?next=${encodeURIComponent(`/posts/${postId}`)}`} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700">
                회원가입
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
          </div>
        ) : null}

        {comments.map((comment) => {
          const canManage = viewer?.id === comment.authorId;
          const isDeleted = comment.deletedAt !== null;

          return (
            <article id={`comment-${comment.id}`} key={comment.id} className={`group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${isDeleted ? "bg-slate-50" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar nickname={comment.author.nickname} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isDeleted ? "text-slate-400" : "text-slate-900"}`}>{comment.author.nickname}</p>
                      {viewer?.id === comment.authorId ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">내 댓글</span> : null}
                    </div>
                    <p className="text-xs text-slate-500">{formatRelativeTime(comment.createdAt)}</p>
                  </div>
                </div>
                {!isDeleted && <CommentActions commentId={comment.id} postId={postId} isAuthor={canManage} editHref={`/posts/${postId}/comments/${comment.id}/edit`} />}
              </div>

              {isDeleted ? <DeletedComment /> : <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.content}</p>}

              {!isDeleted && (
                <div className="mt-4 flex items-center gap-3">
                  {viewer && <ReplyFormToggle postId={postId} parentId={comment.id} />}
                  <CommentLike commentId={comment.id} likeCount={comment.likeCount ?? 0} isLiked={false} isLoggedIn={!!viewer} />
                </div>
              )}

              {comment.children.length > 0 && (
                <ReplyToggle count={comment.children.length}>
                  <div className="mt-3 space-y-3 border-l-2 border-[var(--color-primary)]/20 pl-4 sm:pl-6">
                    {comment.children.map((reply) => {
                    const canManageReply = viewer?.id === reply.authorId;
                    const isReplyDeleted = reply.deletedAt !== null;
                    return (
                      <div id={`comment-${reply.id}`} key={reply.id} className={`group rounded-2xl border border-slate-200 p-4 transition ${isReplyDeleted ? "bg-slate-100" : "bg-slate-50 hover:bg-slate-100"}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar nickname={reply.author.nickname} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${isReplyDeleted ? "text-slate-400" : "text-slate-900"}`}>{reply.author.nickname}</p>
                                {viewer?.id === reply.authorId ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">내 답글</span> : null}
                              </div>
                              <p className="text-xs text-slate-500">{formatRelativeTime(reply.createdAt)}</p>
                            </div>
                          </div>
                          {!isReplyDeleted && <CommentActions commentId={reply.id} postId={postId} isAuthor={canManageReply} editHref={`/posts/${postId}/comments/${reply.id}/edit`} />}
                        </div>
                        {isReplyDeleted ? <p className="mt-3 text-sm italic text-slate-400">삭제된 댓글입니다.</p> : (
                          <>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{reply.content}</p>
                            <div className="mt-2">
                              <CommentLike commentId={reply.id} likeCount={reply.likeCount ?? 0} isLiked={false} isLoggedIn={!!viewer} />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </ReplyToggle>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
