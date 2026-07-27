"use client";

import FollowButton from "@/app/(main)/profile/components/FollowButton";
import UserAvatar from "@/app/(main)/profile/components/UserAvatar";
import {
  addSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
  type SearchHistoryItem,
} from "@/app/services/search.action";
import {
  searchUsers,
  type UserSummary,
} from "@/app/services/user.action";
import {
  Clock3,
  LoaderCircle,
  Search,
  Sparkles,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

type SearchExperienceProps = {
  initialHistory: SearchHistoryItem[];
  initialHistoryError?: string;
  initialSuggestedUsers: UserSummary[];
  initialSuggestedUsersError?: string;
};

export default function SearchExperience({
  initialHistory,
  initialHistoryError,
  initialSuggestedUsers,
  initialSuggestedUsersError,
}: SearchExperienceProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [history, setHistory] = useState(initialHistory);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pendingHistoryId, setPendingHistoryId] = useState("");
  const [isMutatingHistory, startHistoryTransition] = useTransition();
  const requestId = useRef(0);

  useEffect(() => {
    const normalizedQuery = query.trim();
    const currentRequestId = requestId.current;

    if (!normalizedQuery) {
      return;
    }

    const timer = window.setTimeout(() => {
      void searchUsers(normalizedQuery).then((result) => {
        if (currentRequestId !== requestId.current) {
          return;
        }

        if (result.success) {
          setResults(result.data);
          setSearchError("");
        } else {
          setResults([]);
          setSearchError(result.message);
        }
        setIsSearching(false);
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  function updateQuery(nextQuery: string) {
    requestId.current += 1;
    setQuery(nextQuery);
    setSearchError("");

    if (nextQuery.trim()) {
      setIsSearching(true);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }

  function openUser(user: UserSummary) {
    const currentQuery = query.trim() || user.username;
    startHistoryTransition(async () => {
      await addSearchHistory(user._id, currentQuery);
      router.push(`/profile/${user._id}`);
    });
  }

  function removeHistoryItem(historyId: string) {
    setPendingHistoryId(historyId);
    startHistoryTransition(async () => {
      const result = await deleteSearchHistoryItem(historyId);
      if (result.success) {
        setHistory((items) =>
          items.filter((item) => item._id !== historyId),
        );
      }
      setPendingHistoryId("");
    });
  }

  function clearHistory() {
    setPendingHistoryId("all");
    startHistoryTransition(async () => {
      const result = await clearSearchHistory();
      if (result.success) {
        setHistory([]);
      }
      setPendingHistoryId("");
    });
  }

  const normalizedQuery = query.trim();
  const showSearchResults = Boolean(normalizedQuery);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 lg:py-10">
      <header>
        <p className="text-xs font-bold tracking-[0.18em] text-[#8f9cff] uppercase">
          Khám phá cộng đồng
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
          Tìm kiếm
        </h1>
      </header>

      <div className="relative mt-6">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[var(--app-subtle)]"
        />
        <input
          aria-label="Tìm kiếm người dùng"
          autoComplete="off"
          className="h-13 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-input)] pr-12 pl-12 text-sm text-[var(--app-text)] placeholder:text-[var(--app-subtle)] transition focus:border-[#6879e8] focus:ring-2 focus:ring-[#4154c8]/20 focus:outline-none"
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Tìm theo tên, username hoặc email..."
          type="search"
          value={query}
        />
        {query && (
          <button
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
            onClick={() => updateQuery("")}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      <div aria-live="polite" className="mt-6">
        {showSearchResults ? (
          <section
            aria-labelledby="search-results-heading"
            className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
              <h2
                className="text-sm font-bold text-[var(--app-text)]"
                id="search-results-heading"
              >
                Kết quả cho “{normalizedQuery}”
              </h2>
              {isSearching && (
                <LoaderCircle
                  aria-label="Đang tìm kiếm"
                  className="size-4 animate-spin text-[#8f9cff]"
                />
              )}
            </div>

            {!isSearching && searchError && (
              <p className="px-5 py-10 text-center text-sm text-[#f87171]">
                {searchError}
              </p>
            )}

            {!isSearching && !searchError && results.length === 0 && (
              <div className="flex flex-col items-center px-5 py-12 text-center">
                <UsersRound
                  aria-hidden="true"
                  className="size-9 text-[var(--app-subtle)]"
                />
                <p className="mt-3 text-sm text-[var(--app-muted)]">
                  Không tìm thấy người dùng phù hợp.
                </p>
              </div>
            )}

            <ul className="divide-y divide-[var(--app-border)]">
              {results.map((user) => (
                <li key={user._id}>
                  <button
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[var(--app-hover)] focus-visible:bg-[var(--app-hover)] focus-visible:outline-none disabled:opacity-60"
                    disabled={isMutatingHistory}
                    onClick={() => openUser(user)}
                    type="button"
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
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="space-y-8">
            <section
              aria-labelledby="recent-searches-heading"
              className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
                <h2
                  className="flex items-center gap-2 text-sm font-bold text-[var(--app-text)]"
                  id="recent-searches-heading"
                >
                  <Clock3 aria-hidden="true" className="size-4 text-[#8f9cff]" />
                  Gần đây
                </h2>
                {history.length > 0 && (
                  <button
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-[#8f9cff] transition hover:bg-[var(--app-hover)] hover:text-[#a9b2ff] disabled:opacity-60"
                    disabled={isMutatingHistory}
                    onClick={clearHistory}
                    type="button"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {initialHistoryError && history.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-[#f87171]">
                  {initialHistoryError}
                </p>
              )}

              {!initialHistoryError && history.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-[var(--app-muted)]">
                  Chưa có lịch sử tìm kiếm.
                </p>
              )}

              <ul className="divide-y divide-[var(--app-border)]">
                {history.map((item) => {
                  const user = item.searchedUser;
                  return (
                    <li
                      className="flex items-center gap-2 px-4 py-3 sm:px-5"
                      key={item._id}
                    >
                      <button
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none disabled:opacity-60"
                        disabled={!user || isMutatingHistory}
                        onClick={() => user && openUser(user)}
                        type="button"
                      >
                        {user ? (
                          <UserAvatar
                            fullName={user.fullName}
                            profilePicture={user.profilePicture}
                            username={user.username}
                          />
                        ) : (
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--app-input)]">
                            <Search
                              aria-hidden="true"
                              className="size-5 text-[var(--app-subtle)]"
                            />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--app-text)]">
                            {user?.username || item.searchQuery}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[var(--app-muted)]">
                            {user?.fullName || `Tìm kiếm: ${item.searchQuery}`}
                          </span>
                        </span>
                      </button>
                      <button
                        aria-label={`Xóa ${item.searchQuery} khỏi lịch sử`}
                        className="rounded-full p-2 text-[var(--app-subtle)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] disabled:opacity-50"
                        disabled={isMutatingHistory}
                        onClick={() => removeHistoryItem(item._id)}
                        type="button"
                      >
                        {pendingHistoryId === item._id ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin"
                          />
                        ) : (
                          <X aria-hidden="true" className="size-4" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {pendingHistoryId === "all" && (
                <p className="flex items-center justify-center gap-2 border-t border-[var(--app-border)] px-5 py-3 text-xs text-[var(--app-muted)]">
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  Đang xóa lịch sử...
                </p>
              )}
            </section>

            <section aria-labelledby="suggested-users-heading">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles
                  aria-hidden="true"
                  className="size-4 text-[#8f9cff]"
                />
                <h2
                  className="text-sm font-bold text-[var(--app-text)]"
                  id="suggested-users-heading"
                >
                  Gợi ý cho bạn
                </h2>
              </div>

              {initialSuggestedUsersError && (
                <p className="rounded-2xl border border-red-400/10 bg-red-400/[0.06] px-4 py-5 text-center text-sm text-[#f87171]">
                  {initialSuggestedUsersError}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {initialSuggestedUsers.map((user) => (
                  <article
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
                    key={user._id}
                  >
                    <button
                      aria-label={`Mở trang cá nhân ${user.username}`}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none"
                      onClick={() => openUser(user)}
                      type="button"
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
                        <span className="mt-0.5 block truncate text-xs text-[var(--app-muted)]">
                          {user.fullName || "Gợi ý cho bạn"}
                        </span>
                      </span>
                    </button>
                    <FollowButton
                      initialIsFollowing={user.isFollowing}
                      userId={user._id}
                    />
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
