"use client";

/* eslint-disable @next/next/no-img-element */

import FollowButton from "@/app/(main)/profile/components/FollowButton";
import type { UserSummary } from "@/app/services/user.action";
import Link from "next/link";
import { useState } from "react";

type SuggestedUsersProps = {
  currentUser: UserSummary | null;
  error?: string;
  users: UserSummary[];
};

function getInitial(user: UserSummary) {
  return (user.fullName?.trim() || user.username.trim() || "I")
    .charAt(0)
    .toUpperCase();
}

function NeutralAvatar({
  className,
  user,
}: {
  className: string;
  user: UserSummary;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(user.profilePicture) && !imageFailed;

  return (
    <span
      aria-label={`Ảnh đại diện của ${user.username}`}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--app-border-strong)] bg-[#e4e7ec] font-bold text-[#17191d] ${className}`}
      role="img"
    >
      {showImage ? (
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
          referrerPolicy="no-referrer"
          src={user.profilePicture ?? ""}
        />
      ) : (
        getInitial(user)
      )}
    </span>
  );
}

export default function SuggestedUsers({
  currentUser,
  error,
  users,
}: SuggestedUsersProps) {
  return (
    <aside
      aria-label="Gợi ý người dùng"
      className="hidden min-w-0 self-start xl:block"
    >
      {currentUser && (
        <div className="flex items-center gap-3 px-1">
          <Link
            aria-label={`Mở trang cá nhân của ${currentUser.username}`}
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
            href="/profile"
          >
            <NeutralAvatar className="size-14 text-base" user={currentUser} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-[var(--app-text)]">
                {currentUser.username}
              </span>
              <span className="mt-0.5 block truncate text-sm text-[var(--app-muted)]">
                {currentUser.fullName?.trim() || "Người dùng Instagram"}
              </span>
            </span>
          </Link>
        </div>
      )}

      <div className={currentUser ? "mt-7" : ""}>
        <div className="flex items-center justify-between gap-4 px-1">
          <h2 className="text-sm font-bold text-[var(--app-text)]">
            Gợi ý cho bạn
          </h2>
          <Link
            className="rounded-md px-1.5 py-1 text-xs font-bold text-[var(--app-text)] transition hover:text-[var(--app-muted)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
            href="/search"
          >
            Xem tất cả
          </Link>
        </div>

        {users.length ? (
          <ul className="mt-3 space-y-1">
            {users.slice(0, 5).map((user) => (
              <li
                className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-2"
                key={user._id}
              >
                <Link
                  aria-label={`Mở trang cá nhân của ${user.username}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
                  href={`/profile/${encodeURIComponent(user._id)}`}
                >
                  <NeutralAvatar className="size-12 text-sm" user={user} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[var(--app-text)]">
                      {user.username}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--app-muted)]">
                      {user.fullName?.trim() || "Gợi ý cho bạn"}
                    </span>
                  </span>
                </Link>
                <FollowButton
                  className="shrink-0"
                  initialIsFollowing={user.isFollowing}
                  userId={user._id}
                  variant="text"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={`mt-4 rounded-xl bg-[var(--app-background-elevated)] px-4 py-3 text-sm leading-5 ${
              error ? "text-red-300" : "text-[var(--app-muted)]"
            }`}
            role={error ? "alert" : undefined}
          >
            {error ?? "Hiện chưa có gợi ý mới."}
          </p>
        )}
      </div>

      <footer className="mt-9 px-1 text-[11px] leading-5 text-[var(--app-subtle)]">
        <p>Giới thiệu · Trợ giúp · Quyền riêng tư · Điều khoản</p>
        <p className="mt-3 uppercase">© 2026 Instagram from F8</p>
      </footer>
    </aside>
  );
}
