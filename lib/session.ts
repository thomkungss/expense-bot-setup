import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-secret-change-me"
);

export interface SessionPayload {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(SECRET);
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      lineUserId: payload.lineUserId as string,
      displayName: payload.displayName as string,
      pictureUrl: payload.pictureUrl as string | undefined,
    };
  } catch {
    return null;
  }
}
