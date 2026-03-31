"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";

type PostFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  initialValues?: {
    title?: string;
    content?: string;
  };
};

export function PostForm({ action, submitLabel, initialValues }: PostFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          name="title"
          defaultValue={initialValues?.title}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          maxLength={100}
          required
        />
        {state.errors?.title?.[0] ? <p className="mt-2 text-sm text-rose-600">{state.errors.title[0]}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="content">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={initialValues?.content}
          rows={14}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          required
        />
        {state.errors?.content?.[0] ? <p className="mt-2 text-sm text-rose-600">{state.errors.content[0]}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <SubmitButton className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
