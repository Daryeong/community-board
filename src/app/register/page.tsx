import { AuthForm } from "@/components/auth-form";
import { registerAction } from "@/app/actions";
import { safeNextPath } from "@/lib/security";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <AuthForm mode="register" nextPath={safeNextPath(next)} action={registerAction} />
    </div>
  );
}
