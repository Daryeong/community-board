import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePostAction } from "@/app/actions";
import { CommentThread } from "@/components/comment-thread";
import { getPostDetail } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const [{ id }, { notice }] = await Promise.all([params, searchParams]);
  const postId = Number(id);
  if (Number.isNaN(postId)) notFound();

  const [post, viewer] = await Promise.all([getPostDetail(postId), getViewer()]);

  if (!post) {
    notFound();
  }

  const isAuthor = viewer?.id === post.authorId;
  const deleteAction = deletePostAction.bind(null, post.id);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">자유게시판 &gt; 글 상세</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{post.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>작성자: {post.author.nickname}</span>
              <span>작성일: {formatDate(post.createdAt)}</span>
            </div>
          </div>

          {isAuthor ? (
            <div className="flex items-center gap-2">
              <Link href={`/posts/${post.id}/edit`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
                수정
              </Link>
              <form action={deleteAction}>
                <button type="submit" className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600">
                  삭제
                </button>
              </form>
            </div>
          ) : null}
        </div>

        <div className="mt-8 whitespace-pre-wrap rounded-3xl bg-slate-50 px-5 py-6 text-base leading-8 text-slate-700">
          {post.content}
        </div>

        <div className="mt-6 flex">
          <Link href="/" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
            목록으로
          </Link>
        </div>
      </section>

      <CommentThread postId={post.id} comments={post.commentTree} viewer={viewer} notice={notice} />
    </div>
  );
}
