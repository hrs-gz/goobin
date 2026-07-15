import Link from "next/link";
import { GoobinLogo } from "@/components/GoobinLogo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <GoobinLogo size="lg" />
      <h1 className="font-display text-xl font-semibold">
        We couldn&apos;t find that board
      </h1>
      <p className="text-[var(--text-muted)]">
        Double-check the 6-digit code, or head back and try again.
      </p>
      <Link href="/" className="mt-2">
        <Button size="lg">Back to home</Button>
      </Link>
    </main>
  );
}
