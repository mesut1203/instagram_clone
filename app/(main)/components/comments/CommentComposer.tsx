"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useId, type FormEvent } from "react";

type CommentComposerProps = {
  autoFocus?: boolean;
  buttonLabel?: string;
  error?: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  value: string;
};

export default function CommentComposer({
  autoFocus = false,
  buttonLabel = "Đăng",
  error,
  isSubmitting,
  onChange,
  onSubmit,
  placeholder = "Thêm bình luận...",
  value,
}: CommentComposerProps) {
  const generatedId = useId();
  const inputId = `comment-content-${generatedId}`;
  const errorId = error ? `comment-composer-error-${generatedId}` : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <div className="flex items-end gap-2 rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-2 transition focus-within:border-[#6d7ce8] focus-within:ring-2 focus-within:ring-[#5264df]/20">
        <label className="sr-only" htmlFor={inputId}>
          Nội dung bình luận
        </label>
        <textarea
          aria-describedby={errorId}
          autoFocus={autoFocus}
          className="max-h-36 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-5 text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
          disabled={isSubmitting}
          id={inputId}
          maxLength={2200}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={1}
          value={value}
        />
        <button
          aria-label={buttonLabel}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#5264df] text-white transition hover:bg-[#6072ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d9aff] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isSubmitting || !value.trim()}
          type="submit"
        >
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>

      <div className="flex min-h-5 items-start justify-between gap-3 px-1">
        {error ? (
          <p
            className="text-xs leading-5 text-[#ff8b9c]"
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : (
          <span />
        )}
        {value.length >= 2000 && (
          <span className="shrink-0 text-xs text-[var(--app-muted)]">
            {value.length}/2.200
          </span>
        )}
      </div>
    </form>
  );
}
