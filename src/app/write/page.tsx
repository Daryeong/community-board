import Link from "next/link";

import { createPostAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { PostForm } from "@/components/post-form";
import { getViewer } from "@/lib/session";
import { getCategories } from "@/lib/board-data";

export default async function WritePage() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Notice message="글쓰기는 로그인한 회원만 이용할 수 있습니다." tone="error" />
        <div className="flex gap-3">
          <Link href="/login?next=%2Fwrite" className="rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white">
            로그인하기
          </Link>
          <Link href="/" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PostForm action={createPostAction} submitLabel="등록하기" categories={categories} />
    </div>
  );
}
