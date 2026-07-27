"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type UserAvatarProps = {
  className?: string;
  fullName?: string | null;
  plain?: boolean;
  profilePicture?: string | null;
  username: string;
};

function getInitial(fullName: string | null | undefined, username: string) {
  return (fullName?.trim() || username.trim() || "I")
    .charAt(0)
    .toUpperCase();
}

export default function UserAvatar({
  className = "size-12",
  fullName,
  plain = false,
  profilePicture,
  username,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(profilePicture) && !imageFailed;

  return (
    <span
      aria-label={`Ảnh đại diện của ${username}`}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        plain
          ? "bg-[var(--app-input)]"
          : "bg-gradient-to-br from-[#7c3aed] via-[#ec4899] to-[#f59e0b] p-[2px]"
      } ${className}`}
      role="img"
    >
      <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-[var(--app-input)] text-sm font-bold text-[var(--app-text)]">
        {showImage ? (
          <img
            alt=""
            className="size-full object-cover"
            onError={() => setImageFailed(true)}
            src={profilePicture ?? ""}
          />
        ) : (
          getInitial(fullName, username)
        )}
      </span>
    </span>
  );
}
