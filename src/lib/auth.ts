import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const EXPIRY = "8h";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  userId: string;
  role: string;
  employeeId: string | null;
  name: string;
};

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: string[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (allowedRoles && !allowedRoles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}

export function handleAuthError(err: unknown): { status: number; message: string } {
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return { status: 401, message: "Unauthorized" };
    if (err.message === "FORBIDDEN") return { status: 403, message: "Forbidden" };
  }
  console.error(err);
  return { status: 500, message: "Internal server error" };
}
