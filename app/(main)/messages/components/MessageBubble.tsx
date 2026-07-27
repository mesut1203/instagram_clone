/* eslint-disable @next/next/no-img-element */

import type { DirectMessage } from "@/app/services/message.action";
import { Check, CheckCheck } from "lucide-react";
import { formatMessageTime } from "./message-utils";

type MessageBubbleProps = {
  currentUserId: string;
  message: DirectMessage;
};

export default function MessageBubble({
  currentUserId,
  message,
}: MessageBubbleProps) {
  const isOwnMessage = message.senderId._id === currentUserId;

  return (
    <li
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
      data-message-id={message._id}
    >
      <div
        className={`max-w-[82%] overflow-hidden sm:max-w-[70%] ${
          message.messageType === "image"
            ? "rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-surface)]"
            : isOwnMessage
              ? "rounded-2xl rounded-br-md bg-[#5364e8] px-4 py-2.5 text-white"
              : "rounded-2xl rounded-bl-md bg-[var(--app-menu)] px-4 py-2.5 text-[var(--app-text)]"
        }`}
      >
        {message.messageType === "image" && message.imageUrl ? (
          <a
            aria-label="Mở ảnh trong tab mới"
            href={message.imageUrl}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt="Ảnh được gửi trong cuộc trò chuyện"
              className="max-h-[420px] w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={message.imageUrl}
            />
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-5.5">
            {message.content}
          </p>
        )}

        <span
          className={`flex items-center justify-end gap-1 text-[10px] ${
            message.messageType === "image"
              ? "px-2.5 py-1.5 text-[var(--app-muted)]"
              : isOwnMessage
                ? "mt-1 text-white/70"
                : "mt-1 text-[var(--app-muted)]"
          }`}
        >
          {formatMessageTime(message.createdAt)}
          {isOwnMessage &&
            (message.isRead ? (
              <CheckCheck aria-label="Đã đọc" className="size-3.5" />
            ) : (
              <Check aria-label="Đã gửi" className="size-3.5" />
            ))}
        </span>
      </div>
    </li>
  );
}
