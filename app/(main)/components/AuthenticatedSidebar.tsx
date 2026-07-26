"use client";

import { logout } from "@/app/services/auth.action";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

type AuthenticatedSidebarProps = {
  user: {
    displayName: string;
    initial: string;
    username: string;
  };
};

type IconProps = {
  className?: string;
};

type NavigationItem = {
  href?: string;
  icon: ComponentType<IconProps>;
  label: string;
};

function HomeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ExploreIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function MessageIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M20.5 4.2 3.8 10.7l6.5 2.5 2.5 6.5 7.7-15.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="m10.3 13.2 3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M20.8 9.2c0 5.4-8.8 10.3-8.8 10.3S3.2 14.6 3.2 9.2A4.5 4.5 0 0 1 12 7.8a4.5 4.5 0 0 1 8.8 1.4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CreateIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="17" rx="2" stroke="currentColor" strokeWidth="2" width="17" x="3.5" y="3.5" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MenuIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

const navigationItems: NavigationItem[] = [
  { href: "/", icon: HomeIcon, label: "Trang chủ" },
  { icon: SearchIcon, label: "Tìm kiếm" },
  { icon: ExploreIcon, label: "Khám phá" },
  { icon: MessageIcon, label: "Tin nhắn" },
  { icon: HeartIcon, label: "Thông báo" },
  { icon: CreateIcon, label: "Tạo" },
];

function NavigationButton({ item, isActive }: { item: NavigationItem; isActive: boolean }) {
  const Icon = item.icon;
  const className = `flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-[17px] transition ${
    isActive
      ? "font-bold text-white"
      : "text-[#e7e9ed] hover:bg-white/[0.07] hover:text-white"
  }`;
  const content = (
    <>
      <Icon className="size-7 shrink-0" />
      <span>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link aria-current={isActive ? "page" : undefined} className={className} href={item.href}>
        {content}
      </Link>
    );
  }

  return (
    <button aria-label={item.label} className={className} type="button">
      {content}
    </button>
  );
}

export default function AuthenticatedSidebar({ user }: AuthenticatedSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[264px] flex-col border-r border-white/[0.09] bg-[#0b0e12] px-5 py-8 lg:flex">
      <Link aria-label="Instagram - Trang chủ" className="mb-12 px-3 text-[38px] leading-none text-white instagram-wordmark" href="/">
        Instagram
      </Link>

      <nav aria-label="Điều hướng chính" className="space-y-2">
        {navigationItems.map((item) => (
          <NavigationButton
            isActive={item.href === pathname}
            item={item}
            key={item.label}
          />
        ))}

        <Link
          className="mt-1 flex items-center gap-4 rounded-xl px-3 py-3 text-[17px] font-bold text-white transition hover:bg-white/[0.07]"
          href="/"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#e5e7eb] text-sm font-bold text-[#111318]">
            {user.initial}
          </span>
          <span className="min-w-0 truncate">Trang cá nhân</span>
        </Link>
      </nav>

      <div className="mt-auto space-y-1">
        <button className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-[17px] text-[#e7e9ed] transition hover:bg-white/[0.07] hover:text-white" type="button">
          <MenuIcon className="size-7 shrink-0" />
          <span>Xem thêm</span>
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#aeb3bc] transition hover:bg-white/[0.07] hover:text-white"
          onClick={() => void logout()}
          type="button"
        >
          Đăng xuất {user.username ? `(${user.username})` : ""}
        </button>
      </div>
    </aside>
  );
}
