import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePostAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { PostForm } from "@/components/post-form";
import { getPostDetail } from "@/lib/board-data";
import { getViewer } from "@/lib/session";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) notFound();

  const [post, viewer] = await Promise.all([getPostDetail(postId), getViewer()]);
  if (!post) notFound();

  if (!viewer || viewer.id !== post.authorId) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Notice message="작성자만 이 글을 수정할 수 있습니다." tone="error" />
        <Link href={`/posts/${postId}`} className="inline-flex rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
          글 상세로 돌아가기
        </Link>
      </div>
    );
  }

  const boundAction = updatePostAction.bind(null, postId);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">글 수정</h1>
        <p className="mt-2 text-sm text-slate-500">기존 내용을 유지한 상태로 수정할 수 있습니다.</p>
      </div>
      <PostForm
        action={boundAction}
        submitLabel="수정완료"
        initialValues={{ title: post.title, content: post.content }}
      />
    </div>
  );
}
