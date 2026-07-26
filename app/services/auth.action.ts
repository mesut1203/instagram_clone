"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordActionState,
  type LoginActionState,
  type RegisterActionState,
  type ResetPasswordActionState,
} from "@/libs/validations/auth";

type LoginApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };
};

export const loginAction = async (
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin đăng nhập.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      values: { email },
    };
  }

  const data = (await response.json().catch(() => null)) as
    | LoginApiResponse
    | null;
  const accessToken = data?.data?.tokens?.accessToken;
  const refreshToken = data?.data?.tokens?.refreshToken;

  if (!response.ok || !data?.success || !accessToken || !refreshToken) {
    return {
      success: false,
      message: data?.message ?? "Email hoặc mật khẩu không đúng.",
      values: { email },
    };
  }

  const cookiesStore = await cookies();
  cookiesStore.set(`accessToken`, accessToken, {
    httpOnly: true,
    maxAge: 3600,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  cookiesStore.set(`refreshToken`, refreshToken, {
    httpOnly: true,
    maxAge: 3600,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
};

type RegisterApiResponse = {
  success: boolean;
  message?: string;
};

export const requestPasswordResetAction = async (
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> => {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại địa chỉ email.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      values: { email },
    };
  }

  const data = (await response.json().catch(() => null)) as
    | RegisterApiResponse
    | null;

  if (!response.ok || !data?.success) {
    return {
      success: false,
      message: data?.message ?? "Không thể gửi email đặt lại mật khẩu.",
      values: { email },
    };
  }

  return {
    success: true,
    message:
      data.message ?? "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.",
  };
};

export const resetPasswordAction = async (
  token: string,
  _prevState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> => {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return {
      success: false,
      message: "Liên kết đặt lại mật khẩu không hợp lệ.",
    };
  }

  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại mật khẩu mới.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password, confirmPassword } = validatedFields.data;

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/reset-password/${encodeURIComponent(normalizedToken)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
      },
    );
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
    };
  }

  const data = (await response.json().catch(() => null)) as
    | RegisterApiResponse
    | null;

  if (!response.ok || !data?.success) {
    return {
      success: false,
      message:
        data?.message ??
        "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.",
    };
  }

  return {
    success: true,
    message: data.message ?? "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.",
  };
};

type VerifyEmailActionState = {
  success: boolean;
  message: string;
};

type ResendVerificationEmailActionState = {
  success: boolean;
  message: string;
};

export const registerAction = async (
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  const validatedFields = registerSchema.safeParse({
    username: formData.get("username"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin đăng ký.",
    };
  }

  const { username, fullName, email, password, confirmPassword } =
    validatedFields.data;

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword,
          fullName,
        }),
      },
    );
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
    };
  }

  const data = (await response.json().catch(() => null)) as
    | RegisterApiResponse
    | null;

  if (!response.ok || !data?.success) {
    return {
      success: false,
      message: data?.message ?? "Không thể tạo tài khoản. Vui lòng thử lại.",
    };
  }

  const cookiesStore = await cookies();
  cookiesStore.set("pendingVerificationEmail", email, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/verify-email");
};

export const resendVerificationEmailAction =
  async (): Promise<ResendVerificationEmailActionState> => {
    const cookiesStore = await cookies();
    const email = cookiesStore.get("pendingVerificationEmail")?.value?.trim();

    if (!email) {
      return {
        success: false,
        message: "Không tìm thấy email cần xác minh. Vui lòng đăng ký lại.",
      };
    }

    let response: Response;
    try {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/resend-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );
    } catch {
      return {
        success: false,
        message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      };
    }

    const data = (await response.json().catch(() => null)) as
      | RegisterApiResponse
      | null;

    if (!response.ok || !data?.success) {
      return {
        success: false,
        message: data?.message ?? "Không thể gửi lại email xác minh. Vui lòng thử lại.",
      };
    }

    return {
      success: true,
      message: data.message ?? "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.",
    };
  };

export const verifyEmailAction = async (
  token: string,
): Promise<VerifyEmailActionState> => {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    return {
      success: false,
      message: "Liên kết xác minh không hợp lệ.",
    };
  }

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/verify-email/${encodeURIComponent(normalizedToken)}`,
      {
        method: "POST",
      },
    );
  } catch {
    return {
      success: false,
      message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
    };
  }

  const data = (await response.json().catch(() => null)) as
    | RegisterApiResponse
    | null;

  if (!response.ok || !data?.success) {
    return {
      success: false,
      message:
        data?.message ??
        "Liên kết xác minh không hợp lệ hoặc đã hết hạn.",
    };
  }

  const cookiesStore = await cookies();
  cookiesStore.delete("pendingVerificationEmail");

  return {
    success: true,
    message: data.message ?? "Email của bạn đã được xác minh thành công.",
  };
};

export const getCurrentUser = async () => {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("accessToken")?.value;
  if (!accessToken) {
    return;
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_API}/api/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await response.json();
  return data.data;
};

export const logout = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return;
  }
  // Call backend to add token to blacklist
  fetch(`${process.env.SERVER_API}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  cookieStore.delete(`accessToken`);
  cookieStore.delete(`refreshToken`);
  return redirect("/login");
};

export const getAccessToken = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  return accessToken;
};

export const makeRefreshToken = async () => {
  const cookiesStore = await cookies();
  const refreshToken = cookiesStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return false;
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/refresh-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const {
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  } = await response.json();
  console.log(newAccessToken, "không lấy đưcọ token");

  cookiesStore.set(`accessToken`, newAccessToken, {
    httpOnly: true,
    maxAge: 3600,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  cookiesStore.set(`refreshToken`, newRefreshToken, {
    httpOnly: true,
    maxAge: 3600,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return {
    newAccessToken,
  };
};
