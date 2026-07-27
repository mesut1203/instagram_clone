"use client";

import {
  getNewsFeed,
  type FeedPagination,
  type FeedPost,
} from "@/app/services/post.action";
import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import FeedEmptyState from "./feed/FeedEmptyState";
import { NEWS_FEED_PAGE_SIZE } from "./feed/feed-config";
import FeedPostCard from "./feed/FeedPostCard";

type NewsFeedProps = {
  currentUserId?: string;
  initialError?: string;
  initialPagination: FeedPagination;
  initialPosts: FeedPost[];
};

export default function NewsFeed({
  currentUserId,
  initialError,
  initialPagination,
  initialPosts,
}: NewsFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [pagination, setPagination] = useState(initialPagination);
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoadPaused, setAutoLoadPaused] = useState(
    Boolean(initialError),
  );
  const isLoadingRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async (offset: number, replace = false) => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await getNewsFeed(offset, NEWS_FEED_PAGE_SIZE);

      if (result.error) {
        setError(result.error);
        setAutoLoadPaused(true);
        return;
      }

      setPosts((currentPosts) => {
        if (replace) {
          return result.posts;
        }

        const existingIds = new Set(
          currentPosts.map((post) => post._id),
        );
        return [
          ...currentPosts,
          ...result.posts.filter((post) => !existingIds.has(post._id)),
        ];
      });
      setPagination(result.pagination);
      setAutoLoadPaused(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !pagination.hasMore || autoLoadPaused) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadPosts(posts.length);
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [autoLoadPaused, loadPosts, pagination.hasMore, posts.length]);

  const retryInitialLoad = () => {
    setAutoLoadPaused(false);
    void loadPosts(0, true);
  };

  const loadMorePosts = () => {
    setAutoLoadPaused(false);
    void loadPosts(posts.length);
  };

  const removePost = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== postId),
    );
    setPagination((currentPagination) => ({
      ...currentPagination,
      totalPosts: Math.max(0, currentPagination.totalPosts - 1),
    }));
  };

  const updatePost = (postId: string, caption: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === postId ? { ...post, caption } : post,
      ),
    );
  };

  if (!posts.length) {
    return (
      <FeedEmptyState
        error={error}
        isLoading={isLoading}
        onRetry={retryInitialLoad}
      />
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {posts.map((post) => (
        <FeedPostCard
          currentUserId={currentUserId}
          key={post._id}
          onPostDeleted={removePost}
          onPostUpdated={updatePost}
          post={post}
        />
      ))}

      {error && (
        <p
          className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {pagination.hasMore && (
        <div
          aria-busy={isLoading}
          aria-live="polite"
          className="pt-1"
          ref={loadMoreRef}
        >
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-background-elevated)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            onClick={loadMorePosts}
            type="button"
          >
            {isLoading && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            )}
            {isLoading
              ? "Đang tải bài viết..."
              : error
                ? "Thử tải lại"
                : "Tải thêm bài viết"}
          </button>
        </div>
      )}

      {!pagination.hasMore && (
        <p className="pb-2 text-center text-xs text-[var(--app-subtle)]">
          Bạn đã xem hết bài viết mới.
        </p>
      )}
    </div>
  );
}
