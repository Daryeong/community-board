import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserNotifications, getUnreadNotificationCount } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatRelativeTime } from "@/lib/utils";

type NotificationsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function getNotificationMessage(type: string, actorNickname: string) {
  switch (type) {
    case "comment":
      return `${actorNickname}님이 회원님의 글에 댓글을 달았습니다.`;
    case "like_post":
      return `${actorNickname}님이 회원님의 글을 좋아합니다.`;
    case "like_comment":
      return `${actorNickname}님이 회원님의 댓글을 좋아합니다.`;
    default:
      return `${actorNickname}님의 알림`;
  }
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fnotifications");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { notifications, total, totalPages } = await getUserNotifications(viewer.id, currentPage);
  const unreadCount = await getUnreadNotificationCount(viewer.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">알림</h1>
          <p className="mt-2 text-sm text-slate-500">
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 확인했습니다."}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={async () => {
            "use server";
            const { markAllNotificationsAsRead } = await import("@/lib/board-data");
            const { getViewer } = await import("@/lib/session");
            const viewer = await getViewer();
            if (viewer) {
              await markAllNotificationsAsRead(viewer.id);
            }
          }}>
            <button type="submit" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              모두 읽음 처리
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-slate-500">받은 알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: { id: number; type: string; postId: number; readAt: Date | null; createdAt: Date; actor: { nickname: string } }) => (
            <Link
              key={notification.id}
              href={`/posts/${notification.postId}`}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                notification.readAt
                  ? "border-slate-200 bg-white"
                  : "border-blue-200 bg-blue-50"
              } hover:border-slate-300`}
            >
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                notification.readAt ? "bg-slate-300" : "bg-blue-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.readAt ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                  {getNotificationMessage(notification.type, notification.actor.nickname)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </div>
              {!notification.readAt && (
                <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/mypage/notifications?page=${p}`}
              className={`rounded-lg px-3 py-1 text-sm ${
                p === currentPage
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
