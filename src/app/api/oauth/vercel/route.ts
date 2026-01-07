import { NextRequest, NextResponse } from "next/server";

const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID!;
const VERCEL_REDIRECT_URI = process.env.VERCEL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/vercel/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get("workspace");

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
  }

  if (!VERCEL_CLIENT_ID) {
    return NextResponse.json({ error: "Vercel OAuth not configured" }, { status: 500 });
  }

  // Store workspace ID in state for the callback
  const state = Buffer.from(JSON.stringify({ workspaceId })).toString("base64");

  const params = new URLSearchParams({
    client_id: VERCEL_CLIENT_ID,
    redirect_uri: VERCEL_REDIRECT_URI,
    state,
  });

  const authUrl = `https://vercel.com/integrations/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
