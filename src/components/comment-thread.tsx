import Link from "next/link";

import { createCommentAction, deleteCommentAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { formatDate } from "@/lib/utils";

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
};

function CommentForm({ postId, parentId }: { postId: number; parentId: number | null }) {
  const action = createCommentAction.bind(null, postId, parentId);

  return (
    <form action={action} className="space-y-3">
      <textarea
        name="content"
        rows={parentId ? 3 : 4}
        required
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
        placeholder={parentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
      />
      <div className="flex justify-end">
        <button type="submit" className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white">
          {parentId ? "답글 등록" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}

function CommentActions({
  commentId,
  postId,
  isAuthor,
  editHref,
}: {
  commentId: number;
  postId: number;
  isAuthor: boolean;
  editHref: string;
}) {
  if (!isAuthor) return null;

  const deleteAction = deleteCommentAction.bind(null, commentId, postId);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Link href={editHref} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600">
        수정
      </Link>
      <form action={deleteAction}>
        <button type="submit" className="rounded-lg border border-rose-200 px-3 py-1.5 text-rose-600">
          삭제
        </button>
      </form>
    </div>
  );
}

export function CommentThread({ postId, comments, viewer, notice }: CommentThreadProps) {
  const totalComments = comments.reduce((count, comment) => count + 1 + comment.children.length, 0);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">댓글 {totalComments}</h2>
      </div>

      {notice ? <Notice message={notice} tone="info" /> : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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

          return (
            <article key={comment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{comment.author.nickname}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                </div>
                <CommentActions
                  commentId={comment.id}
                  postId={postId}
                  isAuthor={canManage}
                  editHref={`/posts/${postId}/comments/${comment.id}/edit`}
                />
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.deletedAt ? "삭제된 댓글입니다." : comment.content}</p>

              {!comment.deletedAt ? (
                <div className="mt-4">
                  {viewer ? (
                    <details className="group rounded-2xl bg-slate-50 p-4">
                      <summary className="cursor-pointer list-none text-sm font-medium text-[var(--color-primary)]">답글 작성</summary>
                      <div className="mt-4">
                        <CommentForm postId={postId} parentId={comment.id} />
                      </div>
                    </details>
                  ) : null}
                </div>
              ) : null}

              {comment.children.length > 0 ? (
                <div className="mt-4 space-y-3 border-l border-slate-200 pl-4 sm:pl-6">
                  {comment.children.map((reply) => {
                    const canManageReply = viewer?.id === reply.authorId;
                    return (
                      <div key={reply.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{reply.author.nickname}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(reply.createdAt)}</p>
                          </div>
                          <CommentActions
                            commentId={reply.id}
                            postId={postId}
                            isAuthor={canManageReply}
                            editHref={`/posts/${postId}/comments/${reply.id}/edit`}
                          />
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{reply.deletedAt ? "삭제된 댓글입니다." : reply.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
