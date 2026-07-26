"use client";

import { registerAction } from "@/app/services/auth.action";
import { initialRegisterState } from "@/libs/validations/auth";
import Link from "next/link";
import { useActionState } from "react";

const inputClassName =
  "w-full rounded-lg border border-neutral-700 bg-[#2b2b2f] px-4 py-2.5 text-sm text-neutral-50 placeholder:text-neutral-300 transition focus:border-[#0095f6] focus:ring-2 focus:ring-[#0095f6]/20 focus:outline-none";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialRegisterState,
  );

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col items-center justify-center">
      <h1 className="select-none font-serif text-4xl font-semibold italic tracking-wide">
        Instagram
      </h1>

      <form action={formAction} className="mt-5 w-full space-y-2" noValidate>
        <input
          aria-label="Username"
          autoComplete="username"
          className={inputClassName}
          id="username"
          name="username"
          placeholder="Username"
          type="text"
        />

        <input
          aria-label="Họ và tên"
          autoComplete="name"
          className={inputClassName}
          id="fullName"
          name="fullName"
          placeholder="Họ và tên"
          type="text"
        />

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
          autoComplete="new-password"
          className={inputClassName}
          id="password"
          name="password"
          placeholder="Mật khẩu"
          type="password"
        />

        <input
          aria-label="Xác minh mật khẩu"
          autoComplete="new-password"
          className={inputClassName}
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Xác minh mật khẩu"
          type="password"
        />

        {state.message && (
          <p
            aria-live="polite"
            className={`px-1 text-left text-sm ${
              state.success ? "text-emerald-400" : "text-red-400"
            }`}
            role={state.success ? "status" : "alert"}
          >
            {state.message}
          </p>
        )}

        <button
          className="mt-1 w-full rounded-lg bg-[#0095f6] py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#1877f2] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#0095f6]/60 disabled:active:scale-100"
          disabled={pending || state.success}
          type="submit"
        >
          {pending
            ? "Đang tạo tài khoản..."
            : state.success
              ? "Đã gửi email xác minh"
              : "Đăng ký"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-400">
        Bạn đã có tài khoản?{" "}
        <Link
          className="font-medium text-blue-500 hover:underline"
          href="/login"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
