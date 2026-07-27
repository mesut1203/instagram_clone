"use client";

import {
  createComment,
  getPostComments,
  type CommentPagination,
  type PostComment,
} from "@/app/services/comment.action";
import {
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CommentComposer from "./CommentComposer";
import CommentThread from "./CommentThread";
import { commentNumberFormatter } from "./comment-utils";

export type CommentsPanelProps = {
  className?: string;
  currentUserId?: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
  postId: string;
};

const initialPagination: CommentPagination = {
  currentPage: 1,
  hasMore: false,
  totalComments: 0,
  totalPages: 0,
};

export default function CommentsPanel({
  className = "",
  currentUserId,
  initialCommentCount,
  onCommentCountChange,
  postId,
}: CommentsPanelProps) {
  const [announcement, setAnnouncement] = useState("");
  const [comments, setComments] = useState<PostComment[]>([]);
  const [composerError, setComposerError] = useState<string>();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedPostId, setLoadedPostId] = useState<string>();
  const [pagination, setPagination] =
    useState<CommentPagination>(initialPagination);
  const countCallbackRef = useRef(onCommentCountChange);
  const commentCountRef = useRef(initialCommentCount ?? 0);
  const initialCountWasProvidedRef = useRef(
    initialCommentCount !== undefined,
  );

  useEffect(() => {
    countCallbackRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  useEffect(() => {
    if (initialCommentCount !== undefined) {
      commentCountRef.current = Math.max(0, initialCommentCount);
      initialCountWasProvidedRef.current = true;
    }
  }, [initialCommentCount]);

  useEffect(() => {
    let requestIsActive = true;

    async function loadComments() {
      const result = await getPostComments(
        postId,
        0,
        20,
        currentUserId,
      );

      if (!requestIsActive) {
        return;
      }

      setComments(result.comments);
      setPagination(result.pagination);
      setError(result.error);
      setLoadedPostId(postId);

      if (!initialCountWasProvidedRef.current && !result.error) {
        commentCountRef.current = result.pagination.totalComments;
        countCallbackRef.current?.(result.pagination.totalComments);
      }
    }

    void loadComments();

    return () => {
      requestIsActive = false;
    };
  }, [currentUserId, postId]);

  const isInitialLoading = loadedPostId !== postId;
  const visibleComments = isInitialLoading ? [] : comments;

  function changePostCommentCount(delta: number) {
    const nextCount = Math.max(0, commentCountRef.current + delta);
    commentCountRef.current = nextCount;
    countCallbackRef.current?.(nextCount);
  }

  async function handleRetry() {
    setLoadedPostId(undefined);
    setError(undefined);
    const result = await getPostComments(postId, 0, 20, currentUserId);
    setComments(result.comments);
    setPagination(result.pagination);
    setError(result.error);
    setLoadedPostId(postId);

    if (!initialCountWasProvidedRef.current && !result.error) {
      commentCountRef.current = result.pagination.totalComments;
      countCallbackRef.current?.(result.pagination.totalComments);
    }
  }

  async function handleLoadMore() {
    if (isLoadingMore || !pagination.hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(undefined);
    const result = await getPostComments(
      postId,
      comments.length,
      20,
      currentUserId,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setComments((currentComments) => {
        const existingIds = new Set(
          currentComments.map((comment) => comment._id),
        );
        return [
          ...currentComments,
          ...result.comments.filter(
            (comment) => !existingIds.has(comment._id),
          ),
        ];
      });
      setPagination(result.pagination);
    }

    setIsLoadingMore(false);
  }

  async function handleCreateComment() {
    if (isSubmitting || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setComposerError(undefined);
    const result = await createComment(postId, content, currentUserId);

    if (!result.success || !result.comment) {
      setComposerError(result.error ?? "Không thể đăng bình luận.");
      setIsSubmitting(false);
      return;
    }

    const createdComment = result.comment;
    setComments((currentComments) => {
      if (
        currentComments.some(
          (comment) => comment._id === createdComment._id,
        )
      ) {
        return currentComments;
      }
      return [createdComment, ...currentComments];
    });
    setPagination((currentPagination) => ({
      ...currentPagination,
      totalComments: currentPagination.totalComments + 1,
    }));
    changePostCommentCount(1);
    setAnnouncement("Đã đăng bình luận.");
    setContent("");
    setIsSubmitting(false);
  }

  function handleCommentChange(updatedComment: PostComment) {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment,
      ),
    );
  }

  function handleCommentDelete(deletedComment: PostComment) {
    setComments((currentComments) =>
      currentComments.filter(
        (comment) => comment._id !== deletedComment._id,
      ),
    );
    setPagination((currentPagination) => ({
      ...currentPagination,
      totalComments: Math.max(0, currentPagination.totalComments - 1),
    }));
    changePostCommentCount(-(1 + deletedComment.repliesCount));
    setAnnouncement("Đã xóa bình luận.");
  }

  return (
    <section
      aria-labelledby={`comments-heading-${postId}`}
      className={`rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] ${className}`}
      id="comments"
    >
      <header className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle
            aria-hidden="true"
            className="size-5 text-[var(--app-muted)]"
          />
          <h2
            className="text-sm font-bold text-[var(--app-text)]"
            id={`comments-heading-${postId}`}
          >
            Bình luận
          </h2>
          {!isInitialLoading && pagination.totalComments > 0 && (
            <span className="rounded-full bg-[var(--app-hover)] px-2 py-0.5 text-xs font-semibold text-[var(--app-muted)]">
              {commentNumberFormatter.format(pagination.totalComments)}
            </span>
          )}
        </div>

        <button
          aria-label="Làm mới bình luận"
          className="rounded-lg p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] disabled:opacity-50"
          disabled={isInitialLoading}
          onClick={handleRetry}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
        </button>
      </header>

      <div className="px-4 pt-4">
        <CommentComposer
          error={composerError}
          isSubmitting={isSubmitting}
          onChange={(value) => {
            setContent(value);
            if (composerError) {
              setComposerError(undefined);
            }
          }}
          onSubmit={handleCreateComment}
          value={content}
        />
      </div>

      <div className="px-4 pb-4">
        {isInitialLoading && (
          <div
            aria-label="Đang tải bình luận"
            className="space-y-4 py-4"
            role="status"
          >
            {[0, 1, 2].map((item) => (
              <div className="flex animate-pulse gap-3" key={item}>
                <span className="size-9 shrink-0 rounded-full bg-[var(--app-skeleton-strong)]" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-28 rounded bg-[var(--app-skeleton-strong)]" />
                  <span className="block h-3 w-3/4 rounded bg-[var(--app-skeleton)]" />
                </span>
              </div>
            ))}
          </div>
        )}

        {!isInitialLoading && error && visibleComments.length === 0 && (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#ff6682]/10 text-[#ff8b9c]">
              <MessageCircle aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 text-sm text-[var(--app-muted)]" role="alert">
              {error}
            </p>
            <button
              className="mt-3 flex min-h-9 items-center gap-2 rounded-xl bg-[var(--app-hover)] px-3 text-xs font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-input)]"
              onClick={handleRetry}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Thử lại
            </button>
          </div>
        )}

        {!isInitialLoading && !error && visibleComments.length === 0 && (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#5264df]/12 text-[#8d9aff]">
              <MessageCircle aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[var(--app-text)]">
              Chưa có bình luận
            </p>
            <p className="mt-1 text-xs text-[var(--app-muted)]">
              Hãy là người đầu tiên chia sẻ cảm nghĩ.
            </p>
          </div>
        )}

        {visibleComments.map((comment) => (
          <CommentThread
            comment={comment}
            currentUserId={currentUserId}
            key={comment._id}
            onChange={handleCommentChange}
            onCountDelta={changePostCommentCount}
            onDelete={handleCommentDelete}
            postId={postId}
          />
        ))}

        {error && visibleComments.length > 0 && (
          <p className="py-2 text-center text-xs text-[#ff8b9c]" role="alert">
            {error}
          </p>
        )}

        {pagination.hasMore && !isInitialLoading && (
          <button
            className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-surface)] px-4 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoadingMore}
            onClick={handleLoadMore}
            type="button"
          >
            {isLoadingMore && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            )}
            Xem thêm bình luận
          </button>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
