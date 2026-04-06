import Link from "next/link";
import { redirect } from "next/navigation";

import { PasswordChangeForm } from "@/components/password-change-form";
import { changePasswordAction } from "@/app/actions";
import { getViewer } from "@/lib/session";

type PasswordPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function PasswordPage({ searchParams }: PasswordPageProps) {
  const viewer = await getViewer();
  const { notice } = await searchParams;

  if (!viewer) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">비밀번호 변경은 로그인 후 이용 가능합니다.</div>
        <Link href="/login?next=%2Fpassword" className="inline-flex rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white">
          로그인하기
        </Link>
      </div>
    );
  }

  return <PasswordChangeForm action={changePasswordAction} notice={notice} />;
}
