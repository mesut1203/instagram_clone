"use client";

import {
  deletePostAction,
  setPostLikeAction,
  setPostSaveAction,
  updatePostAction,
  type FeedPost,
} from "@/app/services/post.action";
import {
  Bookmark,
  Check,
  Heart,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import FeedPostMedia from "./FeedPostMedia";
import FeedUserAvatar from "./FeedUserAvatar";
import { formatRelativeTime, numberFormatter } from "./feed-utils";

type FeedPostCardProps = {
  currentUserId?: string;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, caption: string) => void;
  post: FeedPost;
};

export default function FeedPostCard({
  currentUserId,
  onPostDeleted,
  onPostUpdated,
  post,
}: FeedPostCardProps) {
  const [caption, setCaption] = useState(post.caption ?? "");
  const [draftCaption, setDraftCaption] = useState(post.caption ?? "");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likes, setLikes] = useState(post.likes);
  const [pendingAction, setPendingAction] = useState<
    "delete" | "edit" | "like" | "save" | null
  >(null);
  const router = useRouter();
  const isOwner = Boolean(currentUserId && currentUserId === post.user._id);

  const toggleLike = async () => {
    if (pendingAction === "like") return;

    const nextLiked = !isLiked;
    const previousLikes = likes;
    setError("");
    setIsLiked(nextLiked);
    setLikes(Math.max(0, likes + (nextLiked ? 1 : -1)));
    setPendingAction("like");

    const result = await setPostLikeAction(post._id, nextLiked);
    if (!result.success) {
      setIsLiked(!nextLiked);
      setLikes(previousLikes);
      setError(result.message);
    } else if (typeof result.data?.likes === "number") {
      setLikes(result.data.likes);
    }

    setPendingAction(null);
  };

  const toggleSave = async () => {
    if (pendingAction === "save") return;

    const nextSaved = !isSaved;
    setError("");
    setIsSaved(nextSaved);
    setPendingAction("save");

    const result = await setPostSaveAction(post._id, nextSaved);
    if (!result.success) {
      setIsSaved(!nextSaved);
      setError(result.message);
    }

    setPendingAction(null);
  };

  const sharePost = async () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    const shareData = {
      text: caption || `Bài viết của ${post.user.username}`,
      title: `Bài viết của ${post.user.username}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // The share sheet can be dismissed by the user without showing an error.
    }
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPendingAction("edit");

    const result = await updatePostAction(post._id, draftCaption);
    if (!result.success) {
      setError(result.message);
      setPendingAction(null);
      return;
    }

    const normalizedCaption = draftCaption.trim();
    setCaption(normalizedCaption);
    setIsEditing(false);
    setIsMenuOpen(false);
    setPendingAction(null);
    onPostUpdated?.(post._id, normalizedCaption);
  };

  const deletePost = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    setError("");
    setPendingAction("delete");
    const result = await deletePostAction(post._id);

    if (!result.success) {
      setError(result.message);
      setPendingAction(null);
      return;
    }

    if (onPostDeleted) {
      onPostDeleted(post._id);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <article className="w-full">
      <header className="relative flex items-center justify-between px-1 py-3 2xl:py-5">
        <Link
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f9cff]"
          href={`/profile/${post.user._id}`}
        >
          <FeedUserAvatar user={post.user} />
          <span className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="truncate font-bold text-[var(--app-text)]">
              {post.user.username}
            </span>
            <span
              aria-hidden="true"
              className="shrink-0 text-[var(--app-muted)]"
            >
              •
            </span>
            <time
              className="shrink-0 text-[var(--app-muted)]"
              dateTime={post.createdAt}
            >
              {formatRelativeTime(post.createdAt)}
            </time>
          </span>
        </Link>

        {isOwner ? (
          <>
            <button
              aria-expanded={isMenuOpen}
              aria-label={`Tùy chọn bài viết của ${post.user.username}`}
              className="rounded-full p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
              onClick={() => setIsMenuOpen((open) => !open)}
              type="button"
            >
              <MoreHorizontal aria-hidden="true" className="size-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-12 right-0 z-10 w-44 overflow-hidden rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-menu)] p-1 shadow-2xl">
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--app-text)] hover:bg-[var(--app-hover)]"
                  onClick={() => {
                    setDraftCaption(caption);
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  type="button"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Sửa chú thích
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-400/10"
                  disabled={pendingAction === "delete"}
                  onClick={() => void deletePost()}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Xóa bài viết
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            aria-label={`Mở bài viết của ${post.user.username}`}
            className="rounded-full p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f9cff]"
            href={`/posts/${post._id}`}
          >
            <MoreHorizontal aria-hidden="true" className="size-5" />
          </Link>
        )}
      </header>

      {post.mediaType === "video" ? (
        <FeedPostMedia post={{ ...post, caption }} />
      ) : (
        <Link
          aria-label={`Mở bài viết của ${post.user.username}`}
          href={`/posts/${post._id}`}
        >
          <FeedPostMedia post={{ ...post, caption }} />
        </Link>
      )}

      <div className="px-1 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              aria-label={isLiked ? "Bỏ thích bài viết" : "Thích bài viết"}
              aria-pressed={isLiked}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold transition hover:bg-[var(--app-hover)] ${
                isLiked
                  ? "text-[#ff4d6d]"
                  : "text-[var(--app-text)] hover:text-[#ff6682]"
              }`}
              disabled={pendingAction === "like"}
              onClick={() => void toggleLike()}
              type="button"
            >
              <Heart
                aria-hidden="true"
                className="size-6"
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={1.8}
              />
              <span>{numberFormatter.format(likes)}</span>
            </button>
            <Link
              aria-label="Xem bình luận"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
              href={`/posts/${post._id}#comments`}
            >
              <MessageCircle
                aria-hidden="true"
                className="size-6"
                strokeWidth={1.8}
              />
              <span>{numberFormatter.format(post.comments)}</span>
            </Link>
            <button
              aria-label="Chia sẻ bài viết"
              className="rounded-full p-2 text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
              onClick={() => void sharePost()}
              type="button"
            >
              <Send aria-hidden="true" className="size-6" strokeWidth={1.8} />
            </button>
          </div>
          <button
            aria-label={isSaved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
            className={`rounded-full p-2 transition hover:bg-[var(--app-hover)] ${
              isSaved
                ? "text-[#8f9cff]"
                : "text-[var(--app-text)]"
            }`}
            disabled={pendingAction === "save"}
            onClick={() => void toggleSave()}
            type="button"
          >
            <Bookmark
              aria-hidden="true"
              className="size-6"
              fill={isSaved ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {isEditing ? (
          <form className="mt-3 space-y-2" onSubmit={submitEdit}>
            <label className="sr-only" htmlFor={`caption-${post._id}`}>
              Chú thích bài viết
            </label>
            <textarea
              className="min-h-24 w-full resize-y rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-input)] px-3 py-2 text-sm leading-6 text-[var(--app-text)] outline-none focus:border-[#8f9cff]"
              id={`caption-${post._id}`}
              maxLength={2200}
              onChange={(event) => setDraftCaption(event.target.value)}
              value={draftCaption}
            />
            <div className="flex justify-end gap-2">
              <button
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[var(--app-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
                onClick={() => {
                  setDraftCaption(caption);
                  setIsEditing(false);
                }}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
                Hủy
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4154c8] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5265d7] disabled:opacity-60"
                disabled={pendingAction === "edit"}
                type="submit"
              >
                {pendingAction === "edit" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
                Lưu
              </button>
            </div>
          </form>
        ) : (
          caption && (
            <p className="mt-2 text-sm leading-6 text-[var(--app-text)]">
              <Link
                className="mr-2 font-bold text-[var(--app-text)] hover:underline"
                href={`/profile/${post.user._id}`}
              >
                {post.user.username}
              </Link>
              {caption}
            </p>
          )
        )}

        {post.comments > 0 && (
          <Link
            className="mt-2 inline-block text-sm text-[var(--app-muted)] hover:text-[var(--app-text)]"
            href={`/posts/${post._id}#comments`}
          >
            Xem {numberFormatter.format(post.comments)} bình luận
          </Link>
        )}

        {error && (
          <p
            className="mt-3 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
