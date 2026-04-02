import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">관리자 페이지</h1>
        <p className="mt-2 text-sm text-slate-500">게시판을 관리할 수 있습니다.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <Link
          href="/admin/users"
          className="rounded-t-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          회원 관리
        </Link>
        <Link
          href="/admin/posts"
          className="rounded-t-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          글 관리
        </Link>
        <Link
          href="/admin/reports"
          className="rounded-t-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          신고 관리
        </Link>
        <Link
          href="/admin/deleted"
          className="rounded-t-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          삭제 복구
        </Link>
      </div>

      {children}
    </div>
  );
}
