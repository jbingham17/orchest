import { NextRequest, NextResponse } from "next/server";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/slack/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get("workspace");

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
  }

  if (!SLACK_CLIENT_ID) {
    return NextResponse.json({ error: "Slack OAuth not configured" }, { status: 500 });
  }

  // Store workspace ID in state for the callback
  const state = Buffer.from(JSON.stringify({ workspaceId })).toString("base64");

  // Slack OAuth scopes for bot and user tokens
  const scopes = [
    "channels:read",
    "chat:write",
    "users:read",
    "reactions:write",
    "files:read",
  ].join(",");

  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    redirect_uri: SLACK_REDIRECT_URI,
    scope: scopes,
    state,
  });

  const authUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
