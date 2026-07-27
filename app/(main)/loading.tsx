export default function MainLoading() {
  return (
    <main
      aria-label="Đang tải nội dung"
      className="mx-auto w-full max-w-[680px] animate-pulse px-4 py-8 sm:px-6 lg:py-10"
    >
      <div className="h-4 w-32 rounded-full bg-[var(--app-skeleton)]" />
      <div className="mt-3 h-8 w-56 rounded-lg bg-[var(--app-skeleton-strong)]" />

      <div className="mt-7 space-y-5">
        {[0, 1].map((item) => (
          <div
            className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)]"
            key={item}
          >
            <div className="flex items-center gap-3 p-4">
              <div className="size-10 rounded-full bg-[var(--app-skeleton-strong)]" />
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-[var(--app-skeleton-strong)]" />
                <div className="h-2.5 w-40 rounded bg-[var(--app-skeleton)]" />
              </div>
            </div>
            <div className="aspect-square w-full bg-[var(--app-skeleton)]" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-40 rounded bg-[var(--app-skeleton-strong)]" />
              <div className="h-3 w-full rounded bg-[var(--app-skeleton)]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
