import { redirect } from "next/navigation";
import Link from "next/link";

import { getAdminStats, getRecentPosts } from "@/lib/board-data";
import { getViewer } from "@/lib/session";

export default async function AdminPage() {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">총 회원</p>
          <p className="mt-1 text-3xl font-bold">{stats.total.users}</p>
          <p className="mt-1 text-xs text-emerald-600">+{stats.today.users} 오늘</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">총 게시글</p>
          <p className="mt-1 text-3xl font-bold">{stats.total.posts}</p>
          <p className="mt-1 text-xs text-emerald-600">+{stats.today.posts} 오늘</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">총 댓글</p>
          <p className="mt-1 text-3xl font-bold">{stats.total.comments}</p>
          <p className="mt-1 text-xs text-emerald-600">+{stats.today.comments} 오늘</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-slate-500">대기중 신고</p>
          <p className="mt-1 text-3xl font-bold text-rose-500">{stats.total.reports}</p>
          <Link href="/admin/reports" className="mt-1 text-xs text-blue-500">확인하기 →</Link>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">인기글 TOP 5</h2>
        <div className="space-y-3">
          {stats.topPosts.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{post.title}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>조회 {post.viewCount}</span>
                <span>좋아요 {post._count.likes}</span>
                <span>댓글 {post._count.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
