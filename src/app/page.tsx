import { AppHeader } from "@/components/AppHeader";
import { GoobinLogo } from "@/components/GoobinLogo";
import { JoinForm } from "@/components/join/JoinForm";

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-10">
        <div className="text-center">
          <div className="flex justify-center">
            <GoobinLogo size="lg" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold leading-tight text-[var(--text-primary)]">
            Turn any outing into photo bingo
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Enter a 6-digit code to join a board. No account needed — your
            photos stay on your phone.
          </p>
        </div>

        <div className="mt-9 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <JoinForm />
        </div>
      </main>
    </>
  );
}
