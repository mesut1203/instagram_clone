import { NextRequest, NextResponse } from "next/server";

type RefreshTokenResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };
  success?: boolean;
};

const protectedPrefixes = [
  "/",
  "/about",
  "/create",
  "/explore",
  "/messages",
  "/posts",
  "/products",
  "/profile",
  "/search",
  "/settings",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) =>
    prefix === "/"
      ? pathname === "/"
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isTokenExpired(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };

    return typeof decoded.exp === "number"
      ? decoded.exp * 1000 <= Date.now() + 30_000
      : false;
  } catch {
    return false;
  }
}

async function refreshSession(refreshToken: string) {
  const baseUrl = (
    process.env.SERVER_API ??
    process.env.NEXT_PUBLIC_SERVER_API ??
    "https://instagram-api.unicode.vn"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | RefreshTokenResponse
      | null;
    const accessToken =
      payload?.data?.accessToken ?? payload?.data?.tokens?.accessToken;
    const nextRefreshToken =
      payload?.data?.refreshToken ?? payload?.data?.tokens?.refreshToken;

    if (
      !response.ok ||
      payload?.success === false ||
      !accessToken ||
      !nextRefreshToken
    ) {
      return null;
    }

    return { accessToken, refreshToken: nextRefreshToken };
  } catch {
    return null;
  }
}

function setSessionCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  const commonOptions = {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  response.cookies.set("accessToken", tokens.accessToken, {
    ...commonOptions,
    maxAge: 60 * 60,
  });
  response.cookies.set("refreshToken", tokens.refreshToken, {
    ...commonOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
}

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const needsRefresh =
    Boolean(refreshToken) &&
    (!accessToken || (accessToken ? isTokenExpired(accessToken) : false));

  if (needsRefresh && refreshToken) {
    const tokens = await refreshSession(refreshToken);

    if (tokens) {
      request.cookies.set("accessToken", tokens.accessToken);
      request.cookies.set("refreshToken", tokens.refreshToken);

      const response =
        pathname === "/login"
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next();
      setSessionCookies(response, tokens);
      return response;
    }

    const response = isProtectedPath(pathname)
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next();
    clearSessionCookies(response);
    return response;
  }

  if (isProtectedPath(pathname) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/",
    "/login",
    "/about/:path*",
    "/create/:path*",
    "/explore/:path*",
    "/messages/:path*",
    "/posts/:path*",
    "/products/:path*",
    "/profile/:path*",
    "/search/:path*",
    "/settings/:path*",
  ],
};
