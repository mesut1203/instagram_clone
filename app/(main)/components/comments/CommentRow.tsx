"use client";

import {
  deleteComment,
  likeComment,
  unlikeComment,
  updateComment,
  type PostComment,
} from "@/app/services/comment.action";
import {
  Check,
  Heart,
  LoaderCircle,
  Pencil,
  Reply,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import CommentAvatar from "./CommentAvatar";
import {
  commentNumberFormatter,
  formatCommentTime,
} from "./comment-utils";

type CommentRowProps = {
  comment: PostComment;
  currentUserId?: string;
  isReply?: boolean;
  onChange: (comment: PostComment) => void;
  onDelete: (comment: PostComment) => void;
  onReply?: () => void;
  postId: string;
};

export default function CommentRow({
  comment,
  currentUserId,
  isReply = false,
  onChange,
  onDelete,
  onReply,
  postId,
}: CommentRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [error, setError] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isOwner = Boolean(
    currentUserId && comment.user._id === currentUserId,
  );

  async function handleLike() {
    if (isLiking) {
      return;
    }

    setError(undefined);
    setIsLiking(true);

    const wasLiked = comment.isLiked;
    const previousLikes = comment.likes;
    const optimisticComment = {
      ...comment,
      isLiked: !wasLiked,
      likes: Math.max(0, previousLikes + (wasLiked ? -1 : 1)),
    };
    onChange(optimisticComment);

    const result = wasLiked
      ? await unlikeComment(postId, comment._id)
      : await likeComment(postId, comment._id);

    if (!result.success) {
      onChange({
        ...comment,
        isLiked: wasLiked,
        likes: previousLikes,
      });
      setError(result.error ?? "Không thể cập nhật lượt thích.");
    } else if (typeof result.likes === "number") {
      onChange({ ...optimisticComment, likes: result.likes });
    }

    setIsLiking(false);
  }

  async function handleSave() {
    const normalizedContent = editValue.trim();
    if (!normalizedContent || normalizedContent === comment.content) {
      setEditValue(comment.content);
      setEditing(false);
      return;
    }

    setError(undefined);
    setIsSaving(true);
    const result = await updateComment(
      postId,
      comment._id,
      normalizedContent,
    );

    if (!result.success || !result.comment) {
      setError(result.error ?? "Không thể cập nhật bình luận.");
      setIsSaving(false);
      return;
    }

    onChange({
      ...comment,
      content: result.comment.content,
      updatedAt: result.comment.updatedAt,
    });
    setEditing(false);
    setIsSaving(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      isReply
        ? "Bạn có chắc muốn xóa câu trả lời này?"
        : "Bạn có chắc muốn xóa bình luận này?",
    );

    if (!confirmed) {
      return;
    }

    setError(undefined);
    setIsDeleting(true);
    const result = await deleteComment(postId, comment._id);

    if (!result.success) {
      setError(result.error ?? "Không thể xóa bình luận.");
      setIsDeleting(false);
      return;
    }

    onDelete(comment);
  }

  function cancelEditing() {
    setEditValue(comment.content);
    setError(undefined);
    setEditing(false);
  }

  return (
    <article
      aria-label={`Bình luận của ${comment.user.username}`}
      className={`group flex items-start gap-3 ${isReply ? "py-2" : "py-3"}`}
    >
      <CommentAvatar size={isReply ? "small" : "standard"} user={comment.user} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-sm font-semibold text-[var(--app-text)]">
            {comment.user.username}
          </p>
          <time
            className="shrink-0 text-[11px] text-[var(--app-subtle)]"
            dateTime={comment.createdAt}
          >
            {formatCommentTime(comment.createdAt)}
          </time>
          {comment.updatedAt && (
            <span className="text-[11px] text-[var(--app-subtle)]">Đã sửa</span>
          )}
        </div>

        {editing ? (
          <div className="mt-1.5">
            <label className="sr-only" htmlFor={`edit-comment-${comment._id}`}>
              Chỉnh sửa bình luận
            </label>
            <textarea
              autoFocus
              className="min-h-18 w-full resize-y rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-input)] px-3 py-2 text-sm leading-5 text-[var(--app-text)] outline-none focus:border-[#6d7ce8] focus:ring-2 focus:ring-[#5264df]/20"
              disabled={isSaving}
              id={`edit-comment-${comment._id}`}
              maxLength={2200}
              onChange={(event) => setEditValue(event.target.value)}
              value={editValue}
            />
            <div className="mt-1 flex justify-end gap-1">
              <button
                aria-label="Hủy chỉnh sửa"
                className="rounded-lg p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
                disabled={isSaving}
                onClick={cancelEditing}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
              <button
                aria-label="Lưu chỉnh sửa"
                className="rounded-lg p-2 text-[#5364e8] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] disabled:opacity-50"
                disabled={isSaving || !editValue.trim()}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-5 text-[var(--app-text)]">
            {comment.content}
          </p>
        )}

        {!editing && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <button
              aria-label={
                comment.isLiked
                  ? "Bỏ thích bình luận"
                  : "Thích bình luận"
              }
              aria-pressed={comment.isLiked}
              className={`flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition hover:bg-[var(--app-hover)] ${
                comment.isLiked ? "text-[#ff6682]" : "text-[var(--app-muted)]"
              }`}
              disabled={isLiking}
              onClick={handleLike}
              type="button"
            >
              {isLiking ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin"
                />
              ) : (
                <Heart
                  aria-hidden="true"
                  className={`size-3.5 ${comment.isLiked ? "fill-current" : ""}`}
                />
              )}
              {comment.likes > 0 &&
                commentNumberFormatter.format(comment.likes)}
            </button>

            {onReply && (
              <button
                className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
                onClick={onReply}
                type="button"
              >
                <Reply aria-hidden="true" className="size-3.5" />
                Trả lời
              </button>
            )}

            {isOwner && (
              <>
                <button
                  aria-label="Chỉnh sửa bình luận"
                  className="rounded-lg p-2 text-[var(--app-muted)] opacity-100 transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  onClick={() => setEditing(true)}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </button>
                <button
                  aria-label="Xóa bình luận"
                  className="rounded-lg p-2 text-[var(--app-muted)] opacity-100 transition hover:bg-[var(--app-hover)] hover:text-[#ff6682] disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  type="button"
                >
                  {isDeleting ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-3.5 animate-spin"
                    />
                  ) : (
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="mt-1 text-xs leading-5 text-[#ff8b9c]" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
