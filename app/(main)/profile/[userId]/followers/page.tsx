import {
  getFollowers,
  type FollowPagination,
} from "@/app/services/follow.action";
import { getUserById } from "@/app/services/user.action";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ConnectionList from "../../components/ConnectionList";
import ConnectionPagination from "../../components/ConnectionPagination";

function parsePage(value?: string | string[]) {
  const pageValue = Array.isArray(value) ? value[0] : value;
  const page = Number(pageValue);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function FollowersPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { userId } = await params;
  const page = parsePage((await searchParams).page);
  const [listResult, profileResult] = await Promise.all([
    getFollowers(userId, page),
    getUserById(userId),
  ]);
  const username = profileResult.success
    ? profileResult.data.username
    : "người dùng";
  const pagination: FollowPagination = listResult.success
    ? listResult.data.pagination
    : { currentPage: page, hasMore: false, totalPages: 0 };

  return (
    <div className="mx-auto w-full max-w-[620px] px-4 py-8 sm:px-6 lg:py-12">
      <section className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl shadow-black/20">
        <header className="flex items-center gap-3 border-b border-[var(--app-border)] px-4 py-4">
          <Link
            aria-label={`Quay lại trang cá nhân ${username}`}
            className="rounded-lg p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
            href={`/profile/${userId}`}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Link>
          <div>
            <h1 className="font-bold text-[var(--app-text)]">Người theo dõi</h1>
            <p className="text-xs text-[var(--app-muted)]">@{username}</p>
          </div>
        </header>

        {listResult.success ? (
          <ConnectionList
            emptyMessage="Chưa có người theo dõi."
            users={listResult.data.users}
          />
        ) : (
          <p className="px-5 py-12 text-center text-sm text-[#f87171]">
            {listResult.message}
          </p>
        )}

        <ConnectionPagination
          basePath={`/profile/${userId}/followers`}
          pagination={pagination}
        />
      </section>
    </div>
  );
}
