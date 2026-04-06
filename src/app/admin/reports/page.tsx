import { redirect } from "next/navigation";
import Link from "next/link";

import { getReports, resolveReport, suspendUser } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type ReportsPageProps = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    redirect("/");
  }

  const { page, status } = await searchParams;
  const currentPage = Number(page) || 1;
  const reportStatus = status || "pending";
  const { reports, total, totalPages } = await getReports(reportStatus, currentPage);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">신고 관리</h2>
            <p className="mt-1 text-sm text-slate-500">대기중 신고를 우선 검토하고, 처리 상태별로 빠르게 전환할 수 있습니다.</p>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">현재 {reportStatus}</span>
        </div>

      <div className="flex gap-2">
        {["pending", "resolved", "dismissed"].map((s) => (
          <Link
            key={s}
            href={`/admin/reports?status=${s}`}
            className={`rounded-full px-4 py-2 text-sm ${
              reportStatus === s
                ? "bg-[var(--color-primary)] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {s === "pending" ? "대기중" : s === "resolved" ? "처리완료" : "기각됨"} ({total})
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
          신고가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: { id: number; targetType: string; targetId: number; reason: string; description: string | null; createdAt: Date; reporter: { nickname: string }; target: { nickname: string } | null }) => (
            <div key={report.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {report.targetType === "post" ? "게시글" : "댓글"} #{report.targetId}
                  </p>
                  <p className="text-sm text-slate-500">
                    신고자: {report.reporter.nickname} | 
                    대상: {report.target?.nickname ?? "알 수 없음"} |
                    사유: {report.reason}
                  </p>
                  {report.description && (
                    <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">{formatDate(report.createdAt)}</p>
                </div>
                {reportStatus === "pending" && (
                  <div className="flex gap-2">
                    <form action={async () => {
                      "use server";
                      await resolveReport(report.id, "resolved");
                    }}>
                      <button className="rounded-lg bg-emerald-500 px-3 py-1 text-xs text-white">
                        처리완료
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await resolveReport(report.id, "dismissed");
                    }}>
                      <button className="rounded-lg bg-slate-300 px-3 py-1 text-xs">
                        기각
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
