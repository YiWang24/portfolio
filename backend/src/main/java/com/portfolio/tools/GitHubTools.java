package com.portfolio.tools;

import com.portfolio.config.EnvConfig;
import com.google.adk.tools.Annotations.Schema;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

public class GitHubTools {

    private static final String GITHUB_API = "https://api.github.com";
    private static final WebClient client = WebClient.builder()
            .baseUrl(GITHUB_API)
            .defaultHeader("Authorization", "Bearer " + EnvConfig.get("GITHUB_TOKEN"))
            .defaultHeader("Accept", "application/vnd.github.v3+json")
            .build();

    @Schema(description = "List all public repositories with basic info")
    public static List<Map<String, Object>> listAllRepos(
            @Schema(name = "sortBy", description = "Sort by: 'updated', 'stars', 'name'. Default is 'updated'") String sortBy) {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            String sort = "updated";
            if (sortBy != null && !sortBy.isEmpty()) {
                String s = sortBy.toLowerCase().trim();
                if (s.equals("stars") || s.equals("name") || s.equals("updated")) {
                    sort = s;
                }
            }
            
            List<Map> repos = client.get()
                    .uri("/users/{username}/repos?per_page=100&sort={sort}", username, sort)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block();

            if (repos == null) {
                return List.of(Map.of("error", "No repos found"));
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (Map repo : repos) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", String.valueOf(repo.getOrDefault("name", "")));
                item.put("description", String.valueOf(repo.getOrDefault("description", "")));
                item.put("language", String.valueOf(repo.getOrDefault("language", "N/A")));
                item.put("stars", repo.getOrDefault("stargazers_count", 0));
                item.put("url", String.valueOf(repo.getOrDefault("html_url", "")));
                result.add(item);
            }
            return result;
        } catch (Exception e) {
            return List.of(Map.of("error", "Failed to list repos: " + e.getMessage()));
        }
    }

    @Schema(description = "Get aggregated developer profile with total stars, top languages, and pinned repos")
    public static Map<String, Object> getDeveloperProfile() {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            List<Map> repos = client.get()
                    .uri("/users/{username}/repos?per_page=100&sort=updated", username)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block();

            int totalStars = 0;
            Map<String, Integer> langCount = new HashMap<>();
            List<String> topRepos = new ArrayList<>();

            for (int i = 0; repos != null && i < repos.size(); i++) {
                Map repo = repos.get(i);
                totalStars += ((Number) repo.getOrDefault("stargazers_count", 0)).intValue();
                String lang = (String) repo.get("language");
                if (lang != null) {
                    langCount.merge(lang, 1, Integer::sum);
                }
                if (i < 5) {
                    topRepos.add((String) repo.get("name"));
                }
            }

            List<String> topLangs = langCount.entrySet().stream()
                    .sorted((a, b) -> b.getValue() - a.getValue())
                    .limit(5)
                    .map(Map.Entry::getKey)
                    .toList();

            return Map.of(
                    "total_stars", totalStars,
                    "top_languages", topLangs,
                    "pinned_repos", topRepos,
                    "total_repos", repos != null ? repos.size() : 0
            );
        } catch (Exception e) {
            return Map.of("error", "Unable to fetch GitHub profile: " + e.getMessage());
        }
    }

    @Schema(description = "Search projects by keyword or technology in user's repositories")
    public static List<Map<String, String>> searchProjects(
            @Schema(name = "query", description = "Search keyword like 'React', 'AI', 'Java'") String query) {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            List<Map> repos = client.get()
                    .uri("/users/{username}/repos?per_page=100", username)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block();

            String q = query.toLowerCase();
            List<Map<String, String>> results = new ArrayList<>();

            for (Map repo : repos) {
                String name = String.valueOf(repo.getOrDefault("name", "")).toLowerCase();
                String desc = String.valueOf(repo.getOrDefault("description", "")).toLowerCase();
                String lang = String.valueOf(repo.getOrDefault("language", "")).toLowerCase();

                if (name.contains(q) || desc.contains(q) || lang.contains(q)) {
                    results.add(Map.of(
                            "name", String.valueOf(repo.getOrDefault("name", "")),
                            "description", String.valueOf(repo.getOrDefault("description", "")),
                            "url", String.valueOf(repo.getOrDefault("html_url", "")),
                            "language", String.valueOf(repo.getOrDefault("language", "")),
                            "stars", String.valueOf(repo.getOrDefault("stargazers_count", 0))
                    ));
                    if (results.size() >= 3) break;
                }
            }
            return results.isEmpty() ? List.of(Map.of("message", "No projects found for: " + query)) : results;
        } catch (Exception e) {
            return List.of(Map.of("error", "Search failed: " + e.getMessage()));
        }
    }

    @Schema(description = "Read content of a specific file from a repository. Only allows .md, .java, .ts, .json files")
    public static Map<String, String> readRepoFile(
            @Schema(name = "repoName", description = "Name of the repository") String repoName,
            @Schema(name = "filePath", description = "Path to file, e.g. README.md") String filePath) {
        try {
            // Security: whitelist check
            if (!filePath.matches(".*\\.(md|java|ts|tsx|js|json|py)$")) {
                return Map.of("error", "File type not allowed. Only .md, .java, .ts, .json, .py files permitted.");
            }
            // Security: blacklist check
            if (filePath.toLowerCase().contains(".env") || filePath.toLowerCase().contains("secret")) {
                return Map.of("error", "Access to sensitive files is forbidden.");
            }

            String username = EnvConfig.get("GITHUB_USERNAME");
            Map response = client.get()
                    .uri("/repos/{owner}/{repo}/contents/{path}", username, repoName, filePath)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.get("content") != null) {
                String content = new String(Base64.getMimeDecoder().decode((String) response.get("content")));
                String[] lines = content.split("\n");

                // Truncate if > 200 lines
                if (lines.length > 200) {
                    StringBuilder sb = new StringBuilder();
                    for (int i = 0; i < 50; i++) sb.append(lines[i]).append("\n");
                    sb.append("\n...[truncated ")
                      .append(lines.length - 100)
                      .append(" lines]...\n\n");
                    for (int i = lines.length - 50; i < lines.length; i++) sb.append(lines[i]).append("\n");
                    content = sb.toString();
                }

                return Map.of("file", filePath, "content", content);
            }
            return Map.of("error", "File not found");
        } catch (Exception e) {
            return Map.of("error", "Failed to read file: " + e.getMessage());
        }
    }

    @Schema(description = "Get recent commit activity for a repository")
    public static Map<String, Object> getRepoCommits(
            @Schema(name = "repoName", description = "Name of the repository") String repoName,
            @Schema(name = "limit", description = "Number of commits to return (default 5)") Integer limit) {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            int count = (limit != null && limit > 0) ? Math.min(limit, 10) : 5;
            
            List<Map> commits = client.get()
                    .uri("/repos/{owner}/{repo}/commits?per_page={limit}", username, repoName, count)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block();

            List<Map<String, String>> result = new ArrayList<>();
            for (Map commit : commits) {
                Map commitData = (Map) commit.get("commit");
                Map author = (Map) commitData.get("author");
                result.add(Map.of(
                        "message", String.valueOf(commitData.get("message")).split("\n")[0],
                        "date", String.valueOf(author.get("date")),
                        "sha", String.valueOf(commit.get("sha")).substring(0, 7)
                ));
            }
            return Map.of("repo", repoName, "commits", result);
        } catch (Exception e) {
            return Map.of("error", "Failed to get commits: " + e.getMessage());
        }
    }

    @Schema(description = "Get language breakdown for a specific repository")
    public static Map<String, Object> getRepoLanguages(
            @Schema(name = "repoName", description = "Name of the repository") String repoName) {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            Map<String, Integer> languages = client.get()
                    .uri("/repos/{owner}/{repo}/languages", username, repoName)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            int total = languages.values().stream().mapToInt(Integer::intValue).sum();
            Map<String, String> percentages = new LinkedHashMap<>();
            languages.entrySet().stream()
                    .sorted((a, b) -> b.getValue() - a.getValue())
                    .forEach(e -> percentages.put(e.getKey(), 
                            String.format("%.1f%%", e.getValue() * 100.0 / total)));

            return Map.of("repo", repoName, "languages", percentages);
        } catch (Exception e) {
            return Map.of("error", "Failed to get languages: " + e.getMessage());
        }
    }

    @Schema(description = "Get repository details including description, stars, forks, and topics")
    public static Map<String, Object> getRepoDetails(
            @Schema(name = "repoName", description = "Name of the repository") String repoName) {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            Map repo = client.get()
                    .uri("/repos/{owner}/{repo}", username, repoName)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return Map.of(
                    "name", String.valueOf(repo.get("name")),
                    "description", String.valueOf(repo.getOrDefault("description", "No description")),
                    "url", String.valueOf(repo.get("html_url")),
                    "stars", repo.get("stargazers_count"),
                    "forks", repo.get("forks_count"),
                    "language", String.valueOf(repo.getOrDefault("language", "N/A")),
                    "topics", repo.getOrDefault("topics", List.of()),
                    "created_at", String.valueOf(repo.get("created_at")),
                    "updated_at", String.valueOf(repo.get("updated_at"))
            );
        } catch (Exception e) {
            return Map.of("error", "Failed to get repo details: " + e.getMessage());
        }
    }

    @Schema(description = "List files and directories in a repository path")
    public static List<Map<String, String>> listRepoContents(
            @Schema(name = "repoName", description = "Name of the repository") String repoName,
            @Schema(name = "path", description = "Directory path, e.g. 'src' or '' for root") String path) {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            String dirPath = (path == null || path.isEmpty()) ? "" : path;
            
            List<Map> contents = client.get()
                    .uri("/repos/{owner}/{repo}/contents/{path}", username, repoName, dirPath)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block();

            List<Map<String, String>> result = new ArrayList<>();
            for (Map item : contents) {
                result.add(Map.of(
                        "name", String.valueOf(item.get("name")),
                        "type", String.valueOf(item.get("type")),
                        "path", String.valueOf(item.get("path"))
                ));
            }
            return result;
        } catch (Exception e) {
            return List.of(Map.of("error", "Failed to list contents: " + e.getMessage()));
        }
    }

    @Schema(description = "Get contribution statistics for the past year")
    public static Map<String, Object> getContributionStats() {
        try {
            String username = EnvConfig.get("GITHUB_USERNAME");
            
            // Get user events (recent activity)
            List<Map> events = client.get()
                    .uri("/users/{username}/events?per_page=100", username)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block();

            int pushEvents = 0, prEvents = 0, issueEvents = 0;
            Set<String> activeRepos = new HashSet<>();

            for (Map event : events) {
                String type = String.valueOf(event.get("type"));
                Map repo = (Map) event.get("repo");
                activeRepos.add(String.valueOf(repo.get("name")).split("/")[1]);
                
                switch (type) {
                    case "PushEvent" -> pushEvents++;
                    case "PullRequestEvent" -> prEvents++;
                    case "IssuesEvent" -> issueEvents++;
                }
            }

            return Map.of(
                    "recent_pushes", pushEvents,
                    "recent_prs", prEvents,
                    "recent_issues", issueEvents,
                    "active_repos", new ArrayList<>(activeRepos).subList(0, Math.min(5, activeRepos.size()))
            );
        } catch (Exception e) {
            return Map.of("error", "Failed to get contribution stats: " + e.getMessage());
        }
    }
}
