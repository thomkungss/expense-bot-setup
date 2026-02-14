import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?error=login_denied", baseUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=invalid_params", baseUrl));
  }

  // Verify state
  const savedState = request.cookies.get("line_oauth_state")?.value;
  if (state !== savedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", baseUrl));
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINE_LOGIN_CALLBACK_URL!,
        client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
        client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(new URL("/?error=token_failed", baseUrl));
    }

    const tokenData = await tokenRes.json();

    // Get user profile
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/?error=profile_failed", baseUrl));
    }

    const profile = await profileRes.json();

    // Create session
    const sessionToken = await createSession({
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    });

    const response = NextResponse.redirect(new URL("/setup", baseUrl));
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    });
    response.cookies.delete("line_oauth_state");

    return response;
  } catch (err) {
    console.error("LINE callback error:", err);
    return NextResponse.redirect(new URL("/?error=callback_failed", baseUrl));
  }
}
