import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID!;
const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET!;
const VERCEL_REDIRECT_URI = process.env.VERCEL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/vercel/callback`;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=missing_params`
    );
  }

  let workspaceId: string;
  try {
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    workspaceId = stateData.workspaceId;
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=invalid_state`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.vercel.com/v2/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: VERCEL_CLIENT_ID,
        client_secret: VERCEL_CLIENT_SECRET,
        code,
        redirect_uri: VERCEL_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`
      );
    }

    const accessToken = tokenData.access_token;
    const teamId = tokenData.team_id;

    // Get user/team info from Vercel
    const userResponse = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    // Store the connection in Convex
    await convex.mutation(api.connections.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      provider: "vercel",
      accessToken,
      metadata: {
        user_id: userData.user?.id,
        username: userData.user?.username,
        email: userData.user?.email,
        team_id: teamId,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?success=vercel`
    );
  } catch (err) {
    console.error("Vercel OAuth error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=oauth_failed`
    );
  }
}
