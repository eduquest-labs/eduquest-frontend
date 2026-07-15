"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { remainingAttemptSeconds } from "@/lib/attempt-validations";

interface AttemptTimerProps {
  deadlineAt: string | null;
  stopped: boolean;
  onExpire: () => void;
}

function formatRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function AttemptTimer({ deadlineAt, stopped, onExpire }: AttemptTimerProps) {
  const [remaining, setRemaining] = useState(() => remainingAttemptSeconds(deadlineAt, Date.now()));
  const firedRef = useRef(false);
  const handleExpire = useEffectEvent(onExpire);

  useEffect(() => {
    firedRef.current = false;

    const update = () => {
      const next = remainingAttemptSeconds(deadlineAt, Date.now());
      setRemaining(next);
      if (next === 0 && !firedRef.current) {
        firedRef.current = true;
        handleExpire();
      }
    };

    const immediate = window.setTimeout(update, 0);
    if (deadlineAt === null || stopped) {
      return () => window.clearTimeout(immediate);
    }

    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(timer);
    };
  }, [deadlineAt, stopped]);

  return (
    <div
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
        remaining !== null && remaining <= 60
          ? "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300"
          : "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"
      }`}
    >
      <Clock size={16} />
      {remaining === null ? "Tanpa batas waktu" : formatRemaining(remaining)}
    </div>
  );
}
