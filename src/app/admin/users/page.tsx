import { redirect } from "next/navigation";
import Link from "next/link";

import { getAllUsers } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type UsersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    redirect("/");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { users, total, totalPages } = await getAllUsers(currentPage);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">회원</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">글</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">댓글</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">권한</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">가입일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                      {user.nickname.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.nickname}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-600">
                  {user._count.posts}
                </td>
                <td className="px-6 py-4 text-center text-sm text-slate-600">
                  {user._count.comments}
                </td>
                <td className="px-6 py-4 text-center">
                  {user.isAdmin ? (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">관리자</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">회원</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?page=${p}`}
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
