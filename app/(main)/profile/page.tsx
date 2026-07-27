import {
  getOwnProfile,
  getUserById,
} from "@/app/services/user.action";
import {
  getUserPosts,
  type PostFilter,
} from "@/app/services/post.action";
import ProfileContent from "./components/ProfileContent";
import ProfileError from "./components/ProfileError";
import ProfileHeader from "./components/ProfileHeader";

export default async function OwnProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const requestedFilter = (await searchParams).filter;
  const initialFilter: PostFilter =
    requestedFilter === "saved" || requestedFilter === "video"
      ? requestedFilter
      : "all";
  const ownProfileResult = await getOwnProfile();

  if (!ownProfileResult.success) {
    return <ProfileError message={ownProfileResult.message} />;
  }

  const [publicProfileResult, postsResult] = await Promise.all([
    getUserById(ownProfileResult.data._id),
    getUserPosts(ownProfileResult.data._id, initialFilter),
  ]);
  const profile = publicProfileResult.success
    ? {
        ...ownProfileResult.data,
        ...publicProfileResult.data,
      }
    : ownProfileResult.data;

  return (
    <div className="mx-auto w-full max-w-[1520px] px-4 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12 xl:px-14">
      <ProfileHeader isOwnProfile profile={profile} />
      <ProfileContent
        initialFilter={initialFilter}
        initialError={postsResult.error}
        initialPagination={postsResult.pagination}
        initialPosts={postsResult.posts}
        isOwnProfile
        profile={profile}
      />
    </div>
  );
}
