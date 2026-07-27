import { LoaderCircle } from "lucide-react";

export default function MessagesLoading() {
  return (
    <div
      aria-label="Đang tải tin nhắn"
      className="flex h-dvh items-center justify-center bg-[var(--app-background)]"
      role="status"
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-7 animate-spin text-[#7886ff]"
      />
      <span className="sr-only">Đang tải tin nhắn...</span>
    </div>
  );
}
