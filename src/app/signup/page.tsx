import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--bg-page)]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Cloud-save boards and discover nearby games
          </p>
        </div>
        <AuthForm mode="signup" />
        <p className="text-center text-sm">
          <Link href="/" className="text-[var(--text-muted)] hover:underline">
            Back to demo
          </Link>
        </p>
      </div>
    </div>
  );
}
