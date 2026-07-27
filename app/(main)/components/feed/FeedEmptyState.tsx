"use client";

import { RefreshCw } from "lucide-react";

type FeedEmptyStateProps = {
  error?: string;
  isLoading: boolean;
  onRetry: () => void;
};

export default function FeedEmptyState({
  error,
  isLoading,
  onRetry,
}: FeedEmptyStateProps) {
  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] px-6 py-12 text-center">
      <h1 className="text-xl font-bold text-[var(--app-text)]">
        {error ? "Không thể tải bảng tin" : "Chưa có bài viết mới"}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--app-muted)]">
        {error ?? "Khi bạn bè đăng bài, nội dung mới nhất sẽ xuất hiện ở đây."}
      </p>
      {error && (
        <button
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4154c8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4c60d4] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={onRetry}
          type="button"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Thử lại
        </button>
      )}
    </section>
  );
}
