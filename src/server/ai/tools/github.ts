import { tool } from "ai";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { octokit, githubUsername } from "@/server/github-client";
import { getGitHubStats } from "@/server/github";
import { spotlight } from "@/server/ai/guardrails";

const FILE_EXTENSION_ALLOWLIST = /\.(md|java|ts|tsx|js|json|py)$/i;
const FILE_DENYLIST = /\.env|secret/i;

function errorPayload(message: string, extra?: Record<string, unknown>): Record<string, unknown> {
  return { error: message, ...(extra ?? {}) };
}

export const getGitHubStatsTool = tool({
  description:
    "Get comprehensive GitHub statistics including stars, commits, streaks, languages, and top projects",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      return await getGitHubStats();
    } catch (err) {
      return errorPayload(
        `Failed to fetch GitHub stats: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const getDeveloperProfileTool = tool({
  description:
    "Get aggregated developer profile with total stars, top languages, and pinned repos",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const username = githubUsername();
      const result = await octokit().rest.repos.listForUser({
        username,
        per_page: 100,
        sort: "updated",
      });
      const repos = result.data;

      let totalStars = 0;
      const langCount = new Map<string, number>();
      const topRepos: string[] = [];

      repos.forEach((repo, index) => {
        totalStars += repo.stargazers_count ?? 0;
        if (repo.language) {
          langCount.set(repo.language, (langCount.get(repo.language) ?? 0) + 1);
        }
        if (index < 5) topRepos.push(repo.name);
      });

      const topLanguages = Array.from(langCount.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      return {
        total_stars: totalStars,
        top_languages: topLanguages,
        pinned_repos: topRepos,
        total_repos: repos.length,
      };
    } catch (err) {
      return errorPayload(
        `Unable to fetch GitHub profile: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const listAllReposTool = tool({
  description: "List all public repositories with basic info",
  inputSchema: z.object({
    sortBy: z
      .enum(["updated", "stars", "name"])
      .optional()
      .describe("Sort by: 'updated', 'stars', 'name'. Default is 'updated'"),
  }),
  execute: async ({ sortBy }) => {
    try {
      const username = githubUsername();
      const sort = sortBy === "stars" ? "pushed" : sortBy ?? "updated";
      const result = await octokit().rest.repos.listForUser({
        username,
        per_page: 100,
        sort: sort === "name" ? "full_name" : (sort as "updated" | "pushed" | "full_name"),
      });
      let repos = result.data;
      if (sortBy === "stars") {
        repos = [...repos].sort(
          (a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
        );
      }
      return repos.map((repo) => ({
        name: repo.name,
        description: repo.description ?? "",
        language: repo.language ?? "N/A",
        stars: repo.stargazers_count ?? 0,
        url: repo.html_url,
      }));
    } catch (err) {
      return [
        errorPayload(`Failed to list repos: ${err instanceof Error ? err.message : "unknown"}`),
      ];
    }
  },
});

export const searchProjectsTool = tool({
  description: "Search projects by keyword or technology in user's repositories",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("Search keyword like 'React', 'AI', 'Java'"),
  }),
  execute: async ({ query }) => {
    try {
      const username = githubUsername();
      const result = await octokit().rest.repos.listForUser({
        username,
        per_page: 100,
      });
      const needle = query.toLowerCase();
      const matches: Array<Record<string, unknown>> = [];
      for (const repo of result.data) {
        const name = (repo.name ?? "").toLowerCase();
        const desc = (repo.description ?? "").toLowerCase();
        const lang = (repo.language ?? "").toLowerCase();
        if (name.includes(needle) || desc.includes(needle) || lang.includes(needle)) {
          matches.push({
            name: repo.name,
            description: repo.description ?? "",
            url: repo.html_url,
            language: repo.language ?? "",
            stars: String(repo.stargazers_count ?? 0),
          });
          if (matches.length >= 3) break;
        }
      }
      if (matches.length === 0) {
        return [{ message: `No projects found for: ${query}` }];
      }
      return matches;
    } catch (err) {
      return [errorPayload(`Search failed: ${err instanceof Error ? err.message : "unknown"}`)];
    }
  },
});

export const getRepoDetailsTool = tool({
  description:
    "Get repository details including description, stars, forks, and topics",
  inputSchema: z.object({
    repoName: z.string().min(1).describe("Name of the repository"),
  }),
  execute: async ({ repoName }) => {
    try {
      const username = githubUsername();
      const { data: repo } = await octokit().rest.repos.get({
        owner: username,
        repo: repoName,
      });
      return {
        name: repo.name,
        description: repo.description ?? "No description",
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language ?? "N/A",
        topics: repo.topics ?? [],
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      };
    } catch (err) {
      return errorPayload(
        `Failed to get repo details: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const getRepoLanguagesTool = tool({
  description: "Get language breakdown for a specific repository",
  inputSchema: z.object({
    repoName: z.string().min(1).describe("Name of the repository"),
  }),
  execute: async ({ repoName }) => {
    try {
      const username = githubUsername();
      const { data: languages } = await octokit().rest.repos.listLanguages({
        owner: username,
        repo: repoName,
      });
      const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
      const percentages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .reduce<Record<string, string>>((acc, [name, bytes]) => {
          acc[name] = total === 0 ? "0.0%" : `${((bytes * 100) / total).toFixed(1)}%`;
          return acc;
        }, {});
      return { repo: repoName, languages: percentages };
    } catch (err) {
      return errorPayload(
        `Failed to get languages: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const getRepoCommitsTool = tool({
  description: "Get recent commit activity for a repository",
  inputSchema: z.object({
    repoName: z.string().min(1).describe("Name of the repository"),
    limit: z
      .number()
      .int()
      .positive()
      .max(10)
      .optional()
      .describe("Number of commits to return (default 5, max 10)"),
  }),
  execute: async ({ repoName, limit }) => {
    try {
      const username = githubUsername();
      const count = Math.min(Math.max(limit ?? 5, 1), 10);
      const { data: commits } = await octokit().rest.repos.listCommits({
        owner: username,
        repo: repoName,
        per_page: count,
      });
      const result = commits.map((entry) => {
        const messageLine = entry.commit.message.split("\n")[0];
        return {
          message: messageLine,
          date: entry.commit.author?.date ?? "",
          sha: entry.sha.slice(0, 7),
        };
      });
      return { repo: repoName, commits: result };
    } catch (err) {
      return errorPayload(
        `Failed to get commits: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const listRepoContentsTool = tool({
  description: "List files and directories in a repository path",
  inputSchema: z.object({
    repoName: z.string().min(1).describe("Name of the repository"),
    path: z
      .string()
      .optional()
      .describe("Directory path, e.g. 'src' or '' for root"),
  }),
  execute: async ({ repoName, path }) => {
    try {
      const username = githubUsername();
      const { data } = await octokit().rest.repos.getContent({
        owner: username,
        repo: repoName,
        path: path ?? "",
      });
      const entries = Array.isArray(data) ? data : [data];
      return entries.map((item) => ({
        name: item.name,
        type: item.type,
        path: item.path,
      }));
    } catch (err) {
      return [
        errorPayload(
          `Failed to list contents: ${err instanceof Error ? err.message : "unknown"}`
        ),
      ];
    }
  },
});

export const readRepoFileTool = tool({
  description:
    "Read content of a specific file from a repository. Only allows .md, .java, .ts, .tsx, .js, .json, .py files",
  inputSchema: z.object({
    repoName: z.string().min(1).describe("Name of the repository"),
    filePath: z.string().min(1).describe("Path to file, e.g. README.md"),
  }),
  execute: async ({ repoName, filePath }) => {
    if (!FILE_EXTENSION_ALLOWLIST.test(filePath)) {
      return errorPayload(
        "File type not allowed. Only .md, .java, .ts, .tsx, .js, .json, .py files permitted."
      );
    }
    if (FILE_DENYLIST.test(filePath)) {
      return errorPayload("Access to sensitive files is forbidden.");
    }

    try {
      const username = githubUsername();
      const { data } = await octokit().rest.repos.getContent({
        owner: username,
        repo: repoName,
        path: filePath,
      });
      if (Array.isArray(data) || data.type !== "file" || !("content" in data)) {
        return errorPayload("File not found");
      }
      const raw = Buffer.from(data.content, "base64").toString("utf8");
      const lines = raw.split("\n");
      const origin = `github:${repoName}/${filePath}`;
      if (lines.length > 200) {
        const head = lines.slice(0, 50).join("\n");
        const tail = lines.slice(-50).join("\n");
        const truncated = lines.length - 100;
        return {
          file: filePath,
          content: spotlight(
            `${head}\n\n...[truncated ${truncated} lines]...\n\n${tail}\n`,
            origin
          ),
        };
      }
      return { file: filePath, content: spotlight(raw, origin) };
    } catch (err) {
      return errorPayload(
        `Failed to read file: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const getContributionStatsTool = tool({
  description: "Get contribution statistics for the past year",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const username = githubUsername();
      const { data: events } = await octokit().request(
        "GET /users/{username}/events",
        { username, per_page: 100 }
      );
      let pushEvents = 0;
      let prEvents = 0;
      let issueEvents = 0;
      const activeRepos = new Set<string>();
      for (const event of events) {
        const repoName = event.repo?.name?.split("/")[1];
        if (repoName) activeRepos.add(repoName);
        switch (event.type) {
          case "PushEvent":
            pushEvents += 1;
            break;
          case "PullRequestEvent":
            prEvents += 1;
            break;
          case "IssuesEvent":
            issueEvents += 1;
            break;
        }
      }
      return {
        recent_pushes: pushEvents,
        recent_prs: prEvents,
        recent_issues: issueEvents,
        active_repos: Array.from(activeRepos).slice(0, 5),
      };
    } catch (err) {
      return errorPayload(
        `Failed to get contribution stats: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  },
});

export const githubTools = {
  getGitHubStats: getGitHubStatsTool,
  getDeveloperProfile: getDeveloperProfileTool,
  listAllRepos: listAllReposTool,
  searchProjects: searchProjectsTool,
  getRepoDetails: getRepoDetailsTool,
  getRepoLanguages: getRepoLanguagesTool,
  getRepoCommits: getRepoCommitsTool,
  listRepoContents: listRepoContentsTool,
  readRepoFile: readRepoFileTool,
  getContributionStats: getContributionStatsTool,
};
