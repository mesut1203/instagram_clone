"use client";

/* eslint-disable @next/next/no-img-element */

import { logout } from "@/app/services/auth.action";
import CreatePostModal from "./posts/CreatePostModal";
import SearchSidebarPanel from "./search/SearchSidebarPanel";
import {
  Bookmark,
  Camera,
  ChevronLeft,
  Compass,
  Heart,
  House,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  SquarePlus,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

type AuthenticatedSidebarProps = {
  unreadCount?: number;
  user: {
    displayName: string;
    initial: string;
    profilePicture?: string | null;
  };
};

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const navigationItems: NavigationItem[] = [
  { href: "/", icon: House, label: "Trang chủ" },
  { href: "/search", icon: Search, label: "Tìm kiếm" },
  { href: "/explore", icon: Compass, label: "Khám phá" },
  { href: "/messages", icon: MessageCircle, label: "Tin nhắn" },
  { href: "/notifications", icon: Heart, label: "Thông báo" },
  { href: "/create", icon: SquarePlus, label: "Tạo" },
];

const THEME_STORAGE_KEY = "instagram-color-theme";

type ColorTheme = "dark" | "light";

function getCurrentColorTheme(): ColorTheme {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "light"
    ? "light"
    : "dark";
}

function applyColorTheme(theme: ColorTheme) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still changes for this session when storage is unavailable.
  }
}

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavigationButton({
  compact,
  isSearchPanelOpen,
  item,
  onCreatePost,
  onNavigate,
  onOpenSearch,
  pathname,
  searchTriggerRef,
  unreadCount,
}: {
  compact: boolean;
  isSearchPanelOpen: boolean;
  item: NavigationItem;
  onCreatePost: () => void;
  onNavigate: () => void;
  onOpenSearch: () => void;
  pathname: string;
  searchTriggerRef: RefObject<HTMLButtonElement | null>;
  unreadCount: number;
}) {
  const Icon = item.icon;
  const isActive =
    item.href === "/search"
      ? isSearchPanelOpen || isActiveRoute(pathname, item.href)
      : isActiveRoute(pathname, item.href);
  const className = `flex w-full items-center rounded-xl py-3.5 text-left text-[17px] transition-colors focus-visible:ring-2 focus-visible:ring-[#4b74ff] focus-visible:outline-none 2xl:py-4 2xl:text-[18px] ${
    compact ? "justify-center px-0" : "gap-4 px-3"
  } ${
    isActive
      ? "bg-[var(--app-hover)] font-bold text-[var(--app-text)]"
      : "text-[var(--app-text)] hover:bg-[var(--app-hover)]"
  }`;
  const content = (
    <>
      <span className="relative">
        <Icon
          aria-hidden="true"
          className="size-7 shrink-0"
          fill={isActive && item.href === "/" ? "currentColor" : "none"}
          strokeWidth={isActive ? 2.3 : 1.9}
        />
        {item.href === "/messages" && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex min-w-5 items-center justify-center rounded-full bg-[#ed4956] px-1 text-[10px] leading-5 font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </span>
      {!compact && <span>{item.label}</span>}
    </>
  );

  if (item.href === "/search") {
    return (
      <button
        aria-controls="desktop-search-panel"
        aria-expanded={isSearchPanelOpen}
        aria-label={item.label}
        className={className}
        onClick={onOpenSearch}
        ref={searchTriggerRef}
        title={compact ? item.label : undefined}
        type="button"
      >
        {content}
      </button>
    );
  }

  if (item.href === "/create") {
    return (
      <button
        aria-label="Tạo bài viết"
        className={className}
        onClick={onCreatePost}
        title={compact ? item.label : undefined}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={className}
      href={item.href}
      onClick={onNavigate}
      title={compact ? item.label : undefined}
    >
      {content}
    </Link>
  );
}

function SidebarAvatar({
  displayName,
  initial,
  profilePicture,
}: {
  displayName: string;
  initial: string;
  profilePicture?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span
      aria-label={`Ảnh đại diện của ${displayName}`}
      className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb] text-sm font-semibold text-[#111318] 2xl:size-9"
      role="img"
    >
      {profilePicture && !imageFailed ? (
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
          referrerPolicy="no-referrer"
          src={profilePicture}
        />
      ) : (
        initial
      )}
    </span>
  );
}

function MobileNavigation({
  onCreatePost,
  pathname,
  unreadCount,
}: {
  onCreatePost: () => void;
  pathname: string;
  unreadCount: number;
}) {
  const mobileItems = [
    ...navigationItems.slice(0, 3),
    navigationItems[5],
    navigationItems[3],
    { href: "/profile", icon: UserRound, label: "Cá nhân" },
  ];

  return (
    <nav
      aria-label="Điều hướng di động"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-[var(--app-border)] bg-[var(--app-background)]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(pathname, item.href);
        const className = `relative flex min-h-16 items-center justify-center transition ${
          isActive
            ? "text-[var(--app-text)]"
            : "text-[var(--app-muted)]"
        }`;
        const content = (
          <span className="relative">
            <Icon
              aria-hidden="true"
              className="size-6"
              fill={
                isActive && ["/", "/profile"].includes(item.href)
                  ? "currentColor"
                  : "none"
              }
              strokeWidth={isActive ? 2.4 : 1.9}
            />
            {item.href === "/messages" && unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex min-w-4 items-center justify-center rounded-full bg-[#ed4956] px-1 text-[9px] leading-4 font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
        );

        if (item.href === "/create") {
          return (
            <button
              aria-label={item.label}
              className={className}
              key={item.href}
              onClick={onCreatePost}
              type="button"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            className={className}
            href={item.href}
            key={item.href}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AuthenticatedSidebar({
  unreadCount = 0,
  user,
}: AuthenticatedSidebarProps) {
  const pathname = usePathname();
  const moreMenuContainerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const themeMenuBackRef = useRef<HTMLButtonElement>(null);
  const themeMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMoreMenuHovered, setIsMoreMenuHovered] = useState(false);
  const [isMoreMenuPinned, setIsMoreMenuPinned] = useState(false);
  const [searchPanelPathname, setSearchPanelPathname] = useState<string | null>(
    null,
  );
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ColorTheme>(getCurrentColorTheme);
  const isMoreMenuOpen = isMoreMenuHovered || isMoreMenuPinned;
  const isSearchPanelOpen = searchPanelPathname === pathname;

  useEffect(() => {
    if (!isMoreMenuOpen) {
      return;
    }

    function closeMenuAndReturnFocus() {
      setIsMoreMenuHovered(false);
      setIsMoreMenuPinned(false);
      setIsThemeMenuOpen(false);
      moreMenuTriggerRef.current?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !moreMenuContainerRef.current?.contains(event.target)
      ) {
        setIsMoreMenuHovered(false);
        setIsMoreMenuPinned(false);
        setIsThemeMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();

        if (isThemeMenuOpen) {
          setIsThemeMenuOpen(false);
          window.requestAnimationFrame(() => {
            themeMenuTriggerRef.current?.focus();
          });
          return;
        }

        closeMenuAndReturnFocus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreMenuOpen, isThemeMenuOpen]);

  function closeMoreMenu() {
    setIsMoreMenuHovered(false);
    setIsMoreMenuPinned(false);
    setIsThemeMenuOpen(false);
  }

  function dismissSearchPanel() {
    setSearchPanelPathname(null);
  }

  function closeSearchPanel() {
    dismissSearchPanel();
    window.requestAnimationFrame(() => {
      searchTriggerRef.current?.focus();
    });
  }

  function openSearchPanel() {
    closeMoreMenu();
    setSearchPanelPathname(pathname);
  }

  function openCreatePost() {
    closeMoreMenu();
    dismissSearchPanel();
    setIsCreatePostOpen(true);
  }

  function openThemeMenu() {
    setIsMoreMenuPinned(true);
    setIsThemeMenuOpen(true);
    window.requestAnimationFrame(() => {
      themeMenuBackRef.current?.focus();
    });
  }

  function closeThemeMenu() {
    setIsThemeMenuOpen(false);
    window.requestAnimationFrame(() => {
      themeMenuTriggerRef.current?.focus();
    });
  }

  function toggleTheme() {
    const nextTheme: ColorTheme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    applyColorTheme(nextTheme);
  }

  function toggleMoreMenu() {
    if (isSearchPanelOpen) {
      dismissSearchPanel();
      setIsMoreMenuPinned(true);
      return;
    }

    if (isMoreMenuPinned) {
      closeMoreMenu();
      return;
    }

    setIsMoreMenuPinned(true);
  }

  useEffect(() => {
    if (!isSearchPanelOpen) {
      return;
    }

    const desktopMedia = window.matchMedia("(min-width: 1024px)");

    function closeBelowDesktop(event: MediaQueryListEvent) {
      if (!event.matches) {
        dismissSearchPanel();
      }
    }

    desktopMedia.addEventListener("change", closeBelowDesktop);
    return () => {
      desktopMedia.removeEventListener("change", closeBelowDesktop);
    };
  }, [isSearchPanelOpen]);

  function handleMoreTriggerKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    setIsMoreMenuPinned(true);
    window.requestAnimationFrame(() => {
      const menuItems =
        moreMenuRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]',
        );
      const target =
        event.key === "ArrowUp"
          ? menuItems?.[menuItems.length - 1]
          : menuItems?.[0];
      target?.focus();
    });
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (
      !["ArrowDown", "ArrowUp", "End", "Home"].includes(event.key)
    ) {
      return;
    }

    const items = Array.from(
      moreMenuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
    if (!items.length) {
      return;
    }

    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;

    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else {
      nextIndex =
        currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    }

    items[nextIndex]?.focus();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-background)]/95 px-4 backdrop-blur lg:hidden">
        <Link
          aria-label="Instagram - Trang chủ"
          className="text-[29px] leading-none text-[var(--app-text)] instagram-wordmark"
          href="/"
        >
          Instagram
        </Link>
        <div className="flex items-center gap-1">
          <button
            aria-label="Tạo bài viết"
            className="rounded-full p-2 text-[var(--app-text)] hover:bg-[var(--app-hover)]"
            onClick={openCreatePost}
            type="button"
          >
            <SquarePlus aria-hidden="true" className="size-6" />
          </button>
          <Link
            aria-label="Tin nhắn"
            className="relative rounded-full p-2 text-[var(--app-text)] hover:bg-[var(--app-hover)]"
            href="/messages"
          >
            <MessageCircle aria-hidden="true" className="size-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 size-2.5 rounded-full bg-[#ed4956]" />
            )}
          </Link>
        </div>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-[var(--app-border)] bg-[var(--app-background)] py-8 transition-[width,padding,background-color,border-color] duration-200 motion-reduce:transition-none lg:flex ${
          isSearchPanelOpen
            ? "w-[120px] px-4"
            : "w-[var(--app-sidebar-width)] px-6"
        }`}
      >
        <Link
          aria-label="Instagram - Trang chủ"
          className={`mb-11 flex h-10 items-center text-[var(--app-text)] ${
            isSearchPanelOpen ? "justify-center px-0" : "px-3"
          }`}
          href="/"
          onClick={dismissSearchPanel}
        >
          {isSearchPanelOpen ? (
            <Camera aria-hidden="true" className="size-8" strokeWidth={1.9} />
          ) : (
            <span className="text-[35px] leading-none instagram-wordmark">
              Instagram
            </span>
          )}
        </Link>

        <nav aria-label="Điều hướng chính" className="space-y-1.5">
          {navigationItems.map((item) => (
            <NavigationButton
              compact={isSearchPanelOpen}
              isSearchPanelOpen={isSearchPanelOpen}
              item={item}
              key={item.href}
              onCreatePost={openCreatePost}
              onNavigate={dismissSearchPanel}
              onOpenSearch={openSearchPanel}
              pathname={pathname}
              searchTriggerRef={searchTriggerRef}
              unreadCount={unreadCount}
            />
          ))}

          <Link
            aria-current={
              pathname.startsWith("/profile") ? "page" : undefined
            }
            aria-label={`${user.displayName} - Trang cá nhân`}
            className={`mt-1 flex items-center rounded-xl py-3.5 text-[17px] transition-colors hover:bg-[var(--app-hover)] 2xl:py-4 2xl:text-[18px] ${
              isSearchPanelOpen ? "justify-center px-0" : "gap-4 px-3"
            } ${
              pathname.startsWith("/profile")
                ? "bg-[var(--app-hover)] font-bold text-[var(--app-text)]"
                : "text-[var(--app-text)]"
            }`}
            href="/profile"
            onClick={dismissSearchPanel}
            title={isSearchPanelOpen ? "Trang cá nhân" : undefined}
          >
            <SidebarAvatar
              displayName={user.displayName}
              initial={user.initial}
              profilePicture={user.profilePicture}
            />
            {!isSearchPanelOpen && (
              <span className="min-w-0 truncate">Trang cá nhân</span>
            )}
          </Link>
        </nav>

        <div
          className="relative mt-auto"
          onMouseEnter={() => {
            if (!isSearchPanelOpen) {
              setIsMoreMenuHovered(true);
            }
          }}
          onMouseLeave={() => setIsMoreMenuHovered(false)}
          ref={moreMenuContainerRef}
        >
          {isMoreMenuOpen && (
            <div className="absolute inset-x-0 bottom-full z-50 pb-3">
              <div
                aria-label={
                  isThemeMenuOpen
                    ? "Chuyển chế độ"
                    : "Tùy chọn tài khoản"
                }
                className={`overflow-hidden rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-menu)] shadow-[0_18px_55px_rgba(0,0,0,0.18)] ${
                  isThemeMenuOpen ? "min-w-[320px] p-0" : "p-2"
                }`}
                id="sidebar-more-menu"
                onKeyDown={
                  isThemeMenuOpen ? undefined : handleMenuKeyDown
                }
                ref={moreMenuRef}
                role={isThemeMenuOpen ? "group" : "menu"}
              >
                {isThemeMenuOpen ? (
                  <>
                    <div className="grid h-16 grid-cols-[40px_minmax(0,1fr)_40px] items-center border-b border-[var(--app-border-strong)] px-3">
                      <button
                        aria-label="Quay lại tùy chọn tài khoản"
                        className="flex size-10 items-center justify-center rounded-full text-[var(--app-text)] transition-colors hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
                        onClick={closeThemeMenu}
                        ref={themeMenuBackRef}
                        type="button"
                      >
                        <ChevronLeft
                          aria-hidden="true"
                          className="size-7"
                          strokeWidth={2.2}
                        />
                      </button>
                      <h2 className="truncate text-center text-lg font-bold text-[var(--app-text)]">
                        Chuyển chế độ
                      </h2>
                      <span className="flex size-10 items-center justify-center text-[var(--app-text)]">
                        <Moon
                          aria-hidden="true"
                          className="theme-dark-only size-7"
                          strokeWidth={1.9}
                        />
                        <Sun
                          aria-hidden="true"
                          className="theme-light-only size-7"
                          strokeWidth={1.9}
                        />
                      </span>
                    </div>

                    <button
                      aria-checked={theme === "dark"}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[17px] font-medium text-[var(--app-text)] transition-colors hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8f9cff] focus-visible:outline-none"
                      onClick={toggleTheme}
                      role="switch"
                      type="button"
                    >
                      <span>Chế độ tối</span>
                      <span
                        aria-hidden="true"
                        className={`relative h-8 w-16 shrink-0 rounded-full border transition-colors motion-reduce:transition-none ${
                          theme === "dark"
                            ? "border-[#4154c8] bg-[#4154c8]"
                            : "border-[var(--app-border-strong)] bg-[#737b8c]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 size-7 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
                            theme === "dark"
                              ? "translate-x-8"
                              : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-[var(--app-text)] transition-colors hover:bg-[var(--app-hover)] focus-visible:bg-[var(--app-hover)] focus-visible:outline-none"
                      href="/profile?filter=saved"
                      onClick={closeMoreMenu}
                      role="menuitem"
                    >
                      <Bookmark
                        aria-hidden="true"
                        className="size-5 shrink-0"
                        strokeWidth={1.9}
                      />
                      <span>Bài viết đã lưu</span>
                    </Link>
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium text-[var(--app-text)] transition-colors hover:bg-[var(--app-hover)] focus-visible:bg-[var(--app-hover)] focus-visible:outline-none"
                      onClick={openThemeMenu}
                      ref={themeMenuTriggerRef}
                      role="menuitem"
                      type="button"
                    >
                      <Sun
                        aria-hidden="true"
                        className="theme-dark-only size-5 shrink-0"
                        strokeWidth={1.9}
                      />
                      <Moon
                        aria-hidden="true"
                        className="theme-light-only size-5 shrink-0"
                        strokeWidth={1.9}
                      />
                      <span>Chuyển chế độ</span>
                    </button>
                    <div className="my-2 border-t border-[var(--app-border)]" />
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold text-[#ff6b78] transition-colors hover:bg-[#ed4956]/10 focus-visible:bg-[#ed4956]/10 focus-visible:outline-none"
                      onClick={() => {
                        closeMoreMenu();
                        void logout();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <LogOut
                        aria-hidden="true"
                        className="size-5 shrink-0"
                        strokeWidth={1.9}
                      />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            aria-controls="sidebar-more-menu"
            aria-expanded={isMoreMenuOpen}
            aria-haspopup="menu"
            className={`flex w-full items-center rounded-xl py-3.5 text-left text-[17px] text-[var(--app-text)] transition-colors hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none 2xl:py-4 2xl:text-[18px] ${
              isSearchPanelOpen ? "justify-center px-0" : "gap-4 px-3"
            } ${
              isMoreMenuOpen
                ? "bg-[var(--app-hover)] text-[var(--app-text)]"
                : ""
            }`}
            onClick={toggleMoreMenu}
            onKeyDown={handleMoreTriggerKeyDown}
            ref={moreMenuTriggerRef}
            type="button"
          >
            <Menu
              aria-hidden="true"
              className="size-7 shrink-0"
              strokeWidth={1.9}
            />
            {!isSearchPanelOpen && <span>Xem thêm</span>}
          </button>
        </div>
      </aside>

      <SearchSidebarPanel
        onClose={closeSearchPanel}
        open={isSearchPanelOpen}
      />
      <MobileNavigation
        onCreatePost={openCreatePost}
        pathname={pathname}
        unreadCount={unreadCount}
      />
      <CreatePostModal
        onClose={() => setIsCreatePostOpen(false)}
        open={isCreatePostOpen}
      />
    </>
  );
}
