import { redirect } from "next/navigation";

import { updateNotificationSettingsAction } from "@/app/actions";
import { getViewer } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function NotificationSettingsPage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fsettings");
  }

  const user = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { notifyComment: true, notifyLike: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">알림 설정</h1>
        <p className="mt-2 text-sm text-slate-500">어떤 알림을 받을지 선택할 수 있습니다.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <form action={updateNotificationSettingsAction} className="space-y-6">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-900">댓글 알림</p>
              <p className="text-sm text-slate-500">내 글에 댓글이 달릴 때 알림</p>
            </div>
            <input
              type="checkbox"
              name="notifyComment"
              defaultChecked={user?.notifyComment ?? true}
              className="h-5 w-5 rounded text-[var(--color-primary)]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-900">좋아요 알림</p>
              <p className="text-sm text-slate-500">내 글이나 댓글이 좋아요를 받을 때 알림</p>
            </div>
            <input
              type="checkbox"
              name="notifyLike"
              defaultChecked={user?.notifyLike ?? true}
              className="h-5 w-5 rounded text-[var(--color-primary)]"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            저장하기
          </button>
        </form>
      </div>
    </div>
  );
}
