"use client";

/* Avatar URLs are user-generated and can come from many image hosts. */
/* eslint-disable @next/next/no-img-element */

import type { FeedUser } from "@/app/services/post.action";
import { useState } from "react";
import { getInitial } from "./feed-utils";

export default function FeedUserAvatar({ user }: { user: FeedUser }) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = user.fullName?.trim() || user.username;

  if (!user.profilePicture || imageFailed) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--app-border-strong)] bg-[#e4e7ec] text-sm font-bold text-[#17191d] 2xl:size-10">
        {getInitial(displayName)}
      </span>
    );
  }

  return (
    <img
      alt=""
      className="size-9 shrink-0 rounded-full border border-[var(--app-border-strong)] object-cover 2xl:size-10"
      onError={() => setImageFailed(true)}
      src={user.profilePicture}
    />
  );
}
