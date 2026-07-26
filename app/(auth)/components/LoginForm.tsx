"use client";

import { loginAction } from "@/app/services/auth.action";
import { initialLoginState } from "@/libs/validations/auth";
import Link from "next/link";
import { useActionState } from "react";

const inputClassName =
  "w-full rounded-lg border border-neutral-700 bg-[#2b2b2f] px-4 py-2.5 text-sm text-neutral-50 placeholder:text-neutral-300 transition focus:border-[#0095f6] focus:ring-2 focus:ring-[#0095f6]/20 focus:outline-none";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center justify-center">
      <h1 className="mb-6 select-none font-serif text-4xl font-semibold italic tracking-wide">
        Instagram
      </h1>

      <form action={formAction} className="w-full space-y-2.5" noValidate>
        <input
          aria-label="Email"
          autoComplete="email"
          className={inputClassName}
          id="email"
          name="email"
          placeholder="Email"
          type="email"
        />

        <input
          aria-label="Mật khẩu"
          autoComplete="current-password"
          className={inputClassName}
          id="password"
          name="password"
          placeholder="Mật khẩu"
          type="password"
        />

        {state.message && !state.success && (
          <p
            aria-live="polite"
            className="px-1 text-left text-sm text-red-400"
            role="alert"
          >
            {state.message}
          </p>
        )}

        <button
          className="mt-1 w-full rounded-lg bg-[#0095f6] py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#1877f2] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#0095f6]/60 disabled:active:scale-100"
          disabled={pending}
          type="submit"
        >
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="my-5 flex w-full items-center">
        <div className="h-px flex-1 bg-neutral-700" />
        <span className="px-4 text-xs font-semibold tracking-wider text-neutral-400">
          HOẶC
        </span>
        <div className="h-px flex-1 bg-neutral-700" />
      </div>

      <div className="flex w-full flex-col items-center space-y-4">
        <button
          className="flex items-center space-x-2 text-sm font-semibold text-[#0095f6] transition hover:text-[#4db5ff]"
          type="button"
        >
          <span
            aria-hidden="true"
            className="flex size-5 items-center justify-center rounded-full bg-[#0095f6] text-sm font-bold text-white"
          >
            f
          </span>
          <span>Đăng nhập bằng Facebook</span>
        </button>

        <Link href="/forgot-password" className="text-xs text-neutral-400 hover:underline">
          Quên mật khẩu?
        </Link>

        <div className="w-full border-t border-neutral-900 pt-4 text-center text-sm text-neutral-400">
          Bạn chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-blue-500 hover:underline">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
