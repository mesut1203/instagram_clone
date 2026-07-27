import { CircleAlert } from "lucide-react";
import Link from "next/link";

export default function ProfileError({ message }: { message: string }) {
  return (
    <section className="mx-auto flex min-h-[65dvh] w-full max-w-lg items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center shadow-2xl shadow-black/20">
        <CircleAlert
          aria-hidden="true"
          className="mx-auto size-10 text-[#f87171]"
        />
        <h1 className="mt-4 text-xl font-bold text-[var(--app-text)]">
          Không thể tải trang cá nhân
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{message}</p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-[#4154c8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5367df]"
          href="/"
        >
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}
