import Link from "next/link";

import { getPostList, getCategories } from "@/lib/board-data";
import { getViewer } from "@/lib/session";
import { formatDate } from "@/lib/utils";

type HomePageProps = {
  searchParams: Promise<{ page?: string; q?: string; notice?: string; category?: string; tag?: string }>;
};

const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
  pink: "bg-pink-100 text-pink-700",
};

function buildPageHref(page: number, query: string, category: string, tag: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export default async function Home({ searchParams }: HomePageProps) {
  const { page, q, notice, category, tag } = await searchParams;
  const [{ pinnedPosts, noticePosts, posts, totalPages, query, page: currentPage }, viewer, categories] = await Promise.all([
    getPostList(page, q, category, tag),
    getViewer(),
    getCategories(),
  ]);
  type PostItem = (typeof posts)[number];

  const selectedCategory = categories.find((c: { slug: string }) => c.slug === category);
  const pageTitle = tag ? `#${tag}` : selectedCategory ? selectedCategory.name : "전체";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{pageTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">누구나 글을 읽고, 회원은 글과 댓글로 소통할 수 있습니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form action="/" className="flex flex-1 items-center gap-2 sm:flex-none">
              <input type="hidden" name="category" value={category ?? ""} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="검색"
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

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/"
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                !category
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              전체
            </Link>
            {categories.map((cat: { id: number; name: string; slug: string; color: string }) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  category === cat.slug
                    ? colorClasses[cat.color] ?? "bg-slate-100 text-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {notice ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}
      </section>

      {(noticePosts.length > 0 || pinnedPosts.length > 0) && (
        <section className="space-y-3">
          {noticePosts.map((post: PostItem) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 transition hover:border-rose-300"
            >
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-medium text-white">공지</span>
              <span className="flex-1 truncate text-sm font-medium text-slate-900">{post.title}</span>
              <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
            </Link>
          ))}
          {pinnedPosts.map((post: PostItem) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:border-amber-300"
            >
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">고정</span>
              <span className="flex-1 truncate text-sm font-medium text-slate-900">{post.title}</span>
              <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
            </Link>
          ))}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="col-span-full px-6 py-14 text-center text-sm text-slate-500">아직 등록된 글이 없습니다.</div>
        ) : (
          posts.map((post: PostItem) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md"
            >
              {post.category && (
                <span className={`mb-2 inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[post.category.color] ?? "bg-slate-100 text-slate-600"}`}>
                  {post.category.name}
                </span>
              )}
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-[var(--color-primary)]">
                {post.title}
              </h3>
              <p className="mb-3 line-clamp-3 flex-1 text-sm text-slate-500">{post.contentPreview ?? ""}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/?tag=${tag}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`rounded-full px-2 py-0.5 text-xs transition ${
                        post?.tags?.includes(tag) && tag === tag
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
                <span>{post.author.nickname}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </section>

      <nav className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
          <Link
            key={item}
            href={buildPageHref(item, query, category ?? "", tag ?? "")}
            className={`rounded-xl px-3 py-2 text-sm ${
              item === currentPage
                ? "bg-[var(--color-primary)] text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item}
          </Link>
        ))}
      </nav>
    </div>
  );
}
