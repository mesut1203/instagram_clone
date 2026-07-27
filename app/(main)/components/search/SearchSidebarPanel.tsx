"use client";

import UserAvatar from "@/app/(main)/profile/components/UserAvatar";
import {
  addSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
  getSearchHistory,
  type SearchHistoryItem,
} from "@/app/services/search.action";
import {
  searchUsers,
  type UserSummary,
} from "@/app/services/user.action";
import { LoaderCircle, Search, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SearchSidebarPanelProps = {
  onClose: () => void;
  open: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function SearchSidebarPanel({
  onClose,
  open,
}: SearchSidebarPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRequestId = useRef(0);
  const historyRequestId = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [searchError, setSearchError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [pendingHistoryId, setPendingHistoryId] = useState("");
  const [openingUserId, setOpeningUserId] = useState("");

  useEffect(() => {
    if (!open) {
      searchRequestId.current += 1;
      historyRequestId.current += 1;
      return;
    }

    const currentHistoryRequestId = historyRequestId.current + 1;
    historyRequestId.current = currentHistoryRequestId;

    const focusFrame = window.requestAnimationFrame(() => {
      setQuery("");
      setResults([]);
      setSearchError("");
      setHistoryError("");
      setMutationError("");
      setIsSearching(false);
      setIsLoadingHistory(true);
      setPendingHistoryId("");
      setOpeningUserId("");
      inputRef.current?.focus();

      void getSearchHistory().then((result) => {
        if (
          historyRequestId.current !== currentHistoryRequestId ||
          !open
        ) {
          return;
        }

        if (result.success) {
          setHistory(result.data);
          setHistoryError("");
        } else {
          setHistory([]);
          setHistoryError(result.message);
        }
        setIsLoadingHistory(false);
      });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    const currentSearchRequestId = searchRequestId.current;
    const timer = window.setTimeout(() => {
      void searchUsers(normalizedQuery).then((result) => {
        if (searchRequestId.current !== currentSearchRequestId) {
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
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  function updateQuery(nextQuery: string) {
    searchRequestId.current += 1;
    setQuery(nextQuery);
    setSearchError("");
    setMutationError("");

    if (nextQuery.trim()) {
      setIsSearching(true);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }

  async function openUser(user: UserSummary) {
    if (openingUserId) {
      return;
    }

    setOpeningUserId(user._id);
    setMutationError("");

    const historyResult = await addSearchHistory(
      user._id,
      query.trim() || user.username,
    );

    if (!historyResult.success) {
      setMutationError(historyResult.message);
    }

    router.push(`/profile/${user._id}`);
    onClose();
  }

  async function removeHistoryItem(historyId: string) {
    if (pendingHistoryId) {
      return;
    }

    setPendingHistoryId(historyId);
    setMutationError("");
    const result = await deleteSearchHistoryItem(historyId);

    if (result.success) {
      setHistory((items) =>
        items.filter((item) => item._id !== historyId),
      );
    } else {
      setMutationError(result.message);
    }
    setPendingHistoryId("");
  }

  async function removeAllHistory() {
    if (pendingHistoryId) {
      return;
    }

    setPendingHistoryId("all");
    setMutationError("");
    const result = await clearSearchHistory();

    if (result.success) {
      setHistory([]);
    } else {
      setMutationError(result.message);
    }
    setPendingHistoryId("");
  }

  if (!open) {
    return null;
  }

  const normalizedQuery = query.trim();
  const showSearchResults = normalizedQuery.length > 0;
  const liveMessage = isSearching
    ? "Đang tìm kiếm người dùng."
    : isLoadingHistory
      ? "Đang tải lịch sử tìm kiếm."
      : searchError || historyError || mutationError
        ? searchError || historyError || mutationError
        : showSearchResults
          ? `Tìm thấy ${results.length} người dùng.`
          : `${history.length} mục tìm kiếm gần đây.`;

  function renderUserButton(user: UserSummary) {
    const isOpening = openingUserId === user._id;

    return (
      <button
        aria-label={`Mở trang cá nhân của ${user.username}`}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-xl px-1 py-2 text-left transition hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#4b74ff] focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        disabled={Boolean(openingUserId)}
        onClick={() => void openUser(user)}
        type="button"
      >
        <UserAvatar
          className="size-14"
          fullName={user.fullName}
          plain
          profilePicture={user.profilePicture}
          username={user.username}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-[var(--app-text)]">
            {user.username}
          </span>
          <span className="mt-0.5 block truncate text-sm text-[var(--app-muted)]">
            {user.fullName || user.bio || "Người dùng Instagram"}
          </span>
        </span>
        {isOpening && (
          <LoaderCircle
            aria-hidden="true"
            className="mr-2 size-5 shrink-0 animate-spin text-[var(--app-muted)]"
          />
        )}
      </button>
    );
  }

  return (
    <aside
      aria-labelledby="desktop-search-panel-title"
      aria-modal="false"
      className="fixed inset-y-0 left-[120px] z-40 hidden flex-col overflow-hidden rounded-r-[24px] border-r border-[var(--app-border)] bg-[var(--app-background-elevated)] shadow-[12px_0_32px_rgba(0,0,0,0.12)] lg:flex"
      id="desktop-search-panel"
      role="dialog"
      style={{ width: "min(600px, calc(100vw - 120px))" }}
    >
      <header className="flex shrink-0 items-center justify-between px-8 pt-10 pb-7">
        <h2
          className="text-3xl font-bold tracking-tight text-[var(--app-text)]"
          id="desktop-search-panel-title"
        >
          Tìm kiếm
        </h2>
        <button
          aria-label="Đóng tìm kiếm"
          className="rounded-full p-2 text-[var(--app-text)] transition hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#4b74ff] focus-visible:outline-none"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-7" strokeWidth={1.8} />
        </button>
      </header>

      <div className="shrink-0 border-b border-[var(--app-border)] px-8 pb-7">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[var(--app-subtle)]"
          />
          <input
            aria-controls={
              showSearchResults
                ? "search-sidebar-results"
                : "search-sidebar-history"
            }
            aria-label="Tìm kiếm người dùng"
            autoComplete="off"
            autoFocus
            className="h-14 w-full rounded-2xl border border-transparent bg-[var(--app-input)] pr-12 pl-12 text-base text-[var(--app-text)] placeholder:text-[var(--app-subtle)] focus:border-[#4b74ff] focus:ring-2 focus:ring-[#4b74ff]/20 focus:outline-none"
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Tìm kiếm"
            ref={inputRef}
            type="search"
            value={query}
          />
          {query && (
            <button
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] focus-visible:ring-2 focus-visible:ring-[#4b74ff] focus-visible:outline-none"
              onClick={() => {
                updateQuery("");
                inputRef.current?.focus();
              }}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        {liveMessage}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        {showSearchResults ? (
          <section aria-busy={isSearching} id="search-sidebar-results">
            <h3 className="px-2 text-base font-bold text-[var(--app-text)]">
              Kết quả tìm kiếm
            </h3>

            {isSearching && (
              <div className="flex items-center justify-center py-14 text-[var(--app-muted)]">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-7 animate-spin"
                />
              </div>
            )}

            {!isSearching && searchError && (
              <p
                className="px-3 py-12 text-center text-sm text-[#ed4956]"
                role="alert"
              >
                {searchError}
              </p>
            )}

            {!isSearching && !searchError && results.length === 0 && (
              <div className="flex flex-col items-center px-3 py-14 text-center">
                <UserRound
                  aria-hidden="true"
                  className="size-10 text-[var(--app-subtle)]"
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-sm text-[var(--app-muted)]">
                  Không tìm thấy người dùng phù hợp.
                </p>
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <ul className="mt-4 space-y-1">
                {results.map((user) => (
                  <li key={user._id}>{renderUserButton(user)}</li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section aria-busy={isLoadingHistory} id="search-sidebar-history">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-base font-bold text-[var(--app-text)]">
                Mới đây
              </h3>
              {history.length > 0 && !isLoadingHistory && (
                <button
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-[#4b74ff] transition hover:bg-[var(--app-hover)] focus-visible:ring-2 focus-visible:ring-[#4b74ff] focus-visible:outline-none disabled:opacity-50"
                  disabled={Boolean(pendingHistoryId)}
                  onClick={() => void removeAllHistory()}
                  type="button"
                >
                  {pendingHistoryId === "all"
                    ? "Đang xóa..."
                    : "Xóa tất cả"}
                </button>
              )}
            </div>

            {isLoadingHistory && (
              <div className="flex items-center justify-center py-14 text-[var(--app-muted)]">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-7 animate-spin"
                />
              </div>
            )}

            {!isLoadingHistory && historyError && (
              <p
                className="px-3 py-12 text-center text-sm text-[#ed4956]"
                role="alert"
              >
                {historyError}
              </p>
            )}

            {!isLoadingHistory &&
              !historyError &&
              history.length === 0 && (
                <p className="px-3 py-12 text-center text-sm text-[var(--app-muted)]">
                  Chưa có lịch sử tìm kiếm.
                </p>
              )}

            {!isLoadingHistory && history.length > 0 && (
              <ul className="mt-4 space-y-1">
                {history.map((item) => {
                  const user = item.searchedUser;
                  const isDeleting = pendingHistoryId === item._id;

                  return (
                    <li
                      className="flex items-center gap-2 rounded-xl px-1 transition hover:bg-[var(--app-hover)]"
                      key={item._id}
                    >
                      {user ? (
                        renderUserButton(user)
                      ) : (
                        <div className="flex min-w-0 flex-1 items-center gap-4 px-1 py-2">
                          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--app-input)]">
                            <Search
                              aria-hidden="true"
                              className="size-6 text-[var(--app-subtle)]"
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[15px] font-semibold text-[var(--app-text)]">
                              {item.searchQuery}
                            </span>
                            <span className="mt-0.5 block truncate text-sm text-[var(--app-muted)]">
                              Tìm kiếm gần đây
                            </span>
                          </span>
                        </div>
                      )}
                      <button
                        aria-label={`Xóa ${item.searchQuery} khỏi lịch sử tìm kiếm`}
                        className="mr-1 rounded-full p-2 text-[var(--app-text)] transition hover:bg-[var(--app-input)] focus-visible:ring-2 focus-visible:ring-[#4b74ff] focus-visible:outline-none disabled:opacity-50"
                        disabled={Boolean(pendingHistoryId)}
                        onClick={() => void removeHistoryItem(item._id)}
                        type="button"
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-5 animate-spin"
                          />
                        ) : (
                          <X
                            aria-hidden="true"
                            className="size-5"
                            strokeWidth={1.8}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {mutationError && (
          <p
            className="mt-4 rounded-xl bg-[#ed4956]/10 px-4 py-3 text-center text-sm text-[#ed4956]"
            role="alert"
          >
            {mutationError}
          </p>
        )}
      </div>
    </aside>
  );
}
