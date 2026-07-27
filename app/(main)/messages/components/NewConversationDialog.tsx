"use client";

import { createOrGetConversation } from "@/app/services/message.action";
import {
  searchUsers,
  type UserSummary,
} from "@/app/services/user.action";
import {
  Check,
  LoaderCircle,
  MessageCirclePlus,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import UserAvatar from "../../profile/components/UserAvatar";

type NewConversationDialogProps = {
  onClose: () => void;
  open: boolean;
};

export default function NewConversationDialog({
  onClose,
  open,
}: NewConversationDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPending, onClose, open]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!open || !normalizedQuery || selectedUser) {
      return;
    }

    const timer = window.setTimeout(() => {
      void searchUsers(normalizedQuery).then((result) => {
        setResults(result.success ? result.data : []);
        setError(result.success ? "" : result.message);
        setIsSearching(false);
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, query, selectedUser]);

  if (!open) {
    return null;
  }

  const closeDialog = () => {
    if (isPending) {
      return;
    }

    setError("");
    setQuery("");
    setResults([]);
    setSelectedUser(null);
    setIsSearching(false);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const userId = selectedUser?._id ?? query.trim();

    startTransition(async () => {
      const result = await createOrGetConversation(userId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setQuery("");
      setResults([]);
      setSelectedUser(null);
      setIsSearching(false);
      onClose();
      router.push(`/messages/${encodeURIComponent(result.data._id)}`);
      router.refresh();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          closeDialog();
        }
      }}
    >
      <section
        aria-labelledby="new-conversation-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-menu)] p-5 shadow-2xl shadow-black/50"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4">
          <div>
            <h2
              className="text-lg font-bold text-[var(--app-text)]"
              id="new-conversation-title"
            >
              Tin nhắn mới
            </h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Tìm và chọn người bạn muốn trò chuyện.
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="rounded-full p-2 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
            disabled={isPending}
            onClick={closeDialog}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <form className="mt-5" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="message-user-search">
            Tìm người dùng
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--app-subtle)]"
            />
            <input
              aria-describedby={
                error ? "new-conversation-error" : undefined
              }
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-input)] pr-10 pl-10 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)] focus:border-[#6675ef] focus:ring-2 focus:ring-[#6675ef]/20"
              disabled={isPending}
              id="message-user-search"
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setSelectedUser(null);
                setError("");
                setResults([]);
                setIsSearching(Boolean(nextQuery.trim()));
              }}
              placeholder="Tên, username, email hoặc ID..."
              ref={inputRef}
              value={query}
            />
            {isSearching && (
              <LoaderCircle
                aria-label="Đang tìm kiếm"
                className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-[#8f9cff]"
              />
            )}
          </div>

          {results.length > 0 && !selectedUser && (
            <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] p-1">
              {results.map((user) => (
                <li key={user._id}>
                  <button
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[var(--app-hover)]"
                    onClick={() => {
                      setSelectedUser(user);
                      setQuery(user.username);
                      setResults([]);
                      setIsSearching(false);
                    }}
                    type="button"
                  >
                    <UserAvatar
                      className="size-9"
                      fullName={user.fullName}
                      profilePicture={user.profilePicture}
                      username={user.username}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--app-text)]">
                        {user.username}
                      </span>
                      <span className="block truncate text-xs text-[var(--app-muted)]">
                        {user.fullName || "Người dùng Instagram"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedUser && (
            <p className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
              <Check aria-hidden="true" className="size-4" />
              Đã chọn @{selectedUser.username}
            </p>
          )}

          {error && (
            <p
              className="mt-2 text-sm text-red-300"
              id="new-conversation-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5364e8] px-4 text-sm font-bold text-white transition hover:bg-[#6070ef] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !(selectedUser?._id ?? query.trim())}
            type="submit"
          >
            {isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <MessageCirclePlus aria-hidden="true" className="size-4.5" />
            )}
            {isPending ? "Đang tạo..." : "Bắt đầu trò chuyện"}
          </button>
        </form>
      </section>
    </div>
  );
}
