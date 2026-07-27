"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function MainError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-xl items-center px-4 py-10">
      <section className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
          <AlertTriangle aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-[var(--app-text)]">
          Có lỗi xảy ra
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
          Nội dung chưa thể hiển thị. Hãy thử tải lại phần này.
        </p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4154c8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5265d7]"
          onClick={unstable_retry}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Thử lại
        </button>
      </section>
    </main>
  );
}
