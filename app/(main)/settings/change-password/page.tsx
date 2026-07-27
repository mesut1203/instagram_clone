import { ChevronLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import ChangePasswordForm from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto w-full max-w-[620px] px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-6 flex items-start gap-3">
        <Link
          aria-label="Quay lại cài đặt"
          className="mt-0.5 rounded-lg p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
          href="/settings"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
            <KeyRound aria-hidden="true" className="size-6 text-[#8f9cff]" />
            Đổi mật khẩu
          </h1>
          <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-2xl shadow-black/20 sm:p-7">
        <ChangePasswordForm />
      </section>
    </div>
  );
}
