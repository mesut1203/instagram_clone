/* User-generated media can come from many image hosts, so it is rendered directly. */
/* eslint-disable @next/next/no-img-element */

import type { FeedPost } from "@/app/services/post.action";

export default function FeedPostMedia({ post }: { post: FeedPost }) {
  if (post.mediaType === "video" && post.video) {
    return (
      <video
        className="block aspect-square w-full rounded-[3px] border border-[var(--app-border-strong)] bg-black object-contain"
        controls
        preload="metadata"
        src={post.video}
      >
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    );
  }

  if (post.image) {
    return (
      <img
        alt={post.caption?.trim() || `Bài viết của ${post.user.username}`}
        className="block aspect-square w-full rounded-[3px] border border-[var(--app-border-strong)] bg-[var(--app-background-elevated)] object-cover"
        src={post.image}
      />
    );
  }

  return (
    <div className="flex aspect-square items-center justify-center rounded-[3px] border border-[var(--app-border-strong)] bg-[var(--app-input)] px-8 text-center text-sm text-[var(--app-muted)]">
      Bài viết này không có nội dung đa phương tiện để hiển thị.
    </div>
  );
}
