import { redirect } from "next/navigation";
import Link from "next/link";

import { getViewer } from "@/lib/session";
import { getUserStats, getUserActivity } from "@/lib/board-data";
import { formatRelativeTime } from "@/lib/utils";

export default async function MyPage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage");
  }

  const [stats, activity] = await Promise.all([
    getUserStats(viewer.id),
    getUserActivity(viewer.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">마이페이지</h1>
        <p className="mt-2 text-sm text-slate-500">내 정보를 확인하고 수정할 수 있습니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/mypage/posts"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.postsCount}</p>
              <p className="text-sm text-slate-500">내 글</p>
            </div>
          </div>
        </Link>

        <Link
          href="/mypage/comments"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.commentsCount}</p>
              <p className="text-sm text-slate-500">내 댓글</p>
            </div>
          </div>
        </Link>

        <Link
          href="/mypage/posts"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.likesReceived}</p>
              <p className="text-sm text-slate-500">받은 좋아요</p>
            </div>
          </div>
        </Link>

        <Link
          href="/mypage/bookmarks"
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.bookmarksCount}</p>
              <p className="text-sm text-slate-500">북마크</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">최근 작성한 글</h2>
            <Link href="/mypage/posts" className="text-sm text-[var(--color-primary)] hover:underline">
              더보기
            </Link>
          </div>

          {activity.recentPosts.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">작성한 글이 없습니다.</p>
              <Link href="/write" className="mt-2 inline-block text-sm text-[var(--color-primary)] hover:underline">
                첫 글 작성하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="flex-1 truncate text-sm font-medium text-slate-900">
                      {post.title}
                    </h3>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post._count.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post._count.likes}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">최근 작성한 댓글</h2>
            <Link href="/mypage/comments" className="text-sm text-[var(--color-primary)] hover:underline">
              더보기
            </Link>
          </div>

          {activity.recentComments.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">작성한 댓글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.recentComments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/posts/${comment.post.id}`}
                  className="block rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-slate-100"
                >
                  <p className="text-xs text-slate-400">
                    게시글: <span className="text-slate-600">{comment.post.title}</span>
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-700">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatRelativeTime(comment.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {comment._count.likes}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/mypage/profile"
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          프로필 수정
        </Link>
        <Link
          href="/password"
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          비밀번호 변경
        </Link>
        <Link
          href="/mypage/settings"
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          알림 설정
        </Link>
      </div>

      <Link
        href="/mypage/delete"
        className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white py-4 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        회원탈퇴
      </Link>
    </div>
  );
}
