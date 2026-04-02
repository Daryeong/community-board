"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-rose-600">{message}</p>;
}

function UserIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function InputWithIcon({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        {...props}
        className="w-full rounded-2xl border border-slate-300 bg-white px-12 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
      />
    </div>
  );
}

export function AuthForm({ mode, nextPath, action }: AuthFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const isLogin = mode === "login";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 shadow-lg shadow-blue-500/20">
          {isLogin ? (
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{isLogin ? "로그인" : "회원가입"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isLogin ? "다시 오신 것을 환영합니다!" : "커뮤니티 게시판의 회원이 되어보세요."}
        </p>
      </div>

      <form action={formAction} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <input type="hidden" name="next" value={nextPath} />

        {state.message ? (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.message}
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <InputWithIcon
              id={isLogin ? "identifier" : "username"}
              name={isLogin ? "identifier" : "username"}
              placeholder={isLogin ? "아이디 또는 이메일" : "아이디 (4자 이상)"}
              icon={<UserIcon />}
              required
            />
            <FieldError message={state.errors?.identifier?.[0] ?? state.errors?.username?.[0]} />
          </div>

          {!isLogin && (
            <div>
              <InputWithIcon
                id="nickname"
                name="nickname"
                placeholder="닉네임 (2자 이상)"
                icon={<UserIcon />}
                required
              />
              <FieldError message={state.errors?.nickname?.[0]} />
            </div>
          )}

          {!isLogin && (
            <div>
              <InputWithIcon
                id="email"
                name="email"
                type="email"
                placeholder="이메일 주소"
                icon={<EmailIcon />}
                required
              />
              <FieldError message={state.errors?.email?.[0]} />
            </div>
          )}

          <div>
            <InputWithIcon
              id="password"
              name="password"
              type="password"
              placeholder={isLogin ? "비밀번호" : "비밀번호 (8자 이상)"}
              icon={<LockIcon />}
              required
            />
            <FieldError message={state.errors?.password?.[0]} />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <SubmitButton className="w-full rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30">
            {isLogin ? "로그인" : "회원가입"}
          </SubmitButton>

          <p className="text-center text-sm text-slate-500">
            {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <Link
              href={isLogin ? `/register?next=${encodeURIComponent(nextPath)}` : `/login?next=${encodeURIComponent(nextPath)}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {isLogin ? "회원가입" : "로그인"}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
