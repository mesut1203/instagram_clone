"use client";

import {
  createCommentReply,
  getCommentReplies,
  type PostComment,
  type ReplyPagination,
} from "@/app/services/comment.action";
import { ChevronDown, ChevronUp, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CommentComposer from "./CommentComposer";
import CommentRow from "./CommentRow";
import { commentNumberFormatter } from "./comment-utils";

type CommentRepliesProps = {
  composerOpen: boolean;
  currentUserId?: string;
  onComposerOpenChange: (open: boolean) => void;
  onCountDelta: (delta: number) => void;
  onParentChange: (comment: PostComment) => void;
  onVisibleChange: (visible: boolean) => void;
  parentComment: PostComment;
  postId: string;
  visible: boolean;
};

const initialPagination: ReplyPagination = {
  currentPage: 1,
  hasMore: false,
  totalPages: 0,
  totalReplies: 0,
};

export default function CommentReplies({
  composerOpen,
  currentUserId,
  onComposerOpenChange,
  onCountDelta,
  onParentChange,
  onVisibleChange,
  parentComment,
  postId,
  visible,
}: CommentRepliesProps) {
  const [composerError, setComposerError] = useState<string>();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] =
    useState<ReplyPagination>(initialPagination);
  const [replies, setReplies] = useState<PostComment[]>([]);
  const [replyCount, setReplyCount] = useState(parentComment.repliesCount);
  const initialRequestPending = useRef(false);
  const parentCommentId = parentComment._id;

  useEffect(() => {
    if (
      !visible ||
      hasLoaded ||
      initialRequestPending.current
    ) {
      return;
    }

    initialRequestPending.current = true;
    let requestIsActive = true;

    void getCommentReplies(
      postId,
      parentCommentId,
      0,
      10,
      currentUserId,
    ).then((result) => {
      if (!requestIsActive) {
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setReplies(result.replies);
        setPagination(result.pagination);
        setReplyCount(result.pagination.totalReplies);
        setHasLoaded(true);
      }

      initialRequestPending.current = false;
    });

    return () => {
      requestIsActive = false;
      initialRequestPending.current = false;
    };
  }, [currentUserId, hasLoaded, parentCommentId, postId, visible]);

  async function handleRetryReplies() {
    if (initialRequestPending.current) {
      return;
    }

    initialRequestPending.current = true;
    setError(undefined);
    const result = await getCommentReplies(
      postId,
      parentCommentId,
      0,
      10,
      currentUserId,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setReplies(result.replies);
      setPagination(result.pagination);
      setReplyCount(result.pagination.totalReplies);
      setHasLoaded(true);
    }

    initialRequestPending.current = false;
  }

  async function handleLoadMore() {
    if (isLoadingMore || !pagination.hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(undefined);
    const result = await getCommentReplies(
      postId,
      parentComment._id,
      replies.length,
      10,
      currentUserId,
    );

    if (result.error) {
      setError(result.error);
    } else {
      setReplies((currentReplies) => {
        const existingIds = new Set(
          currentReplies.map((reply) => reply._id),
        );
        return [
          ...currentReplies,
          ...result.replies.filter((reply) => !existingIds.has(reply._id)),
        ];
      });
      setPagination(result.pagination);
      setReplyCount(result.pagination.totalReplies);
      onParentChange({
        ...parentComment,
        repliesCount: result.pagination.totalReplies,
      });
    }

    setIsLoadingMore(false);
  }

  async function handleCreateReply() {
    if (isSubmitting || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setComposerError(undefined);
    const result = await createCommentReply(
      postId,
      parentComment._id,
      content,
      currentUserId,
    );

    if (!result.success || !result.comment) {
      setComposerError(result.error ?? "Không thể đăng câu trả lời.");
      setIsSubmitting(false);
      return;
    }

    const createdReply = result.comment;
    setReplies((currentReplies) => {
      if (currentReplies.some((reply) => reply._id === createdReply._id)) {
        return currentReplies;
      }
      return [...currentReplies, createdReply];
    });
    const nextReplyCount = replyCount + 1;
    setReplyCount(nextReplyCount);
    setPagination((currentPagination) => ({
      ...currentPagination,
      totalReplies: nextReplyCount,
    }));
    onParentChange({
      ...parentComment,
      repliesCount: nextReplyCount,
    });
    onCountDelta(1);
    setContent("");
    setIsSubmitting(false);
  }

  function handleReplyChange(updatedReply: PostComment) {
    setReplies((currentReplies) =>
      currentReplies.map((reply) =>
        reply._id === updatedReply._id ? updatedReply : reply,
      ),
    );
  }

  function handleReplyDelete(deletedReply: PostComment) {
    setReplies((currentReplies) =>
      currentReplies.filter((reply) => reply._id !== deletedReply._id),
    );
    const nextReplyCount = Math.max(0, replyCount - 1);
    setReplyCount(nextReplyCount);
    setPagination((currentPagination) => ({
      ...currentPagination,
      totalReplies: nextReplyCount,
    }));
    onParentChange({
      ...parentComment,
      repliesCount: nextReplyCount,
    });
    onCountDelta(-1);
  }

  if (!visible) {
    if (replyCount === 0) {
      return null;
    }

    return (
      <button
        className="mt-1 flex min-h-8 items-center gap-2 text-xs font-semibold text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
        onClick={() => onVisibleChange(true)}
        type="button"
      >
        <span aria-hidden="true" className="h-px w-7 bg-[var(--app-border-strong)]" />
        Xem {commentNumberFormatter.format(replyCount)} câu trả lời
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </button>
    );
  }

  return (
    <section
      aria-label={`Câu trả lời cho bình luận của ${parentComment.user.username}`}
      className="mt-1 border-l border-[var(--app-border)] pl-4"
    >
      <button
        className="mb-1 flex min-h-8 items-center gap-2 text-xs font-semibold text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
        onClick={() => onVisibleChange(false)}
        type="button"
      >
        <span aria-hidden="true" className="h-px w-7 bg-[var(--app-border-strong)]" />
        Ẩn câu trả lời
        <ChevronUp aria-hidden="true" className="size-3.5" />
      </button>

      {visible && !hasLoaded && !error && (
        <div
          aria-label="Đang tải câu trả lời"
          className="flex items-center gap-2 py-3 text-xs text-[var(--app-muted)]"
          role="status"
        >
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Đang tải...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 py-2" role="alert">
          <p className="text-xs text-[#ff8b9c]">{error}</p>
          <button
            aria-label="Thử tải lại câu trả lời"
            className="rounded-lg p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
            onClick={handleRetryReplies}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}

      {replies.map((reply) => (
        <CommentRow
          comment={reply}
          currentUserId={currentUserId}
          isReply
          key={reply._id}
          onChange={handleReplyChange}
          onDelete={handleReplyDelete}
          postId={postId}
        />
      ))}

      {pagination.hasMore && (
        <button
          className="my-1 flex min-h-8 items-center gap-2 text-xs font-semibold text-[var(--app-muted)] transition hover:text-[var(--app-text)] disabled:opacity-50"
          disabled={isLoadingMore}
          onClick={handleLoadMore}
          type="button"
        >
          {isLoadingMore && (
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin"
            />
          )}
          Xem thêm câu trả lời
        </button>
      )}

      {composerOpen && (
        <div className="mt-2">
          <CommentComposer
            autoFocus
            buttonLabel="Đăng câu trả lời"
            error={composerError}
            isSubmitting={isSubmitting}
            onChange={(value) => {
              setContent(value);
              if (composerError) {
                setComposerError(undefined);
              }
            }}
            onSubmit={handleCreateReply}
            placeholder={`Trả lời @${parentComment.user.username}...`}
            value={content}
          />
          <button
            className="ml-1 text-xs font-medium text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
            disabled={isSubmitting}
            onClick={() => {
              setContent("");
              setComposerError(undefined);
              onComposerOpenChange(false);
            }}
            type="button"
          >
            Hủy
          </button>
        </div>
      )}
    </section>
  );
}
