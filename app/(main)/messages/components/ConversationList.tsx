"use client";

import type { Conversation } from "@/app/services/message.action";
import { ImageIcon, LoaderCircle, Search, SquarePen } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import MessageAvatar from "./MessageAvatar";
import {
  formatConversationTime,
  getConversationPartner,
} from "./message-utils";

type ConversationListProps = {
  conversations: Conversation[];
  currentUserId: string;
  error?: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onNewConversation: () => void;
  selectedConversationId?: string;
  unreadCount: number;
};

export default function ConversationList({
  conversations,
  currentUserId,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onNewConversation,
  selectedConversationId,
  unreadCount,
}: ConversationListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) => {
        if (!normalizedQuery) {
          return true;
        }

        const partner = getConversationPartner(conversation, currentUserId);
        return [partner?.fullName, partner?.username]
          .filter(Boolean)
          .some((value) =>
            value?.toLocaleLowerCase("vi").includes(normalizedQuery),
          );
      }),
    [conversations, currentUserId, normalizedQuery],
  );

  return (
    <aside
      aria-label="Danh sách cuộc trò chuyện"
      className={`min-h-0 flex-col border-[var(--app-border)] bg-[var(--app-background-elevated)] md:flex md:border-r ${
        selectedConversationId ? "hidden" : "flex"
      }`}
    >
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold text-[var(--app-text)]">Tin nhắn</h1>
            {unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} tin nhắn chưa đọc`}
                className="flex min-w-5 items-center justify-center rounded-full bg-[#5364e8] px-1.5 py-0.5 text-[11px] font-bold text-white"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--app-muted)]">
            {conversations.length} cuộc trò chuyện
          </p>
        </div>

        <button
          aria-label="Tạo cuộc trò chuyện mới"
          className="rounded-full p-2.5 text-[var(--app-text)] transition hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#7886ff] focus-visible:outline-none"
          onClick={onNewConversation}
          type="button"
        >
          <SquarePen aria-hidden="true" className="size-5.5" />
        </button>
      </header>

      <div className="px-4 pb-3">
        <label className="relative block">
          <span className="sr-only">Tìm cuộc trò chuyện</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--app-subtle)]"
          />
          <input
            className="h-10 w-full rounded-xl border border-transparent bg-[var(--app-input)] pr-3 pl-9 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)] focus:border-[#6675ef]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm"
            type="search"
            value={query}
          />
        </label>
      </div>

      {error && (
        <p
          className="mx-4 mb-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {filteredConversations.length ? (
          <ul className="space-y-1">
            {filteredConversations.map((conversation) => {
              const partner = getConversationPartner(
                conversation,
                currentUserId,
              );
              const isActive = conversation._id === selectedConversationId;
              const lastMessage = conversation.lastMessage;
              const isOwnLastMessage =
                lastMessage?.senderId === currentUserId;
              const preview = lastMessage
                ? lastMessage.messageType === "image"
                  ? "Đã gửi một ảnh"
                  : lastMessage.content || "Tin nhắn mới"
                : "Bắt đầu trò chuyện";

              return (
                <li key={conversation._id}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition focus-visible:ring-2 focus-visible:ring-[#7886ff] focus-visible:outline-none ${
                      isActive
                        ? "bg-[var(--app-hover)]"
                        : "hover:bg-[var(--app-hover)]"
                    }`}
                    href={`/messages/${encodeURIComponent(conversation._id)}`}
                  >
                    <div className="relative">
                      <MessageAvatar user={partner} />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-[var(--app-background-elevated)] bg-[#5364e8]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm text-[var(--app-text)] ${
                            conversation.unreadCount > 0
                              ? "font-bold"
                              : "font-medium"
                          }`}
                        >
                          {partner?.fullName?.trim() ||
                            partner?.username ||
                            "Người dùng Instagram"}
                        </p>
                        <time className="shrink-0 text-[11px] text-[var(--app-subtle)]">
                          {formatConversationTime(conversation.lastMessageAt)}
                        </time>
                      </div>
                      <p
                        className={`mt-0.5 flex min-w-0 items-center gap-1 truncate text-xs ${
                          conversation.unreadCount > 0
                            ? "font-semibold text-[var(--app-muted)]"
                            : "text-[var(--app-subtle)]"
                        }`}
                      >
                        {lastMessage?.messageType === "image" && (
                          <ImageIcon
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                          />
                        )}
                        <span className="truncate">
                          {isOwnLastMessage ? "Bạn: " : ""}
                          {preview}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-full min-h-44 flex-col items-center justify-center px-5 text-center">
            <p className="text-sm font-semibold text-[var(--app-text)]">
              {normalizedQuery
                ? "Không tìm thấy cuộc trò chuyện"
                : "Chưa có cuộc trò chuyện"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
              {normalizedQuery
                ? "Thử tìm bằng tên hoặc username khác."
                : "Chọn nút soạn tin để bắt đầu."}
            </p>
          </div>
        )}

        {hasMore && !normalizedQuery && (
          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#5364e8] transition hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoadingMore}
            onClick={onLoadMore}
            type="button"
          >
            {isLoadingMore && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            )}
            {isLoadingMore ? "Đang tải..." : "Xem thêm"}
          </button>
        )}
      </div>
    </aside>
  );
}
