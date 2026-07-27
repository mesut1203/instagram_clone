"use client";

import type {
  DirectMessage,
  MessagePagination,
  MessageUser,
} from "@/app/services/message.action";
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import MessageAvatar from "./MessageAvatar";
import MessageBubble from "./MessageBubble";

type MessageThreadProps = {
  currentUserId: string;
  error?: string;
  isLoadingOlder: boolean;
  isPartnerTyping: boolean;
  isSending: boolean;
  messages: DirectMessage[];
  onLoadOlder: () => void;
  onSendImage: (file: File) => Promise<boolean>;
  onSendText: (content: string) => Promise<boolean>;
  onTypingChange: (isTyping: boolean) => void;
  pagination: MessagePagination;
  partner: MessageUser;
};

export default function MessageThread({
  currentUserId,
  error,
  isLoadingOlder,
  isPartnerTyping,
  isSending,
  messages,
  onLoadOlder,
  onSendImage,
  onSendText,
  onTypingChange,
  pagination,
  partner,
}: MessageThreadProps) {
  const [content, setContent] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const lastMessageId = messages.at(-1)?._id;

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [lastMessageId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim() || isSending) {
      return;
    }

    const wasSent = await onSendText(content);

    if (wasSent) {
      setContent("");
      onTypingChange(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    event.target.value = "";

    if (image) {
      await onSendImage(image);
    }
  };

  const handleComposerKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const partnerName =
    partner.fullName?.trim() || partner.username || "Người dùng Instagram";

  return (
    <section
      aria-label={`Cuộc trò chuyện với ${partnerName}`}
      className="flex min-h-0 flex-1 flex-col bg-[var(--app-background)]"
    >
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--app-border)] px-4 sm:px-5">
        <Link
          aria-label="Quay lại danh sách tin nhắn"
          className="rounded-full p-2 text-[var(--app-text)] transition hover:bg-[var(--app-hover)] md:hidden"
          href="/messages"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <MessageAvatar size="small" user={partner} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--app-text)]">{partnerName}</p>
          <p
            className={`truncate text-xs ${
              isPartnerTyping ? "text-[#5364e8]" : "text-[var(--app-muted)]"
            }`}
          >
            {isPartnerTyping ? "Đang nhập..." : `@${partner.username}`}
          </p>
        </div>
      </header>

      <div
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {pagination.hasMore && (
          <div className="mb-5 flex justify-center">
            <button
              className="flex items-center gap-2 rounded-full bg-[var(--app-surface)] px-4 py-2 text-xs font-semibold text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoadingOlder}
              onClick={onLoadOlder}
              type="button"
            >
              {isLoadingOlder && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin"
                />
              )}
              {isLoadingOlder ? "Đang tải..." : "Tải tin nhắn cũ"}
            </button>
          </div>
        )}

        {messages.length ? (
          <ul className="space-y-2.5">
            {messages.map((message) => (
              <MessageBubble
                currentUserId={currentUserId}
                key={message._id}
                message={message}
              />
            ))}
          </ul>
        ) : (
          <div className="flex min-h-full flex-col items-center justify-center py-10 text-center">
            <MessageAvatar size="large" user={partner} />
            <h2 className="mt-4 text-lg font-bold text-[var(--app-text)]">{partnerName}</h2>
            <p className="mt-1 max-w-xs text-sm leading-6 text-[var(--app-muted)]">
              Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.
            </p>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {error && (
        <p
          className="mx-4 mb-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-center text-xs text-red-200 sm:mx-5"
          role="alert"
        >
          {error}
        </p>
      )}

      <form
        className="shrink-0 border-t border-[var(--app-border)] p-3 sm:p-4"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-2 focus-within:border-[#6574ed] focus-within:ring-2 focus-within:ring-[#6574ed]/15">
          <input
            accept="image/jpeg,image/png,image/gif"
            className="sr-only"
            disabled={isSending}
            onChange={handleImageChange}
            ref={imageInputRef}
            type="file"
          />
          <button
            aria-label="Gửi ảnh"
            className="shrink-0 rounded-xl p-2.5 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSending}
            onClick={() => imageInputRef.current?.click()}
            type="button"
          >
            <ImagePlus aria-hidden="true" className="size-5" />
          </button>

          <label className="sr-only" htmlFor="message-content">
            Nội dung tin nhắn
          </label>
          <textarea
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-5 text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
            disabled={isSending}
            id="message-content"
            maxLength={5_000}
            onChange={(event) => {
              const nextContent = event.target.value;
              setContent(nextContent);
              onTypingChange(Boolean(nextContent.trim()));
            }}
            onKeyDown={handleComposerKeyDown}
            placeholder="Nhắn tin..."
            rows={1}
            value={content}
          />

          <button
            aria-label="Gửi tin nhắn"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#5364e8] text-white transition hover:bg-[#6070ef] disabled:cursor-not-allowed disabled:bg-[var(--app-hover)] disabled:text-[var(--app-subtle)]"
            disabled={isSending || !content.trim()}
            type="submit"
          >
            {isSending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4.5 animate-spin"
              />
            ) : (
              <Send aria-hidden="true" className="size-4.5" />
            )}
          </button>
        </div>
        <p className="mt-1.5 px-2 text-[10px] text-[var(--app-subtle)]">
          Enter để gửi, Shift + Enter để xuống dòng. Ảnh tối đa 10 MB.
        </p>
      </form>
    </section>
  );
}

export function EmptyMessageThread() {
  return (
    <section className="hidden min-h-0 flex-1 flex-col items-center justify-center bg-[var(--app-background)] px-8 text-center md:flex">
      <span className="flex size-20 items-center justify-center rounded-full border border-[var(--app-border-strong)]">
        <MessageCircle
          aria-hidden="true"
          className="size-9 text-[var(--app-muted)]"
          strokeWidth={1.5}
        />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[var(--app-text)]">Tin nhắn của bạn</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--app-muted)]">
        Chọn một cuộc trò chuyện hoặc tạo tin nhắn mới để bắt đầu.
      </p>
    </section>
  );
}
