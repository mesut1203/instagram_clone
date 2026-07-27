import { Heart } from "lucide-react";

export default function NotificationsPage() {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-[660px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full border border-[var(--app-border-strong)]">
        <Heart aria-hidden="true" className="size-9" strokeWidth={1.7} />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-[var(--app-text)]">Thông báo</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--app-muted)]">
        Những lượt thích, bình luận và người theo dõi mới sẽ xuất hiện tại đây.
      </p>
    </section>
  );
}
