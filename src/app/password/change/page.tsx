"use client";

import Link from "next/link";
import { useActionState } from "react";

import { changePasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

export default function PasswordChangePage() {
  const [state, formAction] = useActionState(changePasswordAction, EMPTY_FORM_STATE);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">비밀번호 변경</h1>
        <p className="mt-2 text-sm text-slate-500">안전한 비밀번호로 변경해주세요.</p>
      </div>

      {state.message ? (
        <div className={`rounded-2xl px-4 py-3 text-sm ${state.message.includes("변경") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <SubmitButton className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">
            변경하기
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
