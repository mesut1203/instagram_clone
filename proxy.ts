import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, makeRefreshToken } from "./app/services/auth.action";

export const proxy = async (request: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    // xử lý refresh
    const refreshStatus = await makeRefreshToken();
    if (!refreshStatus) {
      return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
    }
  } else {
    return NextResponse.next();
  }
};

export const config = {
  matcher: ["/"],
};
