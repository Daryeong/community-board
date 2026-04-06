"use client";

import { useActionState, useState, useEffect, useRef, useCallback } from "react";

import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";

interface Attachment {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

type PostFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  initialValues?: {
    title?: string;
    content?: string;
    categoryId?: number | null;
    tags?: string[];
  };
  initialAttachments?: Array<{
    id: number;
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
  categories?: Array<{ id: number; name: string; slug: string; color: string }>;
};

function TitleIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
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

function FileIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function isImageAttachment(file: Attachment) {
  return file.mimeType.startsWith("image/");
}

function FileUpload({
  attachments,
  onAttachmentsChange,
}: {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newAttachments: Attachment[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "업로드 실패");
        }

        const data = await res.json();
        newAttachments.push(data);
      }

      onAttachmentsChange([...attachments, ...newAttachments]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">파일 첨부</label>
      
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <FileIcon />
        </div>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full cursor-pointer rounded-2xl border border-slate-300 bg-white px-12 py-3.5 text-sm file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-medium file:text-slate-600 hover:file:bg-slate-200 disabled:opacity-50"
        />
      </div>

      {uploading && (
        <p className="mt-2 text-sm text-slate-500">업로드 중...</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      )}

      {attachments.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attachments.map((file, index) => (
              <div
                key={`${file.filename}-${index}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                {isImageAttachment(file) ? (
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white transition hover:bg-rose-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-slate-700">{file.originalName}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {isImageAttachment(file) ? (
                  <div className="border-t border-slate-200 bg-white px-3 py-2">
                    <p className="truncate text-sm font-medium text-slate-700">{file.originalName}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-slate-400">JPG, PNG, GIF, WEBP, PDF</p>
    </div>
  );
}

export function PostForm({ action, submitLabel, initialValues, initialAttachments, categories }: PostFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);
  const [titleValue, setTitleValue] = useState(initialValues?.title ?? "");
  const [contentValue, setContentValue] = useState(initialValues?.content ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialAttachments?.map(a => ({
      url: a.url,
      filename: a.filename,
      originalName: a.originalName,
      mimeType: a.mimeType,
      size: a.size,
    })) ?? []
  );
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const saveDraft = useCallback(() => {
    const draft = {
      title: titleValue,
      content: contentValue,
      categoryId: formRef.current ? (new FormData(formRef.current).get("categoryId") as string) : "",
      savedAt: new Date().toISOString(),
    };
    if (draft.title || draft.content) {
      localStorage.setItem("postDraft", JSON.stringify(draft));
      setLastSaved(new Date());
    }
  }, [contentValue, titleValue]);

  useEffect(() => {
    const savedDraft = localStorage.getItem("postDraft");
    if (savedDraft && !initialValues?.title && !initialValues?.content) {
      const draft = JSON.parse(savedDraft);
      if (formRef.current) {
        const titleInput = formRef.current.querySelector<HTMLInputElement>('input[name="title"]');
        const contentInput = formRef.current.querySelector<HTMLTextAreaElement>('textarea[name="content"]');
        if (titleInput && draft.title) {
          titleInput.value = draft.title;
          setTitleValue(draft.title);
        }
        if (contentInput && draft.content) {
          contentInput.value = draft.content;
          setContentValue(draft.content);
        }
      }
    }
  }, [initialValues]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) saveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const attachmentsJson = JSON.stringify(attachments);
    const attachmentsInput = document.createElement("input");
    attachmentsInput.type = "hidden";
    attachmentsInput.name = "attachments";
    attachmentsInput.value = attachmentsJson;
    form.appendChild(attachmentsInput);

    const tagInputs = form.querySelectorAll('input[name="tag"]:checked');
    const tags = Array.from(tagInputs).map((input) => (input as HTMLInputElement).value);
    const tagsInput = document.createElement("input");
    tagsInput.type = "hidden";
    tagsInput.name = "tags";
    tagsInput.value = JSON.stringify(tags);
    form.appendChild(tagsInput);
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {state.message ? (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {state.message}
        </div>
      ) : null}

      {lastSaved && (
        <p className="text-xs text-slate-400">
          임시저장: {lastSaved.toLocaleTimeString()}
        </p>
      )}

      {categories && categories.length > 0 && (
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="category">
            카테고리
          </label>
          <select
            id="category"
            name="categoryId"
            defaultValue={initialValues?.categoryId?.toString() ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
          >
            <option value="">선택 안 함</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <label className="mb-3 block text-sm font-medium text-slate-700" htmlFor="tags">
            태그
          </label>
          <div className="flex flex-wrap gap-2">
            {["질문", "도움", "팁", "후기", "소식"].map((tag) => (
              <label key={tag} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="tag"
                  value={tag}
                  defaultChecked={initialValues?.tags?.includes(tag)}
                  className="peer hidden"
                />
                <span className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-checked:text-white">
                  #{tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="title">
            제목
          </label>
          <InputWithIcon
            id="title"
            name="title"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            placeholder="제목을 입력하세요"
            icon={<TitleIcon />}
            maxLength={100}
            required
          />
          {state.errors?.title?.[0] ? <p className="mt-2 text-sm text-rose-600">{state.errors.title[0]}</p> : null}

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <label className="block text-sm font-medium text-slate-700" htmlFor="content">
                내용
              </label>
              <p className="text-xs text-slate-400">{contentValue.length.toLocaleString()}자</p>
            </div>
            <div className="relative bg-slate-50/50 px-4 py-4 sm:px-5 sm:py-5">
              <div className="pointer-events-none absolute left-8 top-8">
                <ContentIcon />
              </div>
              <textarea
                id="content"
                name="content"
                value={contentValue}
                onChange={(e) => setContentValue(e.target.value)}
                rows={18}
                placeholder="내용을 입력하세요"
                className="min-h-[380px] w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-12 py-5 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                required
              />
            </div>
          </div>
          {state.errors?.content?.[0] ? <p className="mt-2 text-sm text-rose-600">{state.errors.content[0]}</p> : null}
        </div>
      </section>

      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <FileUpload attachments={attachments} onAttachmentsChange={setAttachments} />
      </div>

      <div className="flex items-center justify-end gap-3">
        <SubmitButton className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
