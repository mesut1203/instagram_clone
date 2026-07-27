"use client";

import { createOrGetConversation } from "@/app/services/message.action";
import { LoaderCircle, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function MessageUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const openConversation = () => {
    setError("");
    startTransition(async () => {
      const result = await createOrGetConversation(userId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(`/messages/${encodeURIComponent(result.data._id)}`);
    });
  };

  return (
    <span className="relative">
      <button
        aria-label="Gửi tin nhắn"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--app-input)] px-4 py-2.5 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-hover)] disabled:opacity-60"
        disabled={isPending}
        onClick={openConversation}
        type="button"
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        ) : (
          <MessageCircle aria-hidden="true" className="size-4" />
        )}
        Nhắn tin
      </button>
      {error && (
        <span
          className="absolute top-full right-0 z-10 mt-2 w-64 rounded-xl border border-red-400/20 bg-[var(--app-surface)] px-3 py-2 text-xs text-red-500 shadow-xl"
          role="alert"
        >
          {error}
        </span>
      )}
    </span>
  );
}
