import { redirect } from "next/navigation";
import Link from "next/link";

import { getAllPosts, adminDeletePost } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type PostsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    redirect("/");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { posts, total, totalPages } = await getAllPosts(currentPage);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">게시글 관리</h2>
            <p className="mt-1 text-sm text-slate-500">문제 게시글을 빠르게 정리하고 반응 수치를 함께 확인할 수 있습니다.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">총 {total}개</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">글</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">작성자</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">댓글</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">좋아요</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">작성일</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <Link href={`/posts/${post.id}`} className="text-sm font-medium text-slate-900 hover:text-[var(--color-primary)]">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-600">
                  {post.author.nickname}
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-600">
                  {post._count.comments}
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-600">
                  {post._count.likes}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async () => {
                    "use server";
                    await adminDeletePost(post.id);
                  }}>
                    <button type="submit" className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/posts?page=${p}`}
              className={`rounded-lg px-3 py-1 text-sm ${
                p === currentPage
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
