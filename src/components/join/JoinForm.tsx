"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeInput } from "@/components/ui/CodeInput";
import { ScanQrModal } from "@/components/join/ScanQrModal";
import { isValidJoinCode } from "@/lib/joinCode";

export function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const valid = isValidJoinCode(code);

  const join = (value: string) => {
    if (isValidJoinCode(value)) router.push(`/play/${value}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          join(code);
        }}
        className="flex flex-col items-center gap-5"
      >
        <CodeInput
          value={code}
          onChange={setCode}
          onComplete={join}
          autoFocus
        />
        <Button type="submit" size="lg" fullWidth disabled={!valid}>
          Join board
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--border-soft)]" />
        <span className="text-xs text-[var(--text-faint)]">or</span>
        <span className="h-px flex-1 bg-[var(--border-soft)]" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        className="mt-4"
        onClick={() => setScanOpen(true)}
      >
        <QrCode size={18} />
        Scan QR code
      </Button>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Want to make your own?{" "}
        <Link
          href="/create"
          className="font-medium text-[var(--accent-strong)] hover:underline"
        >
          Create a board
        </Link>
      </p>

      <ScanQrModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onCode={(c) => {
          setScanOpen(false);
          join(c);
        }}
      />
    </div>
  );
}
