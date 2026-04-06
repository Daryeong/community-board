import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserPosts } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type MyPostsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function MyPostsPage({ searchParams }: MyPostsPageProps) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fposts");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { posts, total, totalPages } = await getUserPosts(viewer.id, currentPage);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">내가 쓴 글</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">작성한 게시글을 시간 순서대로 모아보고, 반응 수를 빠르게 확인할 수 있습니다.</p>
        <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">총 {total}개</div>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          작성한 글이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-slate-900">{post.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">댓글 {post._count.comments}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">작성일 {formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-slate-400">detail</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/mypage/posts?page=${p}`}
              className={`rounded-lg px-3 py-1 text-sm ${p === currentPage ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
