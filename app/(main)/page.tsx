import NewsFeed from "./components/NewsFeed";
import { NEWS_FEED_PAGE_SIZE } from "./components/feed/feed-config";
import SuggestedUsers from "./components/feed/SuggestedUsers";
import { resolveApiAssetUrl } from "../services/api-client";
import { getCurrentUser } from "../services/auth.action";
import { getNewsFeed } from "../services/post.action";
import { getSuggestedUsers } from "../services/user.action";

export default async function HomePage() {
  const [feed, currentUser, suggestedUsersResult] = await Promise.all([
    getNewsFeed(0, NEWS_FEED_PAGE_SIZE),
    getCurrentUser(),
    getSuggestedUsers(6),
  ]);
  const normalizedCurrentUser = currentUser
    ? {
        _id: currentUser._id,
        fullName: currentUser.fullName,
        profilePicture: resolveApiAssetUrl(currentUser.profilePicture),
        username: currentUser.username,
      }
    : null;
  const suggestedUsers = suggestedUsersResult.success
    ? suggestedUsersResult.data
        .filter((user) => user._id !== currentUser?._id)
        .map((user) => ({
          ...user,
          profilePicture: resolveApiAssetUrl(user.profilePicture),
        }))
    : [];

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:py-10 xl:grid xl:grid-cols-[minmax(0,620px)_minmax(250px,300px)] xl:items-start xl:gap-6 xl:px-6 xl:pt-14 2xl:grid-cols-[minmax(0,620px)_minmax(300px,380px)] 2xl:gap-[clamp(48px,7.8vw,160px)] 2xl:px-8 2xl:pt-16">
      <section
        aria-label="Bảng tin"
        className="mx-auto w-full max-w-[620px] xl:mx-0"
      >
        <NewsFeed
          currentUserId={currentUser?._id}
          initialError={feed.error}
          initialPagination={feed.pagination}
          initialPosts={feed.posts}
        />
      </section>

      <SuggestedUsers
        currentUser={normalizedCurrentUser}
        error={
          suggestedUsersResult.success
            ? undefined
            : suggestedUsersResult.message
        }
        users={suggestedUsers}
      />
    </div>
  );
}
