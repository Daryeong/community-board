import { redirect } from "next/navigation";
import Link from "next/link";

import { getDeletedPosts, restorePost } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type DeletedPostsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminDeletedPostsPage({ searchParams }: DeletedPostsPageProps) {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    redirect("/");
  }

  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const { posts, total, totalPages } = await getDeletedPosts(currentPage);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">삭제된 글 복구</h2>
      <p className="text-sm text-slate-500">삭제된 글 {total}개</p>

      {posts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
          삭제된 글이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-slate-500">
                  작성자: {post.author.nickname} | 삭제일: {formatDate(post.deletedAt!)}
                </p>
              </div>
              <form action={async () => {
                "use server";
                await restorePost(post.id, viewer.id);
              }}>
                <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white">
                  복구
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
