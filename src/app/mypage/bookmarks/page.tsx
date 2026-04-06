import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserBookmarksWithFolders, getBookmarkFolders } from "@/lib/board-data";
import { createBookmarkFolderAction, deleteBookmarkFolderAction } from "@/app/actions";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type BookmarksPageProps = {
  searchParams: Promise<{ folder?: string }>;
};

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fbookmarks");
  }

  const { folder } = await searchParams;
  const folderId = folder ? Number(folder) : null;
  const [folders, bookmarks] = await Promise.all([
    getBookmarkFolders(viewer.id),
    getUserBookmarksWithFolders(viewer.id, folderId ?? undefined),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_35%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">북마크</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">저장한 글을 폴더별로 정리하고, 자주 찾는 글을 빠르게 꺼내볼 수 있습니다.</p>
        <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">저장한 글 {bookmarks.length}개</div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/mypage/bookmarks" className={`rounded-full px-4 py-2 text-sm font-medium transition ${!folderId ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          전체
        </Link>
        {folders.map((f) => (
          <Link key={f.id} href={`/mypage/bookmarks?folder=${f.id}`} className={`rounded-full px-4 py-2 text-sm font-medium transition ${folderId === f.id ? "bg-[var(--color-primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {f.name} ({f._count.bookmarks})
          </Link>
        ))}
        <form action={createBookmarkFolderAction} className="flex gap-2">
          <input type="text" name="name" placeholder="새 폴더" className="w-32 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
          <button type="submit" className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200">+</button>
        </form>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          저장한 글이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <Link key={bookmark.id} href={`/posts/${bookmark.post.id}`} className="block rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {bookmark.folder ? <span className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">{bookmark.folder.name}</span> : null}
                  <h2 className="truncate text-lg font-semibold text-slate-900">{bookmark.post.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{bookmark.post.author.nickname}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{formatDate(bookmark.post.createdAt)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">댓글 {bookmark.post._count.comments}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">좋아요 {bookmark.post._count.likes}</span>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-slate-400">saved</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {folders.length > 0 && (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">폴더 관리</h2>
          <div className="mt-4 space-y-2">
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-medium text-slate-700">{folder.name}</span>
                <form action={deleteBookmarkFolderAction.bind(null, folder.id)}>
                  <button type="submit" className="rounded-lg px-3 py-1 text-sm text-rose-600 hover:bg-rose-50">삭제</button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
