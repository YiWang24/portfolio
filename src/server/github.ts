import { octokit } from "@/server/github-client";

export type LanguageStats = {
  name: string;
  percent: number;
  color: string;
  linesOfCode: number;
};

export type ProjectActivity = {
  name: string;
  description: string;
  recentCommits: number;
  status: "active" | "idle";
  language: string;
  languageColor: string;
  stars: number;
};

export type GitHubStats = {
  totalStars: number;
  totalForks: number;
  followers: number;
  repositoryCount: number;
  ytdCommits: number;
  totalCommits: number;
  mergedPRs: number;
  openPRs: number;
  codeReviews: number;
  last30DaysCommits: number;
  currentStreak: number;
  longestStreak: number;
  languages: LanguageStats[];
  languageCount: number;
  topProjects: ProjectActivity[];
};

type ContributionDay = { date: string; contributionCount: number };

type StatsQueryResult = {
  viewer: {
    login: string;
    followers: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: Array<{
        name: string;
        description: string | null;
        stargazerCount: number;
        forkCount: number;
        isArchived: boolean;
        pushedAt: string | null;
        primaryLanguage: { name: string; color: string | null } | null;
        languages: {
          edges: Array<{
            size: number;
            node: { name: string; color: string | null };
          }>;
        };
      }>;
    };
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{ contributionDays: ContributionDay[] }>;
      };
      commitContributionsByRepository: Array<{
        contributions: { totalCount: number };
        repository: {
          name: string;
          description: string | null;
          stargazerCount: number;
          pushedAt: string | null;
          primaryLanguage: { name: string; color: string | null } | null;
        };
      }>;
    };
  };
};

const STATS_QUERY = /* GraphQL */ `
  query Stats {
    viewer {
      login
      followers { totalCount }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        totalCount
        nodes {
          name
          description
          stargazerCount
          forkCount
          isArchived
          pushedAt
          primaryLanguage { name color }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node { name color }
            }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount }
          }
        }
        commitContributionsByRepository(maxRepositories: 10) {
          contributions { totalCount }
          repository {
            name
            description
            stargazerCount
            pushedAt
            primaryLanguage { name color }
          }
        }
      }
    }
  }
`;

function flattenDays(weeks: StatsQueryResult["viewer"]["contributionsCollection"]["contributionCalendar"]["weeks"]): ContributionDay[] {
  return weeks.flatMap((week) => week.contributionDays);
}

function computeStreaks(days: ContributionDay[]): { current: number; longest: number } {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let running = 0;
  for (const day of sorted) {
    if (day.contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const day = sorted[i];
    if (day.date > today) continue;
    if (day.contributionCount > 0) current += 1;
    else break;
  }
  return { current, longest };
}

function last30Days(days: ContributionDay[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return days
    .filter((day) => day.date >= cutoffStr)
    .reduce((sum, day) => sum + day.contributionCount, 0);
}

function statusFromPushedAt(pushedAt: string | null): "active" | "idle" {
  if (!pushedAt) return "idle";
  const pushed = new Date(pushedAt).getTime();
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return pushed >= ninetyDaysAgo ? "active" : "idle";
}

async function fetchOpenPRs(login: string): Promise<number> {
  const result = await octokit().rest.search.issuesAndPullRequests({
    q: `is:pr is:open author:${login}`,
    per_page: 1,
  });
  return result.data.total_count;
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const data = await octokit().graphql<StatsQueryResult>(STATS_QUERY);
  const viewer = data.viewer;

  let totalStars = 0;
  let totalForks = 0;
  const langSize = new Map<string, { size: number; color: string }>();

  for (const repo of viewer.repositories.nodes) {
    if (repo.isArchived) continue;
    totalStars += repo.stargazerCount;
    totalForks += repo.forkCount;
    for (const edge of repo.languages.edges) {
      const entry = langSize.get(edge.node.name) ?? { size: 0, color: edge.node.color ?? "#888" };
      entry.size += edge.size;
      if (!entry.color && edge.node.color) entry.color = edge.node.color;
      langSize.set(edge.node.name, entry);
    }
  }

  const totalBytes = Array.from(langSize.values()).reduce((sum, l) => sum + l.size, 0);
  const languages: LanguageStats[] = Array.from(langSize.entries())
    .sort(([, a], [, b]) => b.size - a.size)
    .slice(0, 10)
    .map(([name, { size, color }]) => ({
      name,
      percent: totalBytes === 0 ? 0 : Math.round((size * 100) / totalBytes),
      color: color || "#888",
      linesOfCode: size,
    }));

  const contrib = viewer.contributionsCollection;
  const days = flattenDays(contrib.contributionCalendar.weeks);
  const { current: currentStreak, longest: longestStreak } = computeStreaks(days);

  const topProjects: ProjectActivity[] = contrib.commitContributionsByRepository
    .map((entry) => ({
      name: entry.repository.name,
      description: entry.repository.description ?? "",
      recentCommits: entry.contributions.totalCount,
      status: statusFromPushedAt(entry.repository.pushedAt),
      language: entry.repository.primaryLanguage?.name ?? "Unknown",
      languageColor: entry.repository.primaryLanguage?.color ?? "#888",
      stars: entry.repository.stargazerCount,
    }))
    .sort((a, b) => b.recentCommits - a.recentCommits)
    .slice(0, 5);

  const openPRs = await fetchOpenPRs(viewer.login);

  return {
    totalStars,
    totalForks,
    followers: viewer.followers.totalCount,
    repositoryCount: viewer.repositories.totalCount,
    ytdCommits: contrib.totalCommitContributions,
    totalCommits: contrib.contributionCalendar.totalContributions,
    mergedPRs: contrib.totalPullRequestContributions,
    openPRs,
    codeReviews: contrib.totalPullRequestReviewContributions,
    last30DaysCommits: last30Days(days),
    currentStreak,
    longestStreak,
    languages,
    languageCount: langSize.size,
    topProjects,
  };
}
