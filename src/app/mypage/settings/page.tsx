import { redirect } from "next/navigation";

import { getViewer } from "@/lib/session";
import { prisma } from "@/lib/db";
import { NotificationSettingsClient } from "./notification-settings-client";

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
      <div className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_40%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-sky-700">Notification Preferences</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">알림 설정</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          켜자마자 바로 저장되는 토글 방식으로 바꿔서, 필요한 알림만 빠르게 관리할 수 있습니다.
        </p>
      </div>

      <NotificationSettingsClient
        initialNotifyComment={user?.notifyComment ?? true}
        initialNotifyLike={user?.notifyLike ?? true}
      />
    </div>
  );
}
