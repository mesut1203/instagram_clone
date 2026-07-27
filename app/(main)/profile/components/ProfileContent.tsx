"use client";

/* User-generated media can come from many image hosts. */
/* eslint-disable @next/next/no-img-element */

import {
  getUserPosts,
  type FeedPagination,
  type FeedPost,
  type PostFilter,
} from "@/app/services/post.action";
import type { UserProfile } from "@/app/services/user.action";
import {
  Bookmark,
  Grid3X3,
  Heart,
  ListVideo,
  LoaderCircle,
  MessageCircle,
  Play,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ProfileContentProps = {
  initialError?: string;
  initialFilter?: PostFilter;
  initialPagination: FeedPagination;
  initialPosts: FeedPost[];
  isOwnProfile: boolean;
  profile: UserProfile;
};

const tabs: Array<{
  filter: PostFilter;
  icon: typeof Grid3X3;
  label: string;
  ownOnly?: boolean;
}> = [
  { filter: "all", icon: Grid3X3, label: "Bài viết" },
  {
    filter: "saved",
    icon: Bookmark,
    label: "Đã lưu",
    ownOnly: true,
  },
  { filter: "video", icon: ListVideo, label: "Video" },
];

export default function ProfileContent({
  initialError,
  initialFilter = "all",
  initialPagination,
  initialPosts,
  isOwnProfile,
  profile,
}: ProfileContentProps) {
  const [activeFilter, setActiveFilter] =
    useState<PostFilter>(initialFilter);
  const [error, setError] = useState(initialError ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState(initialPagination);
  const [posts, setPosts] = useState(initialPosts);

  const loadPosts = async (
    filter: PostFilter,
    offset: number,
    replace = false,
  ) => {
    setError("");
    setIsLoading(true);
    const result = await getUserPosts(profile._id, filter, offset, 18);

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

  const changeFilter = (filter: PostFilter) => {
    if (filter === activeFilter || isLoading) return;

    setActiveFilter(filter);
    setPosts([]);
    void loadPosts(filter, 0, true);
  };

  return (
    <section aria-labelledby="profile-posts-heading">
      <div
        aria-label="Bộ lọc bài viết"
        className="grid grid-cols-3 border-t border-[var(--app-border)]"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.filter;
          const isUnavailable = Boolean(tab.ownOnly && !isOwnProfile);

          return (
            <button
              aria-label={
                isUnavailable
                  ? `${tab.label} chỉ hiển thị cho chủ tài khoản`
                  : tab.label
              }
              aria-selected={isActive}
              className={`relative flex h-16 items-center justify-center text-[var(--app-subtle)] transition after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-20 after:-translate-x-1/2 after:bg-transparent ${
                isActive
                  ? "text-[var(--app-text)] after:bg-[var(--app-text)]"
                  : "hover:text-[var(--app-text)]"
              }`}
              disabled={isLoading || isUnavailable}
              key={tab.filter}
              onClick={() => changeFilter(tab.filter)}
              role="tab"
              title={
                isUnavailable
                  ? "Bài viết đã lưu chỉ hiển thị cho chủ tài khoản"
                  : tab.label
              }
              type="button"
            >
              <Icon
                aria-hidden="true"
                className={`size-6 ${isUnavailable ? "opacity-45" : ""}`}
              />
            </button>
          );
        })}
      </div>

      <h2 className="sr-only" id="profile-posts-heading">
        Bài viết của {profile.username}
      </h2>

      {isLoading && posts.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoaderCircle
            aria-label="Đang tải bài viết"
            className="size-8 animate-spin text-[#8f9cff]"
          />
        </div>
      ) : posts.length > 0 ? (
        <div className="mt-6 grid max-w-[900px] grid-cols-3 gap-[3px] sm:gap-1">
          {posts.map((post) => (
            <Link
              aria-label={`Mở bài viết của ${profile.username}`}
              className="group relative aspect-square overflow-hidden rounded-sm bg-[var(--app-input)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#8f9cff]"
              href={`/posts/${post._id}`}
              key={post._id}
            >
              {post.image ? (
                <img
                  alt={post.caption?.trim() || ""}
                  className="size-full object-cover"
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
                <span className="flex size-full items-center justify-center px-2 text-center text-xs text-[var(--app-muted)]">
                  Không có nội dung xem trước
                </span>
              )}

              {post.mediaType === "video" && (
                <Play
                  aria-hidden="true"
                  className="absolute top-2 right-2 size-5 text-white drop-shadow"
                  fill="currentColor"
                />
              )}

              <span className="absolute inset-0 flex items-center justify-center gap-4 bg-black/55 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="inline-flex items-center gap-1">
                  <Heart
                    aria-hidden="true"
                    className="size-5"
                    fill="currentColor"
                  />
                  {post.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle
                    aria-hidden="true"
                    className="size-5"
                    fill="currentColor"
                  />
                  {post.comments}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-14 max-w-md px-4 text-center">
          <p className="text-sm text-[var(--app-muted)] sm:text-base">
            Chưa có bài viết nào
          </p>
        </div>
      )}

      {error && (
        <div
          className="mx-auto mt-6 max-w-lg rounded-xl bg-red-400/10 px-4 py-3 text-center text-sm text-red-300"
          role="alert"
        >
          <p>{error}</p>
          <button
            className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[var(--app-text)] hover:underline"
            disabled={isLoading}
            onClick={() => void loadPosts(activeFilter, 0, true)}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Thử lại
          </button>
        </div>
      )}

      {pagination.hasMore && posts.length > 0 && (
        <button
          className="mt-6 inline-flex w-full max-w-[900px] items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void loadPosts(activeFilter, posts.length)}
          type="button"
        >
          {isLoading && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {isLoading ? "Đang tải..." : "Xem thêm"}
        </button>
      )}
    </section>
  );
}
