import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserComments } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type MyCommentsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function MyCommentsPage({ searchParams }: MyCommentsPageProps) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fcomments");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { comments, total, totalPages } = await getUserComments(viewer.id, currentPage);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">내가 쓴 댓글</h1>
        <p className="mt-2 text-sm text-slate-500">총 {total}개의 댓글</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">게시글</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">댓글 내용</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {comments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  작성한 댓글이 없습니다.
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link href={`/posts/${comment.post.id}`} className="text-sm font-medium text-slate-900 hover:text-[var(--color-primary)]">
                      {comment.post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{comment.content}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {formatDate(comment.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/mypage/comments?page=${p}`}
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