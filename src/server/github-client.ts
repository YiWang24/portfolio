import { Octokit } from "@octokit/rest";
import { getServerEnv } from "@/server/env";

let cached: Octokit | undefined;

export function octokit(): Octokit {
  if (cached) return cached;
  cached = new Octokit({ auth: getServerEnv().GITHUB_TOKEN });
  return cached;
}

export function githubUsername(): string {
  return getServerEnv().GITHUB_USERNAME;
}
