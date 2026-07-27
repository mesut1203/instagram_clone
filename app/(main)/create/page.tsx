import CreatePostForm from "../components/posts/CreatePostForm";

export const metadata = {
  title: "Tạo bài viết | Instagram Clone",
};

export default function CreatePostPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
      <CreatePostForm />
    </main>
  );
}
