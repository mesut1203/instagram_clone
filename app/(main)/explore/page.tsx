import { getExplorePosts } from "@/app/services/post.action";
import ExploreGrid from "../components/posts/ExploreGrid";

export const metadata = {
  title: "Khám phá | Instagram Clone",
};

export default async function ExplorePage() {
  const result = await getExplorePosts();

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:py-10">
      <header className="mb-6">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#8f9cff] uppercase">
          Khám phá
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
          Bài viết nổi bật
        </h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          Nội dung đang được cộng đồng quan tâm nhiều nhất.
        </p>
      </header>

      <ExploreGrid
        initialError={result.error}
        initialPagination={result.pagination}
        initialPosts={result.posts}
      />
    </main>
  );
}
