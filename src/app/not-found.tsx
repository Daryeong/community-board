import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">게시글을 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">존재하지 않거나 삭제된 게시글입니다. 목록으로 돌아가서 다른 글을 확인해보세요.</p>
      <Link href="/" className="mt-6 inline-flex rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white">
        목록으로 돌아가기
      </Link>
    </div>
  );
}
