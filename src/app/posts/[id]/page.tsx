import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePostAction } from "@/app/actions";
import { CommentThread } from "@/components/comment-thread";
import { PostSocial } from "@/components/social-buttons";
import { Attachments } from "@/components/attachments";
import { ReportButton } from "@/components/report-button";
import { getPostDetail, isPostLikedByUser, isBookmarkedByUser, incrementViewCount } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
};

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

  await incrementViewCount(postId);
  const isAuthor = viewer?.id === post.authorId;
  const deleteAction = deletePostAction.bind(null, post.id);

  const [isLiked, isBookmarked] = viewer
    ? await Promise.all([isPostLikedByUser(post.id, viewer.id), isBookmarkedByUser(post.id, viewer.id)])
    : [false, false];

  const categoryName = post.category ? post.category.name : "자유게시판";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{categoryName} &gt; 글 상세</p>
            {post.category && (
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[post.category.color] ?? "bg-slate-100 text-slate-600"}`}>
                {post.category.name}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{post.title}</h1>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
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
          ) : (
            <ReportButton targetType="post" targetId={post.id} isLoggedIn={!!viewer} />
          )}
        </div>

        <div className="mt-6">
          <PostSocial
            postId={post.id}
            likeCount={post.likeCount ?? 0}
            viewCount={post.viewCount}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            isLoggedIn={!!viewer}
          />
        </div>

        <div className="mt-8 whitespace-pre-wrap rounded-3xl bg-slate-50 px-5 py-6 text-base leading-8 text-slate-700">
          {post.content}
        </div>

        {post.attachments && post.attachments.length > 0 && (
          <Attachments attachments={post.attachments} />
        )}

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
