"use client";

import { loginAction } from "@/app/services/auth.action";
import Link from "next/link";

export default function LoginForm() {
  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center justify-center">
      <h1 className="mb-8 select-none font-serif text-4xl font-semibold italic tracking-wide">
        Instagram
      </h1>

      <form className="w-full space-y-3" action={loginAction}>
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-700 bg-[#2b2b2f] px-4 py-3 text-sm text-neutral-50 placeholder:text-neutral-300 transition focus:border-[#0095f6] focus:ring-2 focus:ring-[#0095f6]/20 focus:outline-none"
            name="email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full rounded-lg border border-neutral-700 bg-[#2b2b2f] px-4 py-3 text-sm text-neutral-50 placeholder:text-neutral-300 transition focus:border-[#0095f6] focus:ring-2 focus:ring-[#0095f6]/20 focus:outline-none"
            name="password"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-[#0095f6] py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#1877f2] active:scale-[0.99]"
        >
          Đăng nhập
        </button>
      </form>

      <div className="my-6 flex w-full items-center">
        <div className="h-px flex-1 bg-neutral-700" />
        <span className="px-4 text-xs font-semibold tracking-wider text-neutral-400">
          HOẶC
        </span>
        <div className="h-px flex-1 bg-neutral-700" />
      </div>

      <div className="flex w-full flex-col items-center space-y-4">
        <button
          type="button"
          className="flex items-center space-x-2 text-sm font-semibold text-[#0095f6] transition hover:text-[#4db5ff]"
        >
          <span
            aria-hidden="true"
            className="flex size-5 items-center justify-center rounded-full bg-[#0095f6] text-sm font-bold text-white"
          >
            f
          </span>
          <span>Đăng nhập bằng Facebook</span>
        </button>

        <Link href="#" className="text-xs text-neutral-400 hover:underline">
          Quên mật khẩu?
        </Link>

        <div className="w-full border-t border-neutral-900 pt-4 text-center text-sm text-neutral-400">
          Bạn chưa có tài khoản?{" "}
          <Link href="#" className="font-medium text-blue-500 hover:underline">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
