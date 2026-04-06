"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import type { FormState } from "@/lib/form-state";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { SubmitButton } from "@/components/submit-button";

function PasswordIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 10-8 0v4m-1 0h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.58 10.58a3 3 0 104.243 4.243" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.88 5.09A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.19 10.19 0 01-4.11 5.34" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.228 6.228C4.058 7.56 2.487 9.54 2.458 12c1.274 4.057 5.064 7 9.542 7 1.19 0 2.327-.207 3.376-.584" />
    </svg>
  );
}

function LockInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  showValue,
  onToggle,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showValue: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <PasswordIcon />
        </div>
        <input
          id={id}
          name={name}
          type={showValue ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white px-12 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-300 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"}`}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          aria-label={`${label} 보기 전환`}
        >
          {showValue ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function strengthInfo(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["약함", "보통", "좋음", "강함"];
  const colors = ["bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];
  return { score, label: labels[Math.min(score, 3)], color: colors[Math.min(score, 3)] };
}

export function PasswordChangeForm({ action, notice }: { action: (state: FormState, formData: FormData) => Promise<FormState>; notice?: string }) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = useMemo(() => strengthInfo(newPassword), [newPassword]);
  const matches = confirmPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_40%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-sky-700">Security Update</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">비밀번호 변경</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            현재 비밀번호를 확인한 뒤 새 비밀번호를 바로 반영합니다. 입력 상태를 실시간으로 보면서 더 안전하게 바꿀 수 있습니다.
          </p>

          {notice ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
          ) : null}

          {state.message ? (
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${state.message.includes("변경") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {state.message}
            </div>
          ) : null}

          <form action={formAction} className="mt-6 space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-slate-700" htmlFor="currentPassword">
                현재 비밀번호
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <PasswordIcon />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-12 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  required
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                  {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {state.errors?.currentPassword?.[0] ? <p className="text-sm text-rose-600">{state.errors.currentPassword[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-slate-700" htmlFor="newPassword">
                새 비밀번호
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <PasswordIcon />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8자 이상, 영문/숫자/특수문자 조합 권장"
                  className={`w-full rounded-2xl border bg-white px-12 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${state.errors?.newPassword?.[0] || state.errors?.confirmPassword?.[0] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-300 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"}`}
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${strength.color}`} style={{ width: `${25 * strength.score}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-500">{strength.label}</span>
              </div>

              {state.errors?.newPassword?.[0] ? <p className="text-sm text-rose-600">{state.errors.newPassword[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <PasswordIcon />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className={`w-full rounded-2xl border bg-white px-12 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${state.errors?.confirmPassword?.[0] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : matches ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10" : "border-slate-300 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"}`}
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {matches ? (
                <p className="text-sm text-emerald-600">비밀번호가 일치합니다.</p>
              ) : confirmPassword.length > 0 ? (
                <p className="text-sm text-amber-600">비밀번호가 일치하는지 확인해주세요.</p>
              ) : null}
              {state.errors?.confirmPassword?.[0] ? <p className="text-sm text-rose-600">{state.errors.confirmPassword[0]}</p> : null}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/mypage" className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                돌아가기
              </Link>
              <SubmitButton className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
                변경하기
              </SubmitButton>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">추천 규칙</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• 8자 이상</li>
              <li>• 영문 대문자, 숫자, 특수문자 중 2개 이상</li>
              <li>• 기존 비밀번호와 다른 값 사용</li>
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            변경 후에는 다시 로그인 세션이 갱신됩니다. 다른 기기에서 접속 중이라면 그쪽은 자동으로 로그아웃될 수 있습니다.
          </div>
        </aside>
      </div>
    </div>
  );
}
