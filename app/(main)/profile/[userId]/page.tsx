import {
  getOwnProfile,
  getUserById,
} from "@/app/services/user.action";
import {
  getUserPosts,
} from "@/app/services/post.action";
import ProfileContent from "../components/ProfileContent";
import ProfileError from "../components/ProfileError";
import ProfileHeader from "../components/ProfileHeader";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [profileResult, ownProfileResult, postsResult] =
    await Promise.all([
      getUserById(userId),
      getOwnProfile(),
      getUserPosts(userId),
    ]);

  if (!profileResult.success) {
    return <ProfileError message={profileResult.message} />;
  }

  const isOwnProfile =
    ownProfileResult.success &&
    ownProfileResult.data._id === profileResult.data._id;

  return (
    <div className="mx-auto w-full max-w-[1520px] px-4 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12 xl:px-14">
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        profile={profileResult.data}
      />
      <ProfileContent
        initialError={postsResult.error}
        initialPagination={postsResult.pagination}
        initialPosts={postsResult.posts}
        isOwnProfile={Boolean(isOwnProfile)}
        profile={profileResult.data}
      />
    </div>
  );
}
