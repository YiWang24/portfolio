package com.portfolio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.portfolio.config.EnvConfig;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GitHubStatsService {

    private static final Logger log = LoggerFactory.getLogger(GitHubStatsService.class);
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GitHubStatsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        String githubToken = EnvConfig.get("GITHUB_TOKEN", "");
        log.info("[GitHubStatsService] Initializing with token: {}...", githubToken.substring(0, Math.min(10, githubToken.length())) + (githubToken.length() > 10 ? "***" : ""));
        if (githubToken.isEmpty()) {
            log.warn("[GitHubStatsService] GITHUB_TOKEN is empty!");
        }
        this.webClient = WebClient.builder()
                .baseUrl("https://api.github.com/graphql")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Cacheable(value = "github-stats", unless = "#result == null")
    public GitHubStatsResponse getGitHubStats() {
        log.info("[GitHubStatsService] Fetching GitHub stats...");
        String query = buildGraphQLQuery();
        log.debug("[GitHubStatsService] GraphQL query length: {} chars", query.length());

        Map<String, String> requestBody = Map.of("query", query);

        String response = webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.debug("[GitHubStatsService] GitHub API response length: {} chars", response != null ? response.length() : 0);

        return parseResponse(response);
    }

    private String buildGraphQLQuery() {
        return """
            {
              viewer {
                # Engineering Impact
                repositories(first: 100, ownerAffiliations: OWNER) {
                  totalCount
                  nodes {
                    stargazerCount
                    forkCount
                    isArchived
                    primaryLanguage {
                      name
                      color
                    }
                  }
                }

                # Followers
                followers {
                  totalCount
                }

                # Contributions (all time)
                contributionsCollection {
                  totalCommitContributions
                  totalPullRequestContributions
                  totalPullRequestReviewContributions

                  # Contribution calendar for streak calculation
                  contributionCalendar {
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                      }
                    }
                  }

                  # Top repositories by recent commits
                  commitContributionsByRepository(maxRepositories: 10) {
                    contributions {
                      totalCount
                    }
                    repository {
                      name
                      description
                      stargazerCount
                      primaryLanguage {
                        name
                        color
                      }
                      pushedAt
                    }
                  }
                }

                # Languages with line counts
                repositories(first: 100) {
                  nodes {
                    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                      totalSize
                      edges {
                        size
                        node {
                          name
                          color
                        }
                      }
                    }
                  }
                }
              }
            }
            """;
    }

    private GitHubStatsResponse parseResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode viewer = root.path("data").path("viewer");

            // === Engineering Impact ===
            JsonNode repositories = viewer.path("repositories");
            int repositoryCount = repositories.path("totalCount").asInt(0);
            int totalStars = 0;
            int totalForks = 0;
            List<RepoData> repoDataList = new ArrayList<>();

            for (JsonNode repo : repositories.path("nodes")) {
                if (!repo.path("isArchived").asBoolean()) {
                    int stars = repo.path("stargazerCount").asInt(0);
                    int forks = repo.path("forkCount").asInt(0);
                    String name = repo.path("name").asText();
                    String description = repo.path("description").asText("");
                    String language = repo.path("primaryLanguage").path("name").asText("Unknown");
                    String languageColor = repo.path("primaryLanguage").path("color").asText("#cccccc");
                    int commits = repo.path("defaultBranchRef").path("target").path("history").path("totalCount").asInt(0);

                    totalStars += stars;
                    totalForks += forks;

                    repoDataList.add(new RepoData(name, description, stars, forks, language, languageColor, commits));
                }
            }

            int followers = viewer.path("followers").path("totalCount").asInt(0);

            // === Code Contributions ===
            JsonNode contributions = viewer.path("contributionsCollection");
            int ytdCommits = contributions.path("totalCommitContributions").asInt(0);
            int mergedPRs = contributions.path("totalPullRequestContributions").asInt(0);
            int codeReviews = contributions.path("totalPullRequestReviewContributions").asInt(0);

            // TODO: Calculate last 30 days commits from contribution calendar
            int last30DaysCommits = 0;

            // === Streak Calculation ===
            JsonNode weeks = contributions.path("contributionCalendar").path("weeks");
            int[] streaks = calculateStreaks(weeks);
            int currentStreak = streaks[0];
            int longestStreak = streaks[1];

            // === Languages with LOC ===
            Map<String, LanguageData> languageMap = new HashMap<>();
            final long[] totalBytesHolder = {0};

            for (JsonNode repo : viewer.path("repositories").path("nodes")) {
                JsonNode languages = repo.path("languages").path("edges");
                for (JsonNode langEdge : languages) {
                    String name = langEdge.path("node").path("name").asText();
                    String color = langEdge.path("node").path("color").asText("#cccccc");
                    long size = langEdge.path("size").asLong(0);

                    languageMap.computeIfAbsent(name, k -> new LanguageData(name, color))
                            .addBytes(size);
                    totalBytesHolder[0] += size;
                }
            }

            final long totalBytes = totalBytesHolder[0];

            List<LanguageStats> languageStats = languageMap.values().stream()
                    .map(data -> {
                        int percent = totalBytes > 0
                                ? (int) Math.round((data.getBytes() * 100.0) / totalBytes)
                                : 0;
                        return new LanguageStats(data.getName(), percent, data.getColor(), data.getBytes());
                    })
                    .filter(stats -> stats.percent() > 0)
                    .sorted(Comparator.comparingInt(LanguageStats::percent).reversed())
                    .limit(10)
                    .collect(Collectors.toList());

            // === Top Projects by Recent Activity ===
            JsonNode repoContributions = contributions.path("commitContributionsByRepository");
            List<ProjectActivity> topProjectsList = new ArrayList<>();
            repoContributions.forEach(node -> {
                JsonNode repoNode = node.path("repository");
                String name = repoNode.path("name").asText();
                String description = repoNode.path("description").asText("");
                int commitsCount = node.path("contributions").path("totalCount").asInt(0);
                int stars = repoNode.path("stargazerCount").asInt(0);
                String language = repoNode.path("primaryLanguage").path("name").asText("Unknown");
                String languageColor = repoNode.path("primaryLanguage").path("color").asText("#cccccc");
                String pushedAt = repoNode.path("pushedAt").asText();

                // Determine if active (updated within 30 days)
                String status = LocalDate.parse(pushedAt).isAfter(LocalDate.now().minusDays(30))
                        ? "active"
                        : "idle";

                topProjectsList.add(new ProjectActivity(name, description, commitsCount, status,
                        language, languageColor, stars));
            });

            List<ProjectActivity> topProjects = topProjectsList.stream()
                    .sorted(Comparator.comparingInt(ProjectActivity::recentCommits).reversed())
                    .limit(3)
                    .collect(Collectors.toList());

            return new GitHubStatsResponse(
                    totalStars,
                    totalForks,
                    followers,
                    repositoryCount,
                    ytdCommits,
                    ytdCommits, // Using YTD as total for now
                    mergedPRs,
                    0, // Open PRs - requires separate query
                    codeReviews,
                    last30DaysCommits,
                    currentStreak,
                    longestStreak,
                    languageStats,
                    languageMap.size(),
                    topProjects
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse GitHub API response", e);
        }
    }

    private int[] calculateStreaks(JsonNode weeks) {
        int currentStreak = 0;
        int longestStreak = 0;
        boolean inCurrentStreak = true;
        LocalDate today = LocalDate.now();

        List<JsonNode> weekList = new ArrayList<>();
        weeks.forEach(weekList::add);

        // Iterate from most recent to oldest
        for (int weekIdx = weekList.size() - 1; weekIdx >= 0; weekIdx--) {
            JsonNode week = weekList.get(weekIdx);
            List<JsonNode> days = new ArrayList<>();
            week.path("contributionDays").forEach(days::add);

            for (int dayIdx = days.size() - 1; dayIdx >= 0; dayIdx--) {
                JsonNode day = days.get(dayIdx);
                int count = day.path("contributionCount").asInt(0);
                String dateStr = day.path("date").asText();
                LocalDate date = LocalDate.parse(dateStr);

                // Calculate current streak
                if (inCurrentStreak) {
                    if (count > 0 && !date.isAfter(today)) {
                        currentStreak++;
                    } else if (date.isBefore(today) && count == 0) {
                        // First zero day before today, end current streak
                        inCurrentStreak = false;
                    }
                    // Skip future dates
                }

                // Calculate longest streak
                if (count > 0 && !date.isAfter(today)) {
                    int tempStreak = 1;
                    // Continue counting backwards
                    for (int prevWeek = weekIdx; prevWeek >= 0; prevWeek--) {
                        JsonNode prevWeekNode = weekList.get(prevWeek);
                        List<JsonNode> prevDays = new ArrayList<>();
                        prevWeekNode.path("contributionDays").forEach(prevDays::add);

                        int startDay = (prevWeek == weekIdx) ? dayIdx - 1 : prevDays.size() - 1;
                        for (int d = startDay; d >= 0; d--) {
                            JsonNode prevDay = prevDays.get(d);
                            if (prevDay.path("contributionCount").asInt(0) > 0) {
                                tempStreak++;
                            } else {
                                break;
                            }
                        }
                        if (tempStreak > longestStreak) {
                            longestStreak = tempStreak;
                        }
                        break; // Simplified - just count one continuous streak
                    }
                }
            }
        }

        return new int[]{currentStreak, longestStreak};
    }

    private static class LanguageData {
        private final String name;
        private final String color;
        private long bytes;

        public LanguageData(String name, String color) {
            this.name = name;
            this.color = color;
        }

        public void addBytes(long bytes) {
            this.bytes += bytes;
        }

        public String getName() {
            return name;
        }

        public String getColor() {
            return color;
        }

        public long getBytes() {
            return bytes;
        }
    }

    private static class RepoData {
        private final String name;
        private final String description;
        private final int stars;
        private final int forks;
        private final String language;
        private final String languageColor;
        private final int commits;

        public RepoData(String name, String description, int stars, int forks,
                       String language, String languageColor, int commits) {
            this.name = name;
            this.description = description;
            this.stars = stars;
            this.forks = forks;
            this.language = language;
            this.languageColor = languageColor;
            this.commits = commits;
        }

        public String getName() {
            return name;
        }

        public String getDescription() {
            return description;
        }

        public int getStars() {
            return stars;
        }

        public int getForks() {
            return forks;
        }

        public String getLanguage() {
            return language;
        }

        public String getLanguageColor() {
            return languageColor;
        }

        public int getCommits() {
            return commits;
        }
    }

    public record GitHubStatsResponse(
            // Engineering Impact
            int totalStars,
            int totalForks,
            int followers,
            int repositoryCount,

            // Code Contributions
            int ytdCommits,
            int totalCommits,
            int mergedPRs,
            int openPRs,
            int codeReviews,

            // Activity
            int last30DaysCommits,
            int currentStreak,
            int longestStreak,

            // Languages
            List<LanguageStats> languages,
            int languageCount,

            // Top Projects
            List<ProjectActivity> topProjects
    ) {}

    public record LanguageStats(
            String name,
            int percent,
            String color,
            long linesOfCode
    ) {}

    public record ProjectActivity(
            String name,
            String description,
            int recentCommits,
            String status,
            String language,
            String languageColor,
            int stars
    ) {}
}
