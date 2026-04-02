"use client";

import { useState } from "react";
import { reportAction } from "@/app/actions";

interface ReportButtonProps {
  targetType: "post" | "comment";
  targetId: number;
  isLoggedIn: boolean;
}

const REPORT_REASONS = [
  { value: "spam", label: "스팸/광고" },
  { value: "abuse", label: "욕설/비방" },
  { value: "inappropriate", label: "부적절한 내용" },
  { value: "other", label: "기타" },
];

export function ReportButton({ targetType, targetId, isLoggedIn }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isLoggedIn) return null;

  if (submitted) {
    return (
      <button className="text-sm text-emerald-600" disabled>
        신고 완료
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-slate-400 hover:text-rose-500 transition"
      >
        신고
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold">신고하기</h3>
            <form
              action={async (formData) => {
                formData.set("targetType", targetType);
                formData.set("targetId", targetId.toString());
                await reportAction(formData);
                setSubmitted(true);
                setIsOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label key={reason.value} className="flex items-center gap-2">
                    <input type="radio" name="reason" value={reason.value} required />
                    <span className="text-sm">{reason.label}</span>
                  </label>
                ))}
              </div>
              <textarea
                name="description"
                placeholder="추가 설명 (선택)"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm text-white"
                >
                  신고
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
