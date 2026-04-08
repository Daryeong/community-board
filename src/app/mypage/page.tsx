import Link from "next/link";
import { redirect } from "next/navigation";

import { getUserActivity, getUserStats } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatRelativeTime } from "@/lib/utils";

function QuickCard({ href, tone, label, value, icon }: { href: string; tone: string; label: string; value: number; icon: React.ReactNode }) {
  return (
    <Link href={href} className={`group rounded-[1.75rem] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-black/5 transition group-hover:scale-105">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function SectionCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <Link href={href} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200">
          더보기
        </Link>
      </div>
      {children}
    </div>
  );
}

export default async function MyPage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage");
  }

  const [stats, activity] = await Promise.all([getUserStats(viewer.id), getUserActivity(viewer.id)]);

  const shortName = viewer.nickname.charAt(0);
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
          <div className="grid gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[var(--color-primary)] to-blue-600 text-2xl font-semibold text-white shadow-lg shadow-blue-500/20">
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" aria-hidden="true" />
                  {shortName}
                </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sky-700">My Dashboard</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{viewer.nickname}님의 마이페이지</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  내 활동 흐름과 계정 설정을 한 화면에 모아두고, 자주 쓰는 기능으로 바로 이동할 수 있게 정리했습니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/password" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                비밀번호 변경
              </Link>
              <Link href="/mypage/profile" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                프로필 수정
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">최근 반응</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{stats.likesReceived}</p>
                  <p className="mt-1 text-sm text-slate-500">받은 좋아요</p>
                </div>
                <Link href="/mypage/posts" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200">
                  내 글 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard href="/mypage/posts" tone="border-blue-200 hover:border-blue-300" label="내 글" value={stats.postsCount} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <QuickCard href="/mypage/comments" tone="border-emerald-200 hover:border-emerald-300" label="내 댓글" value={stats.commentsCount} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
        <QuickCard href="/mypage/posts" tone="border-rose-200 hover:border-rose-300" label="받은 좋아요" value={stats.likesReceived} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
        <QuickCard href="/mypage/bookmarks" tone="border-amber-200 hover:border-amber-300" label="북마크" value={stats.bookmarksCount} icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="최근 작성한 글" href="/mypage/posts">
          {activity.recentPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              <p>작성한 글이 없습니다.</p>
              <Link href="/write" className="mt-3 inline-block rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white">
                첫 글 작성하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.recentPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-sm font-medium text-slate-900">{post.title}</h3>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-200">{formatRelativeTime(post.createdAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>댓글 {post._count.comments}</span>
                    <span>좋아요 {post._count.likes}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="최근 작성한 댓글" href="/mypage/comments">
          {activity.recentComments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              작성한 댓글이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {activity.recentComments.map((comment) => (
                <Link key={comment.id} href={`/posts/${comment.post.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100">
                  <p className="text-xs font-medium text-slate-400">{comment.post.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700">{comment.content}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>{formatRelativeTime(comment.createdAt)}</span>
                    <span>좋아요 {comment._count.likes}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/mypage/settings" className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          알림 설정
        </Link>
        <Link href="/mypage/bookmarks" className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          북마크 관리
        </Link>
        <Link href="/mypage/delete" className="rounded-[1.5rem] border border-rose-200 bg-white px-5 py-4 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50">
          회원탈퇴
        </Link>
      </section>
    </div>
  );
}
