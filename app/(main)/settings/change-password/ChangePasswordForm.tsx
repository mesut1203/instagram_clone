"use client";

import { changePasswordAction } from "@/app/services/auth.action";
import { initialChangePasswordState } from "@/libs/validations/auth";
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

const inputClassName =
  "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-input)] py-3 pr-12 pl-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-subtle)] transition focus:border-[#6879e8] focus:ring-2 focus:ring-[#4154c8]/25 focus:outline-none";

type PasswordFieldProps = {
  autoComplete: string;
  error?: string[];
  label: string;
  name: "confirmPassword" | "currentPassword" | "newPassword";
  placeholder: string;
};

function PasswordField({
  autoComplete,
  error,
  label,
  name,
  placeholder,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-[var(--app-text)]"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="relative">
        <input
          aria-describedby={error?.length ? `${name}-error` : undefined}
          aria-invalid={Boolean(error?.length)}
          autoComplete={autoComplete}
          className={inputClassName}
          id={name}
          name={name}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={isVisible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-2 text-[var(--app-subtle)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      {error?.[0] && (
        <p
          className="mt-1.5 text-xs text-[#f87171]"
          id={`${name}-error`}
          role="alert"
        >
          {error[0]}
        </p>
      )}
    </div>
  );
}

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialChangePasswordState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      ref={formRef}
    >
      <PasswordField
        autoComplete="current-password"
        error={state.errors?.currentPassword}
        label="Mật khẩu hiện tại"
        name="currentPassword"
        placeholder="Nhập mật khẩu hiện tại"
      />
      <PasswordField
        autoComplete="new-password"
        error={state.errors?.newPassword}
        label="Mật khẩu mới"
        name="newPassword"
        placeholder="Tối thiểu 6 ký tự"
      />
      <PasswordField
        autoComplete="new-password"
        error={state.errors?.confirmPassword}
        label="Xác nhận mật khẩu mới"
        name="confirmPassword"
        placeholder="Nhập lại mật khẩu mới"
      />

      <div className="flex gap-3 rounded-2xl border border-[#4154c8]/20 bg-[#4154c8]/10 p-4">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-[#8f9cff]"
        />
        <p className="text-xs leading-5 text-[var(--app-muted)]">
          Nên dùng mật khẩu riêng cho tài khoản này và không chia sẻ mật
          khẩu với bất kỳ ai.
        </p>
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-400/20 bg-emerald-400/10 text-[#86efac]"
              : "border-red-400/20 bg-red-400/10 text-[#fca5a5]"
          }`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4154c8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5367df] disabled:cursor-not-allowed disabled:opacity-65"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        ) : (
          <KeyRound aria-hidden="true" className="size-4" />
        )}
        {isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
