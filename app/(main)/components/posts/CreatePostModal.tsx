"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import CreatePostForm from "./CreatePostForm";

export type CreatePostModalProps = {
  onClose: () => void;
  open: boolean;
};

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function CreatePostModal({
  onClose,
  open,
}: CreatePostModalProps) {
  const [isPending, setIsPending] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const closeWhenSafe = useCallback(() => {
    if (!isPending) {
      onClose();
    }
  }, [isPending, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const initialTarget =
        dialogRef.current?.querySelector<HTMLElement>(
          "[data-dialog-initial-focus]",
        ) ??
        dialogRef.current?.querySelector<HTMLElement>(focusableSelector) ??
        dialogRef.current;

      initialTarget?.focus();
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previouslyFocused?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isPending) {
          return;
        }

        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") && element.tabIndex >= 0,
      );

      if (!focusableElements.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose, open]);

  function handleBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeWhenSafe();
    }
  }

  function handleCreated() {
    onClose();
    router.refresh();
  }

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 backdrop-blur-[1px] sm:p-5"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        aria-labelledby="create-post-modal-title"
        aria-modal="true"
        className="flex h-[min(900px,calc(100dvh-24px))] w-[min(760px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] text-[var(--app-text)] shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:h-[min(900px,calc(100dvh-40px))] sm:w-[min(760px,calc(100vw-40px))]"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="relative flex h-16 shrink-0 items-center justify-center border-b border-[var(--app-border-strong)] px-14">
          <h2
            className="truncate text-lg font-bold sm:text-xl"
            id="create-post-modal-title"
          >
            Tạo bài viết mới
          </h2>
          <button
            aria-label="Đóng cửa sổ tạo bài viết"
            className="absolute right-3 flex size-11 items-center justify-center rounded-full text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isPending}
            onClick={closeWhenSafe}
            type="button"
          >
            <X aria-hidden="true" className="size-6" strokeWidth={1.8} />
          </button>
        </header>

        <CreatePostForm
          onCancel={closeWhenSafe}
          onCreated={handleCreated}
          onPendingChange={setIsPending}
          variant="modal"
        />
      </div>
    </div>,
    document.body,
  );
}
