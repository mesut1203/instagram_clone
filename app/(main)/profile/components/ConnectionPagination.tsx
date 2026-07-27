import type { FollowPagination } from "@/app/services/follow.action";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ConnectionPagination({
  basePath,
  pagination,
}: {
  basePath: string;
  pagination: FollowPagination;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, pagination.currentPage - 1);
  const nextPage = pagination.currentPage + 1;

  return (
    <nav
      aria-label="Phân trang danh sách người dùng"
      className="flex items-center justify-between border-t border-[var(--app-border)] px-4 py-4"
    >
      {pagination.currentPage > 1 ? (
        <Link
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
          href={`${basePath}?page=${previousPage}`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Trước
        </Link>
      ) : (
        <span />
      )}

      <span className="text-xs text-[var(--app-subtle)]">
        Trang {pagination.currentPage} / {pagination.totalPages}
      </span>

      {pagination.hasMore ? (
        <Link
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
          href={`${basePath}?page=${nextPage}`}
        >
          Sau
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
