import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCommentAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { getPostDetail } from "@/lib/board-data";
import { getViewer } from "@/lib/session";

type EditCommentPageProps = {
  params: Promise<{ id: string; commentId: string }>;
};

export default async function EditCommentPage({ params }: EditCommentPageProps) {
  const { id, commentId } = await params;
  const parsedPostId = Number(id);
  const parsedCommentId = Number(commentId);
  if (Number.isNaN(parsedPostId) || Number.isNaN(parsedCommentId)) notFound();

  const [post, viewer] = await Promise.all([getPostDetail(parsedPostId), getViewer()]);
  if (!post) notFound();

  const flatComments = post.comments;
  type FlatComment = (typeof flatComments)[number];
  const comment = flatComments.find((item: FlatComment) => item.id === parsedCommentId);
  if (!comment) notFound();

  if (comment.deletedAt) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Notice message="삭제된 댓글은 수정할 수 없습니다." tone="error" />
        <Link href={`/posts/${parsedPostId}`} className="inline-flex rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
          글 상세로 돌아가기
        </Link>
      </div>
    );
  }

  if (!viewer || viewer.id !== comment.authorId) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Notice message="작성자만 이 댓글을 수정할 수 있습니다." tone="error" />
        <Link href={`/posts/${parsedPostId}`} className="inline-flex rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
          글 상세로 돌아가기
        </Link>
      </div>
    );
  }

  const boundAction = updateCommentAction.bind(null, parsedCommentId);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">댓글 수정</h1>
        <p className="mt-2 text-sm text-slate-500">기존 댓글을 수정한 뒤 저장하면 게시글 상세로 돌아갑니다.</p>
      </div>

      <form action={boundAction} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="postId" value={parsedPostId} />
        <textarea
          name="content"
          defaultValue={comment.content}
          rows={6}
          required
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
        />
        <div className="flex items-center justify-between">
          <Link href={`/posts/${parsedPostId}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
            취소
          </Link>
          <button type="submit" className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white">
            수정완료
          </button>
        </div>
      </form>
    </div>
  );
}
