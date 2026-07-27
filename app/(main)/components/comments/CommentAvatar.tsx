"use client";

/* Avatar URLs are supplied by users and can come from arbitrary hosts. */
/* eslint-disable @next/next/no-img-element */

import type { CommentAuthor } from "@/app/services/comment.action";
import { useState } from "react";
import {
  getCommentAuthorName,
  getCommentInitial,
} from "./comment-utils";

type CommentAvatarProps = {
  size?: "small" | "standard";
  user: CommentAuthor;
};

export default function CommentAvatar({
  size = "standard",
  user,
}: CommentAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const displayName = getCommentAuthorName(user.fullName, user.username);
  const sizeClass = size === "small" ? "size-8 text-xs" : "size-9 text-sm";

  if (!user.profilePicture || imageFailed) {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#6377ee] to-[#d05ed2] font-bold text-white ${sizeClass}`}
      >
        {getCommentInitial(displayName)}
      </span>
    );
  }

  return (
    <img
      alt=""
      className={`shrink-0 rounded-full border border-[var(--app-border-strong)] object-cover ${sizeClass}`}
      onError={() => setImageFailed(true)}
      src={user.profilePicture}
    />
  );
}
