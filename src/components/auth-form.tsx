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
  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

export function AuthForm({ mode, nextPath, action }: AuthFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <input type="hidden" name="next" value={nextPath} />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{isLogin ? "로그인" : "회원가입"}</h1>
        <p className="text-sm text-slate-500">
          {isLogin ? "아이디 또는 이메일로 빠르게 로그인하세요." : "아이디, 닉네임, 이메일만 입력하면 바로 시작할 수 있어요."}
        </p>
      </div>

      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="identifier">
            {isLogin ? "아이디 또는 이메일" : "아이디"}
          </label>
          <input
            id="identifier"
            name={isLogin ? "identifier" : "username"}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-[var(--color-primary)]"
            required
          />
          <FieldError message={state.errors?.identifier?.[0] ?? state.errors?.username?.[0]} />
        </div>

        {!isLogin ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="nickname">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              required
            />
            <FieldError message={state.errors?.nickname?.[0]} />
          </div>
        ) : null}

        {!isLogin ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              required
            />
            <FieldError message={state.errors?.email?.[0]} />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            required
          />
          <FieldError message={state.errors?.password?.[0]} />
        </div>
      </div>

      <div className="space-y-3">
        <SubmitButton className="w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white">
          {isLogin ? "로그인" : "회원가입"}
        </SubmitButton>
        <p className="text-center text-sm text-slate-500">
          {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
          <Link href={isLogin ? `/register?next=${encodeURIComponent(nextPath)}` : `/login?next=${encodeURIComponent(nextPath)}`} className="font-medium text-[var(--color-primary)]">
            {isLogin ? "회원가입" : "로그인"}
          </Link>
        </p>
      </div>
    </form>
  );
}
