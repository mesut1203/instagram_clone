"use client";

import {
  followUser,
  unfollowUser,
} from "@/app/services/follow.action";
import { LoaderCircle, UserCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FollowButtonProps = {
  className?: string;
  fullWidth?: boolean;
  showIcon?: boolean;
  initialIsFollowing?: boolean;
  userId: string;
  variant?: "default" | "text";
};

export default function FollowButton({
  className = "",
  fullWidth = false,
  showIcon = true,
  initialIsFollowing = false,
  userId,
  variant = "default",
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleFollow() {
    startTransition(async () => {
      const result = isFollowing
        ? await unfollowUser(userId)
        : await followUser(userId);

      setMessage(result.message);
      if (result.success) {
        setIsFollowing((current) => !current);
        router.refresh();
      }
    });
  }

  const isTextVariant = variant === "text";

  return (
    <div className={className}>
      <button
        aria-pressed={isFollowing}
        className={
          isTextVariant
            ? "inline-flex min-h-8 items-center justify-center rounded-lg px-2 text-xs font-bold text-[#397fd1] transition hover:text-[var(--app-text)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-65"
            : `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-65 ${
                fullWidth ? "w-full" : ""
              } ${
                isFollowing
                  ? "bg-[var(--app-hover)] text-[var(--app-text)] hover:bg-[var(--app-input)]"
                  : "bg-[#2f80ed] text-white hover:bg-[#2474dc]"
              }`
        }
        disabled={isPending}
        onClick={toggleFollow}
        type="button"
      >
        {!isTextVariant &&
          showIcon &&
          (isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : isFollowing ? (
            <UserCheck aria-hidden="true" className="size-4" />
          ) : (
            <UserPlus aria-hidden="true" className="size-4" />
          ))}
        {isPending
          ? isTextVariant
            ? "Đang xử lý..."
            : "Đang xử lý"
          : isFollowing
            ? "Đang theo dõi"
            : "Theo dõi"}
      </button>
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  );
}
