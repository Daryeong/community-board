"use client";

import Link from "next/link";
import { useActionState, useState, useRef } from "react";

import { updateProfileAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

type ProfileEditClientProps = {
  initialData: { nickname: string; email: string; avatarUrl: string | null };
};

export default function ProfileEditClient({ initialData }: ProfileEditClientProps) {
  const [state, formAction] = useActionState(updateProfileAction, {
    ...EMPTY_FORM_STATE,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) return;
      const data = await res.json();
      setAvatarPreview(data.url);
    } catch {
      console.error("Upload failed");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">프로필 수정</h1>
        <p className="mt-2 text-sm text-slate-500">프로필 사진과 닉네임을 수정할 수 있습니다.</p>
      </div>

      {state.message ? (
        <div className={`rounded-2xl px-4 py-3 text-sm ${state.message.includes("수정") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="프로필"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-medium">
                {initialData.nickname.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-slate-500">클릭하여 프로필 사진 변경</p>
        </div>

        <input type="hidden" name="avatarUrl" value={avatarPreview ?? ""} />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="nickname">
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            defaultValue={initialData.nickname}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            required
          />
          {state.errors?.nickname?.[0] && (
            <p className="mt-2 text-sm text-rose-600">{state.errors.nickname[0]}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData.email}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            required
          />
          {state.errors?.email?.[0] && (
            <p className="mt-2 text-sm text-rose-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link href="/mypage" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700">
            취소
          </Link>
          <SubmitButton className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">
            수정하기
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}