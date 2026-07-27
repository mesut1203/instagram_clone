"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingMessagesButton({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const pathname = usePathname();
  const isMessagesRoute =
    pathname === "/messages" || pathname.startsWith("/messages/");

  if (isMessagesRoute) {
    return null;
  }

  return (
    <Link
      aria-label="Mở tin nhắn"
      className="fixed right-6 bottom-6 hidden items-center gap-2.5 rounded-full border border-[var(--app-border)] bg-[var(--app-menu)] px-5 py-3 text-base font-bold text-[var(--app-text)] shadow-2xl shadow-black/15 transition hover:bg-[var(--app-hover)] lg:flex"
      href="/messages"
    >
      <Send aria-hidden="true" className="size-6" strokeWidth={1.9} />
      Tin nhắn
      {unreadCount > 0 && (
        <span className="rounded-full bg-[#ed4956] px-2 py-0.5 text-xs text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
