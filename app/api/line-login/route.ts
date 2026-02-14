import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID!;
  const callbackUrl = process.env.LINE_LOGIN_CALLBACK_URL!;
  const state = crypto.randomBytes(16).toString("hex");

  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", channelId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "profile openid");

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("line_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300, // 5 minutes
  });

  return response;
}
