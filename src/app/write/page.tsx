import Link from "next/link";

import { createPostAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { PostForm } from "@/components/post-form";
import { getViewer } from "@/lib/session";

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

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">글쓰기</h1>
        <p className="mt-2 text-sm text-slate-500">제목과 내용을 입력하면 게시판에 바로 반영됩니다.</p>
      </div>
      <PostForm action={createPostAction} submitLabel="등록하기" />
    </div>
  );
}
