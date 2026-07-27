import "server-only";

import { cookies } from "next/headers";

export type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

export type ApiResult<T> =
  | {
      data: T;
      message: string;
      status: number;
      success: true;
    }
  | {
      message: string;
      status: number;
      success: false;
    };

type ApiRequestOptions = {
  auth?: boolean | "optional";
};

const fallbackApiUrl = "https://instagram-api.unicode.vn";

export function getApiBaseUrl() {
  return (
    process.env.SERVER_API ??
    process.env.NEXT_PUBLIC_SERVER_API ??
    fallbackApiUrl
  ).replace(/\/+$/, "");
}

function getPublicAssetBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SERVER_API ??
    process.env.SERVER_API ??
    fallbackApiUrl
  ).replace(/\/+$/, "");
}

export function resolveApiAssetUrl(value?: string | null) {
  const path = value?.trim();

  if (!path) {
    return null;
  }

  try {
    const url = new URL(path, `${getPublicAssetBaseUrl()}/`);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);

  if (options.auth) {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken && options.auth === true) {
      return {
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        status: 401,
        success: false,
      };
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...init,
        cache: init.cache ?? "no-store",
        headers,
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | ApiEnvelope<T>
      | null;

    if (!response.ok || payload?.success === false) {
      return {
        message:
          payload?.message ??
          (response.status === 401
            ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            : "Yêu cầu không thành công. Vui lòng thử lại."),
        status: response.status,
        success: false,
      };
    }

    return {
      data: (payload?.data ?? null) as T,
      message: payload?.message ?? "Thao tác thành công.",
      status: response.status,
      success: true,
    };
  } catch {
    return {
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      status: 0,
      success: false,
    };
  }
}
