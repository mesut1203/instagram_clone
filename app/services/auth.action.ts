"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const loginAction = async (formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_API}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );
  const data = await response.json();

  const cookiesStore = await cookies();
  cookiesStore.set(`accessToken`, data.data.tokens.accessToken, {
    httpOnly: true,
    maxAge: 3600,
  });
  cookiesStore.set(`refreshToken`, data.data.tokens.refreshToken, {
    httpOnly: true,
    maxAge: 3600,
  });
  redirect("/");
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
  });
  cookiesStore.set(`refreshToken`, newRefreshToken, {
    httpOnly: true,
    maxAge: 3600,
  });
  return {
    newAccessToken,
  };
};
