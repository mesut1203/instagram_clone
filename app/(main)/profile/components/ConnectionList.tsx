import type { UserSummary } from "@/app/services/user.action";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

export default function ConnectionList({
  emptyMessage,
  users,
}: {
  emptyMessage: string;
  users: UserSummary[];
}) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-14 text-center">
        <UsersRound aria-hidden="true" className="size-10 text-[var(--app-subtle)]" />
        <p className="mt-4 text-sm text-[var(--app-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--app-border)]">
      {users.map((user) => (
        <li key={user._id}>
          <Link
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--app-hover)] focus-visible:bg-[var(--app-hover)] focus-visible:outline-none sm:px-5"
            href={`/profile/${user._id}`}
          >
            <UserAvatar
              fullName={user.fullName}
              profilePicture={user.profilePicture}
              username={user.username}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--app-text)]">
                {user.username}
              </span>
              <span className="mt-0.5 block truncate text-sm text-[var(--app-muted)]">
                {user.fullName || user.bio || "Người dùng Instagram"}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
