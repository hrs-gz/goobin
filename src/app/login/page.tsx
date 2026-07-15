import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { safeAuthRedirect } from "@/lib/authRedirect";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const redirectTo = safeAuthRedirect(next);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--bg-page)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sign in to create and share boards
          </p>
        </div>
        <AuthForm mode="login" redirectTo={redirectTo} />
        <p className="text-center text-sm">
          <Link href="/" className="text-[var(--text-muted)] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
