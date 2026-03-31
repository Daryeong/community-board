import Link from "next/link";

import { getPostList } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type HomePageProps = {
  searchParams: Promise<{ page?: string; q?: string; notice?: string }>;
};

function buildPageHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export default async function Home({ searchParams }: HomePageProps) {
  const { page, q, notice } = await searchParams;
  const [{ posts, totalPages, query, page: currentPage }, viewer] = await Promise.all([
    getPostList(page, q),
    getViewer(),
  ]);
  type PostItem = (typeof posts)[number];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">자유게시판</h1>
            <p className="mt-2 text-sm text-slate-500">누구나 글을 읽고, 회원은 글과 댓글로 소통할 수 있습니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form action="/" className="flex flex-1 items-center gap-2 sm:flex-none">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="제목으로 검색"
                className="min-w-56 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <button type="submit" className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700">
                검색
              </button>
            </form>
            <Link
              href={viewer ? "/write" : "/login?next=%2Fwrite"}
              className="rounded-2xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white"
            >
              글쓰기
            </Link>
          </div>
        </div>
        {notice ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_140px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-600 sm:grid">
          <span>제목</span>
          <span>작성자</span>
          <span>작성일</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">아직 등록된 글이 없습니다.</div>
        ) : null}

        <div>
          {posts.map((post: PostItem) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="grid gap-2 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_140px_140px] sm:items-center sm:gap-4 sm:px-6"
            >
              <span className="font-medium text-slate-900">{post.title}</span>
              <span className="text-sm text-slate-500">{post.author.nickname}</span>
              <span className="text-sm text-slate-500">{formatDate(post.createdAt)}</span>
            </Link>
          ))}
        </div>
      </section>

      <nav className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
          <Link
            key={item}
            href={buildPageHref(item, query)}
            className={`rounded-xl px-3 py-2 text-sm ${item === currentPage ? "bg-[var(--color-primary)] text-white" : "border border-slate-300 bg-white text-slate-700"}`}
          >
            {item}
          </Link>
        ))}
      </nav>
    </div>
  );
}
