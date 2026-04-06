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

function NoticeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.34 3.94c.75-1.3 2.57-1.3 3.32 0l6.2 10.74c.75 1.3-.19 2.92-1.66 2.92H5.8c-1.47 0-2.41-1.62-1.66-2.92l6.2-10.74zM12 9v3m0 3h.01" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 4l5 5-4 1-4 7-1-5-5-1 7-4 2-3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UserBadgeIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 20a8 8 0 0116 0" />
    </svg>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-slate-700 shadow-sm ring-1 ring-black/5">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
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
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(180deg,_#ffffff,_#f8fafc)] px-5 py-6 shadow-sm sm:px-6 sm:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              실시간 커뮤니티 보드
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{pageTitle}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              공지와 고정글은 먼저 확인하고, 일반 글은 카드형으로 빠르게 훑어볼 수 있게 정리했습니다.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[26rem]">
            <form action="/" className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur sm:flex sm:items-center sm:gap-2">
              <input type="hidden" name="category" value={category ?? ""} />
              <input type="hidden" name="tag" value={tag ?? ""} />
              <div className="relative flex-1">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="제목, 내용, 작성자 검색"
                  className="w-full min-w-0 rounded-2xl border border-transparent bg-transparent px-11 py-3 text-sm outline-none transition focus:border-slate-200 focus:bg-white"
                />
              </div>
              <div className="mt-2 flex items-center gap-2 sm:mt-0">
                <button type="submit" className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex-none">
                  검색
                </button>
                <Link
                  href={viewer ? "/write" : "/login?next=%2Fwrite"}
                  className="flex-1 rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:brightness-95 sm:flex-none"
                >
                  글쓰기
                </Link>
              </div>
            </form>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                !category ? "bg-[var(--color-primary)] text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              전체
            </Link>
            {categories.map((cat: { id: number; name: string; slug: string; color: string }) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  category === cat.slug
                    ? colorClasses[cat.color] ?? "bg-slate-100 text-slate-700"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
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
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-rose-200 bg-[linear-gradient(180deg,_#fff1f2,_#ffffff)] p-5 shadow-sm sm:p-6">
            <SectionHeader icon={<NoticeIcon />} title="공지글" description="반드시 확인해야 하는 안내를 먼저 보여줍니다." />
            <div className="mt-4 space-y-3">
              {noticePosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-white/80 px-4 py-6 text-sm text-slate-500">
                  현재 등록된 공지글이 없습니다.
                </div>
              ) : (
                noticePosts.map((post: PostItem) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 transition hover:border-rose-300 hover:shadow-sm"
                  >
                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">공지</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-rose-600">{post.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><ClockIcon />{formatDate(post.createdAt)}</span>
                        <span className="inline-flex items-center gap-1"><UserBadgeIcon />{post.author.nickname}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(180deg,_#fffbeb,_#ffffff)] p-5 shadow-sm sm:p-6">
            <SectionHeader icon={<PinIcon />} title="고정글" description="자주 참고하는 핵심 글을 상단에 유지합니다." />
            <div className="mt-4 space-y-3">
              {pinnedPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-white/80 px-4 py-6 text-sm text-slate-500">
                  현재 고정된 글이 없습니다.
                </div>
              ) : (
                pinnedPosts.map((post: PostItem) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="group block rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 transition hover:border-amber-300 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">고정</span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-amber-700">{post.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1"><ClockIcon />{formatDate(post.createdAt)}</span>
                          <span className="inline-flex items-center gap-1"><UserBadgeIcon />{post.author.nickname}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="col-span-full rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
            {tag || query || category ? "조건에 맞는 글이 없습니다." : "아직 등록된 글이 없습니다."}
          </div>
        ) : (
          posts.map((post: PostItem) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md sm:p-6"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {post.category && (
                  <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${colorClasses[post.category.color] ?? "bg-slate-100 text-slate-600"}`}>
                    {post.category.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                  <ClockIcon />
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-7 text-slate-900 group-hover:text-[var(--color-primary)]">
                {post.title}
              </h3>
              <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{post.contentPreview ?? ""}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((itemTag: string) => (
                    <span
                      key={itemTag}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        tag === itemTag
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      #{itemTag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 truncate"><UserBadgeIcon />{post.author.nickname}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-slate-400">read more</span>
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
