import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserNotifications, getUnreadNotificationCount } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatRelativeTime } from "@/lib/utils";

type NotificationsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function getNotificationHref(notification: { postId: number; commentId?: number | null }) {
  if (notification.commentId) {
    return `/posts/${notification.postId}?comment=${notification.commentId}#comment-${notification.commentId}`;
  }

  return `/posts/${notification.postId}`;
}

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
  const { notifications, totalPages } = await getUserNotifications(viewer.id, currentPage);
  const unreadCount = await getUnreadNotificationCount(viewer.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">알림</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">좋아요와 댓글 반응을 시간 순서대로 모아서 확인할 수 있습니다.</p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
            {unreadCount > 0 ? `읽지 않음 ${unreadCount}` : "모두 확인"}
          </div>
        </div>
      </section>

      {notifications.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          받은 알림이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: { id: number; type: string; postId: number; commentId?: number | null; readAt: Date | null; createdAt: Date; actor: { nickname: string } }) => (
            <Link
              key={notification.id}
              href={getNotificationHref(notification)}
              className={`flex items-start gap-4 rounded-[1.5rem] border p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md ${notification.readAt ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/70"}`}
            >
              <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.readAt ? "bg-slate-300" : "bg-blue-500"}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-6 ${notification.readAt ? "text-slate-600" : "font-medium text-slate-900"}`}>{getNotificationMessage(notification.type, notification.actor.nickname)}</p>
                <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
              </div>
              {!notification.readAt ? <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-semibold text-white">NEW</span> : null}
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
              className={`rounded-lg px-3 py-1 text-sm ${p === currentPage ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
