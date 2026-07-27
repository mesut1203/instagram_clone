"use server";

import { getAccessToken } from "@/app/services/auth.action";
import type {
  FormActionState,
  ServiceResult,
  UserSummary,
} from "@/app/services/user.action";
import { revalidatePath } from "next/cache";

export type FollowPagination = {
  currentPage: number;
  hasMore: boolean;
  totalFollowers?: number;
  totalFollowing?: number;
  totalPages: number;
};

export type FollowListResult = {
  pagination: FollowPagination;
  users: UserSummary[];
};

type FollowListApiData = {
  followers?: UserSummary[];
  following?: UserSummary[];
  pagination?: FollowPagination;
};

type ApiResponse<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

const emptyPagination: FollowPagination = {
  currentPage: 1,
  hasMore: false,
  totalPages: 0,
};

function getApiBaseUrl() {
  return (
    process.env.SERVER_API ?? process.env.NEXT_PUBLIC_SERVER_API ?? ""
  ).replace(/\/+$/, "");
}

async function followRequest(
  userId: string,
  method: "DELETE" | "POST",
): Promise<FormActionState> {
  const normalizedUserId = userId.trim();
  const baseUrl = getApiBaseUrl();
  const accessToken = await getAccessToken();

  if (!normalizedUserId) {
    return {
      success: false,
      message: "Người dùng không hợp lệ.",
    };
  }

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

  try {
    const response = await fetch(
      `${baseUrl}/api/follow/${encodeURIComponent(normalizedUserId)}/follow`,
      {
        method,
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<null>
      | null;

    if (!response.ok || payload?.success === false) {
      return {
        success: false,
        message:
          payload?.message ??
          (response.status === 401
            ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            : "Không thể cập nhật trạng thái theo dõi."),
      };
    }

    revalidatePath("/profile");
    revalidatePath(`/profile/${normalizedUserId}`);

    return {
      success: true,
      message:
        payload?.message ??
        (method === "POST"
          ? "Đã theo dõi người dùng."
          : "Đã bỏ theo dõi người dùng."),
    };
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
    };
  }
}

async function getFollowList(
  userId: string,
  kind: "followers" | "following",
  page = 1,
  limit = 20,
): Promise<ServiceResult<FollowListResult>> {
  const normalizedUserId = userId.trim();
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const baseUrl = getApiBaseUrl();

  if (!normalizedUserId) {
    return {
      success: false,
      message: "Người dùng không hợp lệ.",
    };
  }

  if (!baseUrl) {
    return {
      success: false,
      message: "Chưa cấu hình địa chỉ API.",
    };
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/follow/${encodeURIComponent(normalizedUserId)}/${kind}?page=${safePage}&limit=${safeLimit}`,
      {
        cache: "no-store",
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<FollowListApiData>
      | null;

    if (!response.ok || payload?.success === false || !payload?.data) {
      return {
        success: false,
        message:
          payload?.message ?? "Không thể tải danh sách người dùng.",
      };
    }

    return {
      success: true,
      data: {
        pagination: payload.data.pagination ?? emptyPagination,
        users:
          kind === "followers"
            ? payload.data.followers ?? []
            : payload.data.following ?? [],
      },
      message: payload.message,
    };
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
    };
  }
}

export async function followUser(userId: string) {
  return followRequest(userId, "POST");
}

export async function unfollowUser(userId: string) {
  return followRequest(userId, "DELETE");
}

export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20,
) {
  return getFollowList(userId, "followers", page, limit);
}

export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20,
) {
  return getFollowList(userId, "following", page, limit);
}
