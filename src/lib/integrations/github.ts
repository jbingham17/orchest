import { Octokit } from "octokit";

let octokit: Octokit | null = null;

function getOctokit(): Octokit {
  if (!octokit) {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    if (!token) {
      throw new Error("GITHUB_ACCESS_TOKEN is not set");
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

export interface CreatePRParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
}

export async function createPullRequest(params: CreatePRParams) {
  const client = getOctokit();
  const response = await client.rest.pulls.create({
    owner: params.owner,
    repo: params.repo,
    title: params.title,
    body: params.body,
    head: params.head,
    base: params.base,
  });

  return {
    number: response.data.number,
    url: response.data.html_url,
    state: response.data.state,
  };
}

export interface CreateCommentParams {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}

export async function createGitHubComment(params: CreateCommentParams) {
  const client = getOctokit();
  const response = await client.rest.issues.createComment({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issue_number,
    body: params.body,
  });

  return {
    id: response.data.id,
    url: response.data.html_url,
  };
}

export interface CreateReviewParams {
  owner: string;
  repo: string;
  pull_number: number;
  body: string;
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
  comments?: Array<{
    path: string;
    position: number;
    body: string;
  }>;
}

export async function createPRReview(params: CreateReviewParams) {
  const client = getOctokit();
  const response = await client.rest.pulls.createReview({
    owner: params.owner,
    repo: params.repo,
    pull_number: params.pull_number,
    body: params.body,
    event: params.event,
    comments: params.comments,
  });

  return {
    id: response.data.id,
    state: response.data.state,
  };
}

export async function getRepositoryContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string
) {
  const client = getOctokit();
  const response = await client.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  return response.data;
}

export async function getPullRequestFiles(
  owner: string,
  repo: string,
  pull_number: number
) {
  const client = getOctokit();
  const response = await client.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  return response.data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch,
  }));
}

export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
) {
  const client = getOctokit();
  const response = await client.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
    sha,
  });

  return {
    commit: response.data.commit,
    content: response.data.content,
  };
}
