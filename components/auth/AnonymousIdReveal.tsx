"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import { Button } from "@heroui/react";

interface AnonymousIdRevealProps {
  anonymousId: string;
}

export function AnonymousIdReveal({ anonymousId }: AnonymousIdRevealProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(anonymousId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Akun berhasil diaktifkan</h1>
        <p className="text-sm text-muted-foreground">
          Simpan ID ini baik-baik — Anda memerlukannya untuk masuk kembali di lain waktu, bersama
          kata sandi yang baru saja Anda buat.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-(--glass-border) bg-white/40 px-4 py-3 dark:bg-black/20">
        <span className="font-mono text-lg font-semibold tracking-wide">{anonymousId}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Salin ID"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <Button
        fullWidth
        onPress={() => router.push("/siswa")}
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        Lanjutkan
      </Button>
    </div>
  );
}
