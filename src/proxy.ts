import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) return new TextEncoder().encode("fallback-secret-change-me");
  return new TextEncoder().encode(s);
}

async function getPayload(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const payload = await getPayload(req);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role as string;

  if (pathname.startsWith("/admin") && role === "EMPLOYEE") {
    return NextResponse.redirect(new URL("/employee/dashboard", req.url));
  }
  if (pathname.startsWith("/employee") && (role === "ADMIN" || role === "MANAGER")) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
};
