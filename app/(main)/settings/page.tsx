import {
  ChevronRight,
  KeyRound,
  Settings,
  UserRoundPen,
} from "lucide-react";
import Link from "next/link";

const settingsItems = [
  {
    description: "Ảnh đại diện, tên, tiểu sử, website và giới tính",
    href: "/profile/edit",
    icon: UserRoundPen,
    label: "Chỉnh sửa trang cá nhân",
  },
  {
    description: "Cập nhật mật khẩu và tăng cường bảo mật tài khoản",
    href: "/settings/change-password",
    icon: KeyRound,
    label: "Đổi mật khẩu",
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-7">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-[#8f9cff] uppercase">
          <Settings aria-hidden="true" className="size-4" />
          Tài khoản
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Quản lý thông tin cá nhân và bảo mật.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl shadow-black/20">
        <ul className="divide-y divide-[var(--app-border)]">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  className="group flex items-center gap-4 px-5 py-5 transition hover:bg-[var(--app-hover)] focus-visible:bg-[var(--app-hover)] focus-visible:outline-none sm:px-6"
                  href={item.href}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-input)] text-[#8f9cff] transition group-hover:bg-[var(--app-hover)]">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--app-text)]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[var(--app-muted)]">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-[var(--app-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--app-text)]"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
