"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

import { updateNotificationSettingsAction } from "@/app/actions";

function ToggleCard({
  title,
  description,
  name,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="min-w-0">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="flex h-8 w-14 items-center rounded-full bg-slate-200 p-1 transition peer-checked:bg-[var(--color-primary)]">
          <span className="h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:translate-x-6" />
        </span>
      </div>
    </label>
  );
}

function SavingBadge() {
  const { pending } = useFormStatus();
  if (!pending) return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">자동 저장</span>;

  return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">저장 중...</span>;
}

export function NotificationSettingsClient({
  initialNotifyComment,
  initialNotifyLike,
}: {
  initialNotifyComment: boolean;
  initialNotifyLike: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const submitNow = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action={updateNotificationSettingsAction} className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">토글하면 즉시 저장됩니다.</p>
        <SavingBadge />
      </div>

      <div className="space-y-3">
        <ToggleCard
          title="댓글 알림"
          description="내 글에 댓글이 달리면 바로 알려줍니다."
          name="notifyComment"
          checked={initialNotifyComment}
          onChange={submitNow}
        />

        <ToggleCard
          title="좋아요 알림"
          description="내 글이나 댓글이 좋아요를 받을 때 알려줍니다."
          name="notifyLike"
          checked={initialNotifyLike}
          onChange={submitNow}
        />
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
        변경은 즉시 반영되며, 페이지를 떠나도 따로 저장 버튼을 누를 필요가 없습니다.
      </div>
    </form>
  );
}
