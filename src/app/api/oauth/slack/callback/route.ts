import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;

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
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=${encodeURIComponent(tokenData.error)}`
      );
    }

    const accessToken = tokenData.access_token;
    const teamInfo = tokenData.team;
    const botUserId = tokenData.bot_user_id;

    // Store the connection in Convex
    await convex.mutation(api.connections.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      provider: "slack",
      accessToken,
      metadata: {
        team_id: teamInfo?.id,
        team_name: teamInfo?.name,
        bot_user_id: botUserId,
        scope: tokenData.scope,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?success=slack`
    );
  } catch (err) {
    console.error("Slack OAuth error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=oauth_failed`
    );
  }
}
