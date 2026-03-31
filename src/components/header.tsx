import Link from "next/link";

import { logoutAction } from "@/app/actions";
import { getViewer } from "@/lib/session";

export async function Header() {
  const viewer = await getViewer();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <Link href="/" className="text-lg font-bold text-slate-900">
            커뮤니티 게시판
          </Link>
          <p className="mt-1 text-sm text-slate-500">누구나 익숙하게 쓰는 공개형 게시판</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {viewer ? (
            <>
              <span className="hidden rounded-full bg-slate-100 px-3 py-2 text-slate-600 sm:inline-flex">
                {viewer.nickname}님
              </span>
              <Link href="/write" className="rounded-xl bg-[var(--color-primary)] px-4 py-2 font-medium text-white">
                글쓰기
              </Link>
              <form action={logoutAction}>
                <button className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700" type="submit">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700">
                로그인
              </Link>
              <Link href="/register" className="rounded-xl bg-[var(--color-primary)] px-4 py-2 font-medium text-white">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
