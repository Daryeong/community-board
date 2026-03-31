import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/app/actions";
import { safeNextPath } from "@/lib/security";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthForm mode="login" nextPath={safeNextPath(next)} action={loginAction} />
    </div>
  );
}
