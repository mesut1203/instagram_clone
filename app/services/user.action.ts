"use server";

import {
  getAccessToken,
  getCurrentUser,
} from "@/app/services/auth.action";
import { revalidatePath } from "next/cache";

export type Gender = "female" | "male" | "other";

export type UserSummary = {
  _id: string;
  bio?: string | null;
  email?: string | null;
  followersCount?: number;
  followingCount?: number;
  fullName?: string | null;
  isFollowing?: boolean;
  postsCount?: number;
  profilePicture?: string | null;
  recentImages?: string[];
  username: string;
  website?: string | null;
};

export type UserProfile = UserSummary & {
  createdAt?: string;
  gender?: Gender | null;
  isVerified?: boolean;
};

export type ServiceResult<T> =
  | {
      data: T;
      message?: string;
      success: true;
    }
  | {
      message: string;
      success: false;
    };

export type FormActionState = {
  errors?: Record<string, string[]>;
  message: string;
  success: boolean;
};

type ApiResponse<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

type AuthMode = "none" | "optional" | "required";

const connectionError =
  "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";

function getApiBaseUrl() {
  return (
    process.env.SERVER_API ?? process.env.NEXT_PUBLIC_SERVER_API ?? ""
  ).replace(/\/+$/, "");
}

async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  authMode: AuthMode = "none",
): Promise<ServiceResult<T>> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return {
      success: false,
      message: "Chưa cấu hình địa chỉ API.",
    };
  }

  const accessToken =
    authMode === "none" ? undefined : await getAccessToken();

  if (authMode === "required" && !accessToken) {
    return {
      success: false,
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
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
      message: connectionError,
    };
  }
}

async function requestMutation(
  path: string,
  init: RequestInit,
): Promise<FormActionState> {
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
      | ApiResponse<unknown>
      | null;

    if (!response.ok || payload?.success === false) {
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
      message: payload?.message ?? "Cập nhật thành công.",
    };
  } catch {
    return {
      success: false,
      message: connectionError,
    };
  }
}

function normalizeUser(user: Partial<UserProfile>): UserProfile | null {
  if (!user._id || !user.username) {
    return null;
  }

  return {
    ...user,
    _id: user._id,
    username: user.username,
  };
}

export async function getOwnProfile(): Promise<ServiceResult<UserProfile>> {
  try {
    const currentUser = (await getCurrentUser()) as
      | Partial<UserProfile>
      | null
      | undefined;
    const user = currentUser ? normalizeUser(currentUser) : null;

    if (!user) {
      return {
        success: false,
        message: "Không thể tải thông tin tài khoản.",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch {
    return {
      success: false,
      message: connectionError,
    };
  }
}

export async function getUserById(
  userId: string,
): Promise<ServiceResult<UserProfile>> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    return {
      success: false,
      message: "Người dùng không hợp lệ.",
    };
  }

  return requestApi<UserProfile>(
    `/api/users/${encodeURIComponent(normalizedUserId)}`,
    {},
    "optional",
  );
}

export async function searchUsers(
  query: string,
): Promise<ServiceResult<UserSummary[]>> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      success: true,
      data: [],
    };
  }

  return requestApi<UserSummary[]>(
    `/api/users/search?q=${encodeURIComponent(normalizedQuery)}`,
  );
}

export async function getSuggestedUsers(
  limit = 8,
): Promise<ServiceResult<UserSummary[]>> {
  const safeLimit = Math.min(20, Math.max(1, Math.floor(limit)));

  return requestApi<UserSummary[]>(
    `/api/users/suggested?limit=${safeLimit}`,
    {},
    "required",
  );
}

export async function updateProfileAction(
  _previousState: FormActionState,
  incomingFormData: FormData,
): Promise<FormActionState> {
  const fullName = String(incomingFormData.get("fullName") ?? "").trim();
  const bio = String(incomingFormData.get("bio") ?? "").trim();
  const website = String(incomingFormData.get("website") ?? "").trim();
  const gender = String(incomingFormData.get("gender") ?? "").trim();
  const profilePicture = incomingFormData.get("profilePicture");
  const errors: Record<string, string[]> = {};

  if (!fullName) {
    errors.fullName = ["Họ tên không được để trống."];
  } else if (fullName.length > 100) {
    errors.fullName = ["Họ tên không được vượt quá 100 ký tự."];
  }

  if (bio.length > 150) {
    errors.bio = ["Tiểu sử không được vượt quá 150 ký tự."];
  }

  if (website) {
    try {
      const parsedWebsite = new URL(website);
      if (!["http:", "https:"].includes(parsedWebsite.protocol)) {
        errors.website = ["Website phải bắt đầu bằng http:// hoặc https://."];
      }
    } catch {
      errors.website = ["Địa chỉ website không hợp lệ."];
    }
  }

  if (gender && !["female", "male", "other"].includes(gender)) {
    errors.gender = ["Giới tính không hợp lệ."];
  }

  if (profilePicture instanceof File && profilePicture.size > 0) {
    const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];
    if (!acceptedTypes.includes(profilePicture.type)) {
      errors.profilePicture = ["Chỉ chấp nhận ảnh JPG, PNG hoặc GIF."];
    } else if (profilePicture.size > 5 * 1024 * 1024) {
      errors.profilePicture = ["Ảnh đại diện không được vượt quá 5 MB."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      errors,
    };
  }

  const formData = new FormData();
  formData.set("fullName", fullName);
  formData.set("bio", bio);
  formData.set("website", website);
  if (gender) {
    formData.set("gender", gender);
  }
  if (profilePicture instanceof File && profilePicture.size > 0) {
    formData.set("profilePicture", profilePicture);
  }

  const result = await requestMutation("/api/users/profile", {
    method: "PATCH",
    body: formData,
  });

  if (result.success) {
    revalidatePath("/profile");
    revalidatePath("/profile/edit");
  }

  return {
    ...result,
    message: result.success
      ? "Trang cá nhân đã được cập nhật."
      : result.message,
  };
}

export async function deleteProfilePictureAction(): Promise<FormActionState> {
  const result = await requestMutation("/api/users/profile/picture", {
    method: "DELETE",
  });

  if (result.success) {
    revalidatePath("/profile");
    revalidatePath("/profile/edit");
  }

  return {
    ...result,
    message: result.success
      ? "Đã xóa ảnh đại diện."
      : result.message,
  };
}
