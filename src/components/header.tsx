import Link from "next/link";

import { logoutAction } from "@/app/actions";
import { getViewer } from "@/lib/session";
import { getUnreadNotificationCount } from "@/lib/board-data";

function LogoIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function Avatar({ name, avatarUrl, size = "sm" }: { name: string; avatarUrl?: string | null; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium ${textSize}`}>
      {name.charAt(0)}
    </div>
  );
}

function StatusAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  return (
    <div className="relative shrink-0">
      <Avatar name={name} avatarUrl={avatarUrl} />
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" aria-hidden="true" />
    </div>
  );
}

export async function Header() {
  const viewer = await getViewer();
  const unreadCount = viewer ? await getUnreadNotificationCount(viewer.id) : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 text-white shadow-lg shadow-blue-500/20 transition group-hover:scale-105">
            <LogoIcon />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-slate-900">커뮤니티 게시판</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {viewer ? (
            <>
              <Link href="/mypage" className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 sm:flex">
                <StatusAvatar name={viewer.nickname} avatarUrl={viewer.avatarUrl} />
                <span className="text-sm font-medium text-slate-700">{viewer.nickname}</span>
              </Link>

              <Link href="/write" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/30">
                <PenIcon />
                <span className="hidden sm:inline">글쓰기</span>
              </Link>

              <Link href="/mypage/notifications" className="relative flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {viewer.isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-600 transition hover:border-purple-300 hover:bg-purple-100">
                  <ShieldIcon />
                  <span className="hidden sm:inline">관리자</span>
                </Link>
              )}

              <form action={logoutAction}>
                <button type="submit" className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                  <LogoutIcon />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                <LoginIcon />
                <span className="hidden sm:inline">로그인</span>
              </Link>

              <Link href="/register" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/30">
                <RegisterIcon />
                <span className="hidden sm:inline">회원가입</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
