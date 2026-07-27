"use server";

import { getAccessToken } from "@/app/services/auth.action";
import type {
  FormActionState,
  ServiceResult,
  UserSummary,
} from "@/app/services/user.action";
import { revalidatePath } from "next/cache";

export type SearchHistoryItem = {
  _id: string;
  createdAt: string;
  searchQuery: string;
  searchedUser?: UserSummary | null;
  searchedUserId?: string;
  userId?: string;
};

type ApiResponse<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

function getApiBaseUrl() {
  return (
    process.env.SERVER_API ?? process.env.NEXT_PUBLIC_SERVER_API ?? ""
  ).replace(/\/+$/, "");
}

async function requestSearchHistory<T>(
  path: string,
  init: RequestInit = {},
): Promise<ServiceResult<T>> {
  const baseUrl = getApiBaseUrl();
  const accessToken = await getAccessToken();

  if (!baseUrl) {
    return {
      success: false,
      message: "Chưa cấu hình địa chỉ API.",
    };
  }

  if (!accessToken) {
    return {
      success: false,
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers,
    });
    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<T>
      | null;

    if (!response.ok || payload?.success === false || payload?.data === undefined) {
      return {
        success: false,
        message:
          payload?.message ??
          (response.status === 401
            ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            : "Yêu cầu không thành công. Vui lòng thử lại."),
      };
    }

    return {
      success: true,
      data: payload.data,
      message: payload.message,
    };
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
    };
  }
}

async function searchHistoryMutation(
  path: string,
  init: RequestInit,
): Promise<FormActionState> {
  const result = await requestSearchHistory<null>(path, init);

  if (result.success) {
    revalidatePath("/search");
    return {
      success: true,
      message: result.message ?? "Đã cập nhật lịch sử tìm kiếm.",
    };
  }

  return result;
}

export async function getSearchHistory(
  limit = 20,
): Promise<ServiceResult<SearchHistoryItem[]>> {
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  return requestSearchHistory<SearchHistoryItem[]>(
    `/api/search-history?limit=${safeLimit}`,
  );
}

export async function addSearchHistory(
  searchedUserId: string,
  searchQuery: string,
): Promise<FormActionState> {
  const normalizedUserId = searchedUserId.trim();
  const normalizedQuery = searchQuery.trim();

  if (!normalizedUserId || !normalizedQuery) {
    return {
      success: false,
      message: "Kết quả tìm kiếm không hợp lệ.",
    };
  }

  const result = await requestSearchHistory<SearchHistoryItem>(
    "/api/search-history",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        searchedUserId: normalizedUserId,
        searchQuery: normalizedQuery,
      }),
    },
  );

  if (result.success) {
    revalidatePath("/search");
    return {
      success: true,
      message: result.message ?? "Đã lưu lịch sử tìm kiếm.",
    };
  }

  return result;
}

export async function deleteSearchHistoryItem(historyId: string) {
  const normalizedHistoryId = historyId.trim();

  if (!normalizedHistoryId) {
    return {
      success: false,
      message: "Mục lịch sử không hợp lệ.",
    };
  }

  return searchHistoryMutation(
    `/api/search-history/${encodeURIComponent(normalizedHistoryId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function clearSearchHistory() {
  return searchHistoryMutation("/api/search-history", {
    method: "DELETE",
  });
}
