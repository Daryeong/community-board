import { redirect } from "next/navigation";

import Link from "next/link";
import { getViewer } from "@/lib/session";

export default async function PasswordPage() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">비밀번호 변경은 로그인 후 이용 가능합니다.</div>
        <Link href="/login?next=%2Fpassword" className="inline-flex rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">비밀번호 변경</h1>
        <p className="mt-2 text-sm text-slate-500">안전한 비밀번호로 변경해주세요.</p>
      </div>

      <form action={async () => {
        "use server";
        // Redirect to client component that handles the form
        redirect("/password/change");
      }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="currentPassword">
            현재 비밀번호
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="newPassword">
            새 비밀번호
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            minLength={8}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
            취소
          </Link>
          <button type="submit" className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">
            변경하기
          </button>
        </div>
      </form>
    </div>
  );
}
