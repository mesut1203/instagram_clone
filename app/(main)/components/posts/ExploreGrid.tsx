"use client";

/* User-generated media can come from many image hosts. */
/* eslint-disable @next/next/no-img-element */

import {
  getExplorePosts,
  type FeedPagination,
  type FeedPost,
} from "@/app/services/post.action";
import {
  Heart,
  LoaderCircle,
  MessageCircle,
  Play,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { numberFormatter } from "../feed/feed-utils";

type ExploreGridProps = {
  initialError?: string;
  initialPagination: FeedPagination;
  initialPosts: FeedPost[];
};

export default function ExploreGrid({
  initialError,
  initialPagination,
  initialPosts,
}: ExploreGridProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [pagination, setPagination] = useState(initialPagination);
  const [error, setError] = useState(initialError ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const loadPage = async (page: number, replace = false) => {
    setError("");
    setIsLoading(true);
    const result = await getExplorePosts(page, 18);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setPosts((currentPosts) => {
      if (replace) return result.posts;

      const currentIds = new Set(currentPosts.map((post) => post._id));
      return [
        ...currentPosts,
        ...result.posts.filter((post) => !currentIds.has(post._id)),
      ];
    });
    setPagination(result.pagination);
    setIsLoading(false);
  };

  if (!posts.length) {
    return (
      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] px-6 py-14 text-center">
        <h2 className="text-xl font-bold text-[var(--app-text)]">
          {error ? "Không thể tải mục khám phá" : "Chưa có bài viết nổi bật"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--app-muted)]">
          {error ??
            "Những bài viết có nhiều tương tác sẽ xuất hiện tại đây."}
        </p>
        {error && (
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4154c8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5265d7] disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadPage(1, true)}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Thử lại
          </button>
        )}
      </section>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2">
        {posts.map((post) => (
          <Link
            aria-label={`Xem bài viết của ${post.user.username}`}
            className="group relative aspect-square overflow-hidden bg-[var(--app-input)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#8f9cff]"
            href={`/posts/${post._id}`}
            key={post._id}
          >
            {post.image ? (
              <img
                alt={post.caption?.trim() || ""}
                className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                src={post.image}
              />
            ) : post.video ? (
              <video
                className="size-full object-cover"
                muted
                playsInline
                preload="metadata"
                src={post.video}
              />
            ) : (
              <span className="flex size-full items-center justify-center px-3 text-center text-xs text-[var(--app-muted)]">
                Không có nội dung xem trước
              </span>
            )}

            {post.mediaType === "video" && (
              <span className="absolute top-2 right-2 rounded-full bg-black/55 p-1.5 text-white">
                <Play
                  aria-hidden="true"
                  className="size-4"
                  fill="currentColor"
                />
              </span>
            )}

            <span className="absolute inset-0 flex items-center justify-center gap-5 bg-black/55 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="inline-flex items-center gap-1.5">
                <Heart
                  aria-hidden="true"
                  className="size-5"
                  fill="currentColor"
                />
                {numberFormatter.format(post.likes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle
                  aria-hidden="true"
                  className="size-5"
                  fill="currentColor"
                />
                {numberFormatter.format(post.comments)}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {error && (
        <p
          className="mt-5 rounded-xl bg-red-400/10 px-4 py-3 text-center text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {pagination.hasMore && (
        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void loadPage(pagination.currentPage + 1)}
          type="button"
        >
          {isLoading && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {isLoading ? "Đang tải..." : "Xem thêm"}
        </button>
      )}
    </>
  );
}
