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

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AuthorIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 0116 0" />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; comment?: string }>;
};

export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const [{ id }, { notice, comment }] = await Promise.all([params, searchParams]);
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
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">{categoryName} &gt; 글 상세</p>
            {post.category && (
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${colorClasses[post.category.color] ?? "bg-slate-100 text-slate-600"}`}>
                {post.category.name}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-[2rem]">{post.title}</h1>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <AuthorIcon />
                {post.author.nickname}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <CalendarIcon />
                {formatDate(post.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                <ViewIcon />
                조회 {post.viewCount}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:flex-col lg:items-stretch">
            {isAuthor ? (
              <>
                <Link href={`/posts/${post.id}/edit`} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm text-slate-700 transition hover:bg-slate-50">
                  수정
                </Link>
                <form action={deleteAction}>
                  <button type="submit" className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm text-rose-600 transition hover:bg-rose-50">
                    삭제
                  </button>
                </form>
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <ReportButton targetType="post" targetId={post.id} isLoggedIn={!!viewer} />
              </div>
            )}
            <Link href="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm text-slate-700 transition hover:bg-slate-50">
              목록으로
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
          <PostSocial
            postId={post.id}
            likeCount={post.likeCount ?? 0}
            viewCount={post.viewCount}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            isLoggedIn={!!viewer}
          />
        </div>

        <div className="mt-8 whitespace-pre-wrap rounded-[1.75rem] border border-slate-200 bg-white px-5 py-6 text-base leading-8 text-slate-700 shadow-sm sm:px-6">
          {post.content}
        </div>

        {post.attachments && post.attachments.length > 0 && (
          <Attachments attachments={post.attachments} />
        )}
      </section>

      <CommentThread postId={post.id} comments={post.commentTree} viewer={viewer} notice={notice} highlightedCommentId={comment ? Number(comment) : undefined} />
    </div>
  );
}
