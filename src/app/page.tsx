import { GoobinLogo } from "@/components/GoobinLogo";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
      <GoobinLogo size="lg" />
      <p className="text-[var(--text-muted)]">Photo bingo, rebuilt.</p>
    </main>
  );
}
