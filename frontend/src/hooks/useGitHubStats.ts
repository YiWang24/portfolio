import { useState, useEffect } from "react";

export interface LanguageStats {
  name: string;
  percent: number;
  color: string;
  linesOfCode: number;
}

export interface ProjectActivity {
  name: string;
  description: string;
  recentCommits: number;
  status: "active" | "idle";
  language: string;
  languageColor: string;
  stars: number;
}

export interface GitHubStats {
  // Engineering Impact
  totalStars: number;
  totalForks: number;
  followers: number;
  repositoryCount: number;

  // Code Contributions
  ytdCommits: number;
  totalCommits: number;
  mergedPRs: number;
  openPRs: number;
  codeReviews: number;

  // Activity
  last30DaysCommits: number;
  currentStreak: number;
  longestStreak: number;

  // Languages
  languages: LanguageStats[];
  languageCount: number;

  // Top Projects
  topProjects: ProjectActivity[];
}

type UseGitHubStatsReturn = {
  data: GitHubStats | null;
  loading: boolean;
  error: string | null;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export function useGitHubStats(): UseGitHubStatsReturn {
  const [data, setData] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/v1/github/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch GitHub stats: ${response.status}`);
        }

        const stats = await response.json();
        setData(stats);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching GitHub stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
}
