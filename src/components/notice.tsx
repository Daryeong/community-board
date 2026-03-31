type NoticeProps = {
  message: string;
  tone?: "info" | "error" | "success";
};

const tones = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function Notice({ message, tone = "info" }: NoticeProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {message}
    </div>
  );
}
