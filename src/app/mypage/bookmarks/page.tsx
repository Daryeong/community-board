import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserBookmarksWithFolders, getBookmarkFolders, createBookmarkFolder, deleteBookmarkFolder, moveBookmarkToFolder } from "@/lib/board-data";
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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">북마크</h1>
        <p className="mt-2 text-sm text-slate-500">저장한 글 {bookmarks.length}개</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/mypage/bookmarks"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !folderId
              ? "bg-[var(--color-primary)] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          전체
        </Link>
        {folders.map((f) => (
          <Link
            key={f.id}
            href={`/mypage/bookmarks?folder=${f.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              folderId === f.id
                ? "bg-[var(--color-primary)] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.name} ({f._count.bookmarks})
          </Link>
        ))}
        <form action={createBookmarkFolderAction} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="새 폴더"
            className="w-32 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <button type="submit" className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200">
            +
          </button>
        </form>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-slate-500">저장한 글이 없습니다.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-[var(--color-primary)] hover:underline">
            글 구경하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <Link
              key={bookmark.id}
              href={`/posts/${bookmark.post.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {bookmark.folder && (
                    <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                      {bookmark.folder.name}
                    </span>
                  )}
                  <h3 className="truncate text-base font-medium text-slate-900">
                    {bookmark.post.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                    <span>{bookmark.post.author.nickname}</span>
                    <span>{formatDate(bookmark.post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {bookmark.post._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {bookmark.post._count.likes}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {folders.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">폴더 관리</h3>
          <div className="space-y-2">
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <span className="font-medium text-slate-700">{folder.name}</span>
                <form action={deleteBookmarkFolderAction.bind(null, folder.id)}>
                  <button type="submit" className="rounded-lg px-3 py-1 text-sm text-rose-600 hover:bg-rose-50">
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
