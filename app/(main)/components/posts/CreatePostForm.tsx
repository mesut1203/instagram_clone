"use client";

import {
  createPostAction,
  type PostFormState,
} from "@/app/services/post.action";
import {
  Image as ImageIcon,
  LoaderCircle,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

const initialState: PostFormState = {
  message: "",
  success: false,
};

type Preview = {
  kind: "image" | "video";
  name: string;
  url: string;
};

type CreatePostFormProps = {
  onCancel?: () => void;
  onCreated?: () => void;
  onPendingChange?: (isPending: boolean) => void;
  variant?: "modal" | "page";
};

export default function CreatePostForm({
  onCancel,
  onCreated,
  onPendingChange,
  variant = "page",
}: CreatePostFormProps) {
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState,
  );
  const [preview, setPreview] = useState<Preview | null>(null);
  const [clientError, setClientError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handledSuccessRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    if (!state.success || handledSuccessRef.current) {
      return;
    }

    handledSuccessRef.current = true;

    if (onCreated) {
      onCreated();
      return;
    }

    router.replace("/");
    router.refresh();
  }, [onCreated, router, state.success]);

  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    },
    [preview],
  );

  function openFilePicker() {
    if (!isPending) {
      fileInputRef.current?.click();
    }
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (preview) {
      URL.revokeObjectURL(preview.url);
    }

    if (!file) {
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      event.target.value = "";
      setPreview(null);
      setClientError("Định dạng tệp không được hỗ trợ.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      event.target.value = "";
      setPreview(null);
      setClientError("Tệp tải lên không được vượt quá 50MB.");
      return;
    }

    setClientError("");
    setPreview({
      kind: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
      url: URL.createObjectURL(file),
    });
  }

  function cancel() {
    if (isPending) {
      return;
    }

    if (onCancel) {
      onCancel();
      return;
    }

    router.back();
  }

  const statusMessage = clientError || state.message;
  const isError = Boolean(clientError) || (Boolean(state.message) && !state.success);

  return (
    <form
      action={formAction}
      className={
        variant === "modal"
          ? "flex min-h-0 flex-1 flex-col"
          : "flex min-h-[min(760px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-background-elevated)] shadow-xl shadow-black/5"
      }
      onSubmitCapture={() => onPendingChange?.(true)}
    >
      {variant === "page" && (
        <header className="border-b border-[var(--app-border)] px-5 py-4 text-center">
          <h1 className="text-xl font-bold text-[var(--app-text)]">
            Tạo bài viết mới
          </h1>
        </header>
      )}

      <input
        accept="image/*,video/*"
        className="sr-only"
        id={`post-file-${variant}`}
        name="file"
        onChange={selectFile}
        ref={fileInputRef}
        required
        tabIndex={-1}
        type="file"
      />

      <section
        aria-label={preview ? "Xem trước nội dung bài viết" : "Chọn nội dung bài viết"}
        className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden ${
          preview
            ? "bg-[var(--app-input)]"
            : "bg-[var(--app-background-elevated)]"
        }`}
      >
        {preview ? (
          <>
            {preview.kind === "video" ? (
              <video
                aria-label={`Xem trước ${preview.name}`}
                className="max-h-full max-w-full object-contain"
                controls
                src={preview.url}
              />
            ) : (
              // The preview is a local object URL and cannot use next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`Xem trước ${preview.name}`}
                className="max-h-full max-w-full object-contain"
                src={preview.url}
              />
            )}

            <button
              className="absolute top-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={openFilePicker}
              type="button"
            >
              Thay đổi
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center px-6 py-12 text-center">
            <div
              aria-hidden="true"
              className="flex items-center gap-3 text-[var(--app-text)]"
            >
              <ImageIcon className="size-14" strokeWidth={1.8} />
              <Video className="size-14" strokeWidth={1.8} />
            </div>
            <p className="mt-8 text-xl font-normal text-[var(--app-text)] sm:text-2xl">
              Tải ảnh và video vào đây
            </p>
            <button
              className="mt-8 rounded-xl bg-[#4b5cff] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4051e8] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-input)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              data-dialog-initial-focus={variant === "modal" ? "" : undefined}
              disabled={isPending}
              onClick={openFilePicker}
              type="button"
            >
              Chọn từ máy tính
            </button>
            {statusMessage && (
              <p
                aria-live="polite"
                className={`mt-5 max-w-md rounded-lg px-4 py-2 text-sm ${
                  isError
                    ? "bg-[#ed4956]/10 text-[#ed4956]"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
                role="status"
              >
                {statusMessage}
              </p>
            )}
          </div>
        )}
      </section>

      {preview && (
        <footer className="border-t border-[var(--app-border)] bg-[var(--app-background-elevated)]">
          {statusMessage && (
            <p
              aria-live="polite"
              className={`border-b border-[var(--app-border)] px-5 py-2.5 text-sm ${
                isError ? "text-[#ed4956]" : "text-emerald-600"
              }`}
              role="status"
            >
              {statusMessage}
            </p>
          )}

          <div className="flex min-h-20 items-center gap-3 px-4 sm:px-5">
            <label className="sr-only" htmlFor={`caption-${variant}`}>
              Chú thích
            </label>
            <textarea
              className="max-h-24 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-1 py-3 text-sm leading-5 text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              disabled={isPending}
              id={`caption-${variant}`}
              maxLength={2200}
              name="caption"
              placeholder="Viết chú thích..."
              rows={1}
            />
            <button
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)] focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              disabled={isPending}
              onClick={cancel}
              type="button"
            >
              Hủy
            </button>
            <button
              className="inline-flex min-w-16 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#4b5cff] transition hover:bg-[#4b5cff]/10 focus-visible:ring-2 focus-visible:ring-[#8f9cff] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
              disabled={isPending}
              type="submit"
            >
              {isPending && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              )}
              {isPending ? "Đang đăng" : "Đăng"}
            </button>
          </div>
        </footer>
      )}
    </form>
  );
}
