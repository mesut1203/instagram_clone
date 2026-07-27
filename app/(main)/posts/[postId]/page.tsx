import { getCurrentUser } from "@/app/services/auth.action";
import { getPostById } from "@/app/services/post.action";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { CommentsPanel } from "../../components/comments";
import FeedPostCard from "../../components/feed/FeedPostCard";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const [postResult, currentUser] = await Promise.all([
    getPostById(postId),
    getCurrentUser(),
  ]);

  if (!postResult.post) {
    return (
      <main className="mx-auto flex min-h-[70dvh] w-full max-w-xl items-center px-4 py-10">
        <section className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] p-8 text-center">
          <AlertCircle
            aria-hidden="true"
            className="mx-auto size-10 text-[#8f9cff]"
          />
          <h1 className="mt-4 text-xl font-bold text-[var(--app-text)]">
            Không tìm thấy bài viết
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
            {postResult.error ??
              "Bài viết có thể đã bị xóa hoặc không còn khả dụng."}
          </p>
          <Link
            className="mt-6 inline-flex rounded-xl bg-[#4154c8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5265d7]"
            href="/"
          >
            Quay lại trang chủ
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[680px] space-y-5 px-4 py-6 sm:px-6 lg:py-10">
      <FeedPostCard
        currentUserId={currentUser?._id}
        post={postResult.post}
      />
      <CommentsPanel
        currentUserId={currentUser?._id}
        initialCommentCount={postResult.post.comments}
        postId={postResult.post._id}
      />
    </main>
  );
}
