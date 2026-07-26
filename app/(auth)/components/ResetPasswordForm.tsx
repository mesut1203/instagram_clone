"use client";

import { resetPasswordAction } from "@/app/services/auth.action";
import { initialResetPasswordState } from "@/libs/validations/auth";
import Link from "next/link";
import { useActionState } from "react";

type ResetPasswordFormProps = {
  token: string;
};

const inputClassName =
  "w-full rounded-md border border-white/5 bg-[#282b31] px-4 py-3 text-base text-white placeholder:text-[#9eafc3] transition focus:border-[#4154c8] focus:ring-2 focus:ring-[#4154c8]/35 focus:outline-none";

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPasswordWithToken = resetPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(
    resetPasswordWithToken,
    initialResetPasswordState,
  );

  return (
    <section className="w-full max-w-[500px] rounded-2xl bg-black px-6 py-12 shadow-2xl shadow-black/50 sm:px-12">
      <h1 className="text-center text-[28px] leading-9 font-bold text-white">
        Đặt lại mật khẩu
      </h1>
      <p className="mt-3 text-center text-sm leading-6 text-[#9eafc3]">
        Tạo mật khẩu mới cho tài khoản của bạn.
      </p>

      <form action={formAction} className="mt-7 space-y-4" noValidate>
        <div>
          <label className="sr-only" htmlFor="password">
            Mật khẩu mới
          </label>
          <input
            aria-describedby={state.errors?.password ? "password-error" : undefined}
            aria-invalid={Boolean(state.errors?.password)}
            autoComplete="new-password"
            className={inputClassName}
            id="password"
            name="password"
            placeholder="Mật khẩu mới"
            required
            type="password"
          />
          {state.errors?.password?.[0] && (
            <p className="mt-2 text-sm text-red-400" id="password-error" role="alert">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        <div>
          <label className="sr-only" htmlFor="confirmPassword">
            Xác nhận mật khẩu mới
          </label>
          <input
            aria-describedby={
              state.errors?.confirmPassword ? "confirm-password-error" : undefined
            }
            aria-invalid={Boolean(state.errors?.confirmPassword)}
            autoComplete="new-password"
            className={inputClassName}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu mới"
            required
            type="password"
          />
          {state.errors?.confirmPassword?.[0] && (
            <p
              className="mt-2 text-sm text-red-400"
              id="confirm-password-error"
              role="alert"
            >
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        <button
          className="w-full rounded-2xl bg-[#4154c8] py-3 text-lg font-bold text-white transition hover:bg-[#4c60d4] focus:outline-none focus:ring-2 focus:ring-[#7182ed] focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:bg-[#4154c8]/60"
          disabled={pending || state.success}
          type="submit"
        >
          {pending
            ? "Đang cập nhật..."
            : state.success
              ? "Đã đặt lại mật khẩu"
              : "Đặt lại mật khẩu"}
        </button>

        {state.message && (
          <p
            aria-live="polite"
            className={`text-center text-sm ${
              state.success ? "text-emerald-400" : "text-red-400"
            }`}
            role={state.success ? "status" : "alert"}
          >
            {state.message}
          </p>
        )}
      </form>

      <Link
        className="mt-7 block text-center text-base text-[#1688ff] transition hover:text-[#53a8ff] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1688ff] focus:ring-offset-2 focus:ring-offset-black"
        href="/login"
      >
        Quay lại đăng nhập
      </Link>
    </section>
  );
}
