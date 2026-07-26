"use client";

import { requestPasswordResetAction } from "@/app/services/auth.action";
import { initialForgotPasswordState } from "@/libs/validations/auth";
import Link from "next/link";
import { useActionState } from "react";

const inputClassName =
  "w-full rounded-md border border-white/5 bg-[#282b31] px-4 py-3 text-lg text-white placeholder:text-[#9eafc3] transition focus:border-[#4154c8] focus:ring-2 focus:ring-[#4154c8]/35 focus:outline-none";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialForgotPasswordState,
  );

  return (
    <section className="w-full max-w-[660px] rounded-2xl bg-black px-6 py-14 shadow-2xl shadow-black/50 sm:px-[118px] sm:py-16">
      <h1 className="text-center text-[28px] leading-9 font-bold text-white">
        Quên mật khẩu
      </h1>

      <form action={formAction} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            aria-describedby={state.errors?.email ? "email-error" : undefined}
            aria-invalid={Boolean(state.errors?.email)}
            autoComplete="email"
            className={inputClassName}
            defaultValue={state.values?.email}
            id="email"
            name="email"
            placeholder="Email"
            required
            type="email"
          />
          {state.errors?.email?.[0] && (
            <p className="mt-2 text-sm text-red-400" id="email-error" role="alert">
              {state.errors.email[0]}
            </p>
          )}
        </div>

        <button
          className="w-full rounded-2xl bg-[#4154c8] py-3 text-xl font-bold text-white transition hover:bg-[#4c60d4] focus:outline-none focus:ring-2 focus:ring-[#7182ed] focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:bg-[#4154c8]/60"
          disabled={pending || state.success}
          type="submit"
        >
          {pending
            ? "Đang gửi..."
            : state.success
              ? "Đã gửi email reset"
              : "Gửi email reset"}
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
        className="mt-8 block text-center text-xl text-[#1688ff] transition hover:text-[#53a8ff] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1688ff] focus:ring-offset-2 focus:ring-offset-black"
        href="/login"
      >
        Quay lại đăng nhập
      </Link>
    </section>
  );
}
