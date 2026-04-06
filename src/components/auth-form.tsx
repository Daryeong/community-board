"use client";

import Link from "next/link";
import { useActionState, useState, useRef, useEffect } from "react";

import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-rose-600 animate-fadeIn">{message}</p>;
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

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

function PasswordInputWithIcon({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className="w-full rounded-2xl border border-slate-300 bg-white px-12 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

interface FieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  required?: boolean;
  minLength?: number;
}

function FormField({
  config,
  error,
  success
}: {
  config: FieldConfig;
  error?: string;
  success?: boolean;
}) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const isPassword = config.type === "password";
  const showSuccess = touched && success && value.length > 0;

  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-sm font-medium text-slate-700">{config.label}</label>
      {isPassword ? (
        <PasswordInputWithIcon
          name={config.name}
          placeholder={config.placeholder}
          icon={config.icon}
          required={config.required}
          minLength={config.minLength}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          className={error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : ""}
        />
      ) : (
        <InputWithIcon
          name={config.name}
          type={config.type}
          placeholder={config.placeholder}
          icon={config.icon}
          required={config.required}
          minLength={config.minLength}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          className={error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : ""}
        />
      )}
      <div className="flex h-5 items-center justify-between">
        {error ? (
          <FieldError message={error} />
        ) : showSuccess ? (
          <div className="flex items-center gap-1 text-sm text-green-600 animate-fadeIn">
            <CheckIcon />
            <span>사용 가능</span>
          </div>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

export function AuthForm({ mode, nextPath, action }: AuthFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const isLogin = mode === "login";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true);
    formAction(formData);
    setTimeout(() => setIsSubmitting(false), 3000);
  };

  const loginFields: FieldConfig[] = [
    { name: "identifier", label: "아이디 또는 이메일", placeholder: "아이디 또는 이메일을 입력하세요", icon: <UserIcon />, required: true },
    { name: "password", label: "비밀번호", placeholder: "비밀번호를 입력하세요", type: "password", icon: <LockIcon />, required: true, minLength: 8 },
  ];

  const registerFields: FieldConfig[] = [
    { name: "username", label: "아이디", placeholder: "아이디 (4자 이상)", icon: <UserIcon />, required: true, minLength: 4 },
    { name: "nickname", label: "닉네임", placeholder: "닉네임 (2자 이상)", icon: <UserIcon />, required: true, minLength: 2 },
    { name: "email", label: "이메일", placeholder: "이메일 주소", type: "email", icon: <EmailIcon />, required: true },
    { name: "password", label: "비밀번호", placeholder: "비밀번호 (8자 이상)", type: "password", icon: <LockIcon />, required: true, minLength: 8 },
  ];

  const fields = isLogin ? loginFields : registerFields;

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
      
      <div className="relative w-full max-w-sm animate-fadeIn">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 shadow-lg shadow-blue-500/25">
            {isLogin ? (
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            )}
          </div>
          <h1 className="text-2.5xl font-bold text-slate-900">{isLogin ? "로그인" : "회원가입"}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "다시 오신 것을 환영합니다!" : "커뮤니티 게시판의 회원이 되어보세요."}
          </p>
        </div>

        <div className="relative rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-7 shadow-xl shadow-slate-200/50">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-slate-50/50" />
          <div className="relative">
            {state.message ? (
              <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fadeIn border border-rose-100">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.message}
              </div>
            ) : null}

            <form action={handleSubmit} className="space-y-5">
              <input type="hidden" name="next" value={nextPath} />

              {fields.map((field) => (
                <FormField
                  key={field.name}
                  config={field}
                  error={state.errors?.[field.name]?.[0]}
                />
              ))}

              <div className="space-y-3 pt-3">
                <SubmitButton 
                  className="w-full rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      처리중...
                    </span>
                  ) : isLogin ? "로그인" : "회원가입"}
                </SubmitButton>

                <p className="text-center text-sm text-slate-500">
                  {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
                  <Link
                    href={isLogin ? `/register?next=${encodeURIComponent(nextPath)}` : `/login?next=${encodeURIComponent(nextPath)}`}
                    className="font-medium text-[var(--color-primary)] hover:underline hover:text-blue-700"
                  >
                    {isLogin ? "회원가입" : "로그인"}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
