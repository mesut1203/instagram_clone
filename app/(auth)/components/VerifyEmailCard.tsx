"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type VerificationStatus = "waiting" | "verifying" | "success" | "error";

type EmailActionState = {
  success: boolean;
  message: string;
};

type VerifyEmailCardProps = {
  resendVerificationEmailAction: () => Promise<EmailActionState>;
  token?: string;
  verifyEmailAction: (token: string) => Promise<EmailActionState>;
};

export default function VerifyEmailCard({
  resendVerificationEmailAction,
  token,
  verifyEmailAction,
}: VerifyEmailCardProps) {
  const [status, setStatus] = useState<VerificationStatus>(
    token ? "verifying" : "waiting",
  );
  const [message, setMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendSucceeded, setResendSucceeded] = useState<boolean | null>(null);
  const [isResending, setIsResending] = useState(false);
  const attemptedToken = useRef<string | null>(null);

  const verifyEmail = useCallback(
    async (isRetry = false) => {
      if (!token) {
        return;
      }

      if (isRetry) {
        setStatus("verifying");
        setMessage("");
      }

      try {
        const result: EmailActionState = await verifyEmailAction(token);
        setStatus(result.success ? "success" : "error");
        setMessage(result.message);
      } catch {
        setStatus("error");
        setMessage("Không thể xác minh email. Vui lòng thử lại sau.");
      }
    },
    [token, verifyEmailAction],
  );

  useEffect(() => {
    if (!token || attemptedToken.current === token) {
      return;
    }

    attemptedToken.current = token;
    void verifyEmail();
  }, [token, verifyEmail]);

  const resendVerificationEmail = async () => {
    setIsResending(true);
    setResendMessage("");
    setResendSucceeded(null);

    try {
      const result: EmailActionState = await resendVerificationEmailAction();
      setResendSucceeded(result.success);
      setResendMessage(
        result.success
          ? "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư."
          : result.message,
      );
    } catch {
      setResendSucceeded(false);
      setResendMessage("Không thể gửi lại email xác minh. Vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-xl border border-neutral-800 bg-[#16161a] p-7 text-center shadow-2xl shadow-black/30 sm:p-9">
      <h1 className="select-none font-serif text-4xl font-semibold italic tracking-wide">
        Instagram
      </h1>

      {status === "waiting" && (
        <>
          <h2 className="mt-6 text-2xl font-semibold">
            Kiểm tra email của bạn
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Tài khoản đã được tạo. Chúng tôi đã gửi một liên kết xác minh đến
            email của bạn.
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Mở liên kết trong email để hoàn tất việc xác minh.
          </p>
          <button
            className="mt-6 inline-flex rounded-lg bg-[#0095f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1877f2] focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:ring-offset-2 focus:ring-offset-[#16161a] disabled:cursor-not-allowed disabled:bg-[#0095f6]/60"
            disabled={isResending}
            onClick={() => void resendVerificationEmail()}
            type="button"
          >
            {isResending ? "Đang gửi..." : "Gửi lại email xác minh"}
          </button>
          {resendMessage && (
            <p
              aria-live="polite"
              className={`mt-3 text-sm ${
                resendSucceeded ? "text-emerald-400" : "text-red-400"
              }`}
              role={resendSucceeded ? "status" : "alert"}
            >
              {resendMessage}
            </p>
          )}
        </>
      )}

      {status === "verifying" && (
        <>
          <h2 className="mt-6 text-2xl font-semibold">Đang xác minh email</h2>
          <p
            aria-live="polite"
            className="mt-3 text-sm leading-6 text-neutral-400"
          >
            Vui lòng chờ trong giây lát...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <h2 className="mt-6 text-2xl font-semibold">
            Email đã được xác minh
          </h2>
          <p
            aria-live="polite"
            className="mt-3 text-sm leading-6 text-neutral-400"
          >
            {message}
          </p>
          <Link
            className="mt-6 inline-flex rounded-lg bg-[#0095f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1877f2] focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:ring-offset-2 focus:ring-offset-[#16161a]"
            href="/login"
          >
            Đăng nhập
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h2 className="mt-6 text-2xl font-semibold">
            Không thể xác minh email
          </h2>
          <p
            aria-live="assertive"
            className="mt-3 text-sm leading-6 text-neutral-400"
          >
            {message}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              className="rounded-lg bg-[#0095f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1877f2] focus:outline-none focus:ring-2 focus:ring-[#0095f6] focus:ring-offset-2 focus:ring-offset-[#16161a]"
              onClick={() => void verifyEmail(true)}
              type="button"
            >
              Thử lại
            </button>
            <Link
              className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-[#16161a]"
              href="/register"
            >
              Đăng ký lại
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
