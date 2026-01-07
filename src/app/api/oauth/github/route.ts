import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/github/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get("workspace");

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
  }

  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
  }

  // Store workspace ID in state for the callback
  const state = Buffer.from(JSON.stringify({ workspaceId })).toString("base64");

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "repo read:user user:email",
    state,
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
