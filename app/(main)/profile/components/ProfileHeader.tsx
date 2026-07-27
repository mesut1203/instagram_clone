import type { UserProfile } from "@/app/services/user.action";
import { CircleCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import FollowButton from "./FollowButton";
import MessageUserButton from "./MessageUserButton";
import UserAvatar from "./UserAvatar";

type ProfileHeaderProps = {
  isOwnProfile: boolean;
  profile: UserProfile;
};

function getSafeWebsite(website?: string | null) {
  if (!website) {
    return null;
  }

  try {
    const url = new URL(website);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function ProfileHeader({
  isOwnProfile,
  profile,
}: ProfileHeaderProps) {
  const website = getSafeWebsite(profile.website);
  const displayName = profile.fullName?.trim() || profile.username;

  return (
    <header className="pb-7 sm:pb-9">
      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-5 sm:grid-cols-[152px_minmax(0,1fr)] sm:gap-x-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-x-12">
        <div className="flex justify-start">
          <UserAvatar
            className="size-20 sm:size-36 lg:size-44"
            fullName={profile.fullName}
            plain
            profilePicture={profile.profilePicture}
            username={profile.username}
          />
        </div>

        <div className="min-w-0 pt-1 sm:pt-2">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-[var(--app-text)] sm:text-2xl lg:text-3xl">
              <span className="truncate">{profile.username}</span>
              {profile.isVerified && (
                <CircleCheck
                  aria-label="Tài khoản đã xác minh"
                  className="size-5 shrink-0 fill-[#4154c8] text-white"
                />
              )}
            </h1>
          </div>

          <p className="mt-2 truncate text-sm text-[var(--app-text)] sm:mt-4 sm:text-base lg:text-lg">
            {displayName}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--app-text)] sm:mt-4 sm:gap-x-6 sm:text-sm lg:text-base">
            <p>
              <strong className="font-bold">{profile.postsCount ?? 0}</strong>{" "}
              bài viết
            </p>
            <Link
              className="rounded hover:underline focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
              href={`/profile/${profile._id}/followers`}
            >
              <strong className="font-bold">
                {profile.followersCount ?? 0}
              </strong>{" "}
              người theo dõi
            </Link>
            <Link
              className="rounded hover:underline focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
              href={`/profile/${profile._id}/following`}
            >
              Đang theo dõi{" "}
              <strong className="font-bold">
                {profile.followingCount ?? 0}
              </strong>{" "}
              người dùng
            </Link>
          </div>

          {(profile.bio || website) && (
            <div className="mt-3 hidden text-left sm:block">
              {profile.bio && (
                <p className="max-w-2xl whitespace-pre-line text-sm leading-6 text-[var(--app-muted)]">
                  {profile.bio}
                </p>
              )}
              {website && (
                <a
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8f9cff] hover:text-[#a9b2ff] hover:underline focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
                  href={website}
                  rel="noreferrer"
                  target="_blank"
                >
                  {profile.website}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {(profile.bio || website) && (
        <div className="mt-4 text-left sm:hidden">
          {profile.bio && (
            <p className="whitespace-pre-line text-sm leading-6 text-[var(--app-muted)]">
              {profile.bio}
            </p>
          )}
          {website && (
            <a
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8f9cff] hover:underline focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
              href={website}
              rel="noreferrer"
              target="_blank"
            >
              {profile.website}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          )}
        </div>
      )}

      <div className="mt-8 sm:mt-10">
        {isOwnProfile ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--app-input)] px-4 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none sm:text-base"
              href="/profile/edit"
            >
              Chỉnh sửa trang cá nhân
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--app-input)] px-4 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none sm:text-base"
              href="/profile?filter=saved"
            >
              Xem kho lưu trữ
            </Link>
          </div>
        ) : (
          <div
            className={
              profile.isFollowing
                ? "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                : ""
            }
          >
            <FollowButton
              className="w-full"
              fullWidth
              initialIsFollowing={profile.isFollowing}
              showIcon={false}
              userId={profile._id}
            />
            {profile.isFollowing && (
              <MessageUserButton userId={profile._id} />
            )}
          </div>
        )}
      </div>
    </header>
  );
}
