import { WebClient, Block, KnownBlock } from "@slack/web-api";

let slackClient: WebClient | null = null;

function getSlackClient(): WebClient {
  if (!slackClient) {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      throw new Error("SLACK_BOT_TOKEN is not set");
    }
    slackClient = new WebClient(token);
  }
  return slackClient;
}

export interface PostMessageParams {
  channel: string;
  text: string;
  blocks?: (Block | KnownBlock)[];
  thread_ts?: string;
}

export async function postSlackMessage(params: PostMessageParams) {
  const client = getSlackClient();
  const response = await client.chat.postMessage({
    channel: params.channel,
    text: params.text,
    blocks: params.blocks,
    thread_ts: params.thread_ts,
  });

  return {
    ok: response.ok,
    ts: response.ts,
    channel: response.channel,
  };
}

export interface UpdateMessageParams {
  channel: string;
  ts: string;
  text: string;
  blocks?: (Block | KnownBlock)[];
}

export async function updateSlackMessage(params: UpdateMessageParams) {
  const client = getSlackClient();
  const response = await client.chat.update({
    channel: params.channel,
    ts: params.ts,
    text: params.text,
    blocks: params.blocks,
  });

  return {
    ok: response.ok,
    ts: response.ts,
  };
}

export async function addReaction(
  channel: string,
  timestamp: string,
  emoji: string
) {
  const client = getSlackClient();
  const response = await client.reactions.add({
    channel,
    timestamp,
    name: emoji,
  });

  return { ok: response.ok };
}

export async function getUserInfo(userId: string) {
  const client = getSlackClient();
  const response = await client.users.info({ user: userId });

  if (!response.user) {
    throw new Error("User not found");
  }

  return {
    id: response.user.id,
    name: response.user.name,
    real_name: response.user.real_name,
    email: response.user.profile?.email,
  };
}

export async function listChannels() {
  const client = getSlackClient();
  const response = await client.conversations.list({
    types: "public_channel,private_channel",
  });

  return (
    response.channels?.map((channel) => ({
      id: channel.id,
      name: channel.name,
      is_private: channel.is_private,
    })) ?? []
  );
}

// Helper to create formatted blocks
export function createMessageBlocks(
  title: string,
  sections: Array<{ label: string; value: string }>
): KnownBlock[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: title,
        emoji: true,
      },
    },
    ...sections.map(
      (section): KnownBlock => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${section.label}:*\n${section.value}`,
        },
      })
    ),
  ];
}
