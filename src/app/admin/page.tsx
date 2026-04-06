import { redirect } from "next/navigation";
import Link from "next/link";

import { getAdminStats } from "@/lib/board-data";
import { getViewer } from "@/lib/session";

function StatCard({ title, value, note, tone }: { title: string; value: number; note: string; tone: string }) {
  return (
    <div className={`rounded-[1.75rem] border bg-white p-5 shadow-sm ${tone}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
    </div>
  );
}

export default async function AdminPage() {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_35%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-sky-700">Operations Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">관리자 대시보드</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          사용자 활동, 신고 상태, 콘텐츠 흐름을 빠르게 읽고 바로 대응할 수 있도록 핵심 지표 중심으로 재구성했습니다.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="총 회원" value={stats.total.users} note={`오늘 +${stats.today.users}`} tone="border-sky-200" />
        <StatCard title="총 게시글" value={stats.total.posts} note={`오늘 +${stats.today.posts}`} tone="border-emerald-200" />
        <StatCard title="총 댓글" value={stats.total.comments} note={`오늘 +${stats.today.comments}`} tone="border-violet-200" />
        <StatCard title="대기 신고" value={stats.total.reports} note="즉시 확인 필요" tone="border-rose-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">인기글 TOP 5</h2>
            <Link href="/admin/posts" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200">전체 글 관리</Link>
          </div>
          <div className="space-y-3">
            {stats.topPosts.map((post, i) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{post.title}</p>
                    <p className="mt-1 text-xs text-slate-500">게시글 반응 추적</p>
                  </div>
                </div>
                <div className="grid shrink-0 grid-cols-3 gap-2 text-right text-xs text-slate-500">
                  <span>조회 {post.viewCount}</span>
                  <span>좋아요 {post._count.likes}</span>
                  <span>댓글 {post._count.comments}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">빠른 이동</h2>
          <div className="mt-4 grid gap-3">
            <Link href="/admin/reports" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100">신고 관리 바로가기</Link>
            <Link href="/admin/deleted" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-700 transition hover:bg-amber-100">삭제 복구 바로가기</Link>
            <Link href="/admin/users" className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-medium text-sky-700 transition hover:bg-sky-100">회원 관리 바로가기</Link>
            <Link href="/admin/posts" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100">게시글 관리 바로가기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
