package com.portfolio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.portfolio.config.EnvConfig;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GitHubStatsService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GitHubStatsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        String githubToken = EnvConfig.get("GITHUB_TOKEN", "");
        this.webClient = WebClient.builder()
                .baseUrl("https://api.github.com/graphql")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Cacheable(value = "github-stats", unless = "#result == null")
    public GitHubStatsResponse getGitHubStats() {
        String query = buildGraphQLQuery();

        Map<String, String> requestBody = Map.of("query", query);

        String response = webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return parseResponse(response);
    }

    private String buildGraphQLQuery() {
        return """
            {
              viewer {
                contributionsCollection {
                  totalCommitContributions
                  totalPullRequestContributions
                }
                repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
                  nodes {
                    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
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

            JsonNode contributions = viewer.path("contributionsCollection");
            int totalCommits = contributions.path("totalCommitContributions").asInt(0);
            int totalPRs = contributions.path("totalPullRequestContributions").asInt(0);

            Map<String, LanguageData> languageMap = new HashMap<>();
            JsonNode repositories = viewer.path("repositories").path("nodes");

            for (JsonNode repo : repositories) {
                JsonNode languages = repo.path("languages").path("edges");
                for (JsonNode langEdge : languages) {
                    String name = langEdge.path("node").path("name").asText();
                    String color = langEdge.path("node").path("color").asText("#cccccc");
                    long size = langEdge.path("size").asLong(0);

                    languageMap.computeIfAbsent(name, k -> new LanguageData(name, color))
                            .addBytes(size);
                }
            }

            long totalBytes = languageMap.values().stream()
                    .mapToLong(LanguageData::getBytes)
                    .sum();

            List<LanguageStats> languageStats = languageMap.values().stream()
                    .map(data -> {
                        int percent = totalBytes > 0
                                ? (int) Math.round((data.getBytes() * 100.0) / totalBytes)
                                : 0;
                        return new LanguageStats(data.getName(), percent, data.getColor());
                    })
                    .filter(stats -> stats.percent() > 0)
                    .sorted(Comparator.comparingInt(LanguageStats::percent).reversed())
                    .limit(10)
                    .collect(Collectors.toList());

            return new GitHubStatsResponse(totalCommits, totalPRs, languageStats);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse GitHub API response", e);
        }
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

    public record GitHubStatsResponse(
            int totalCommits,
            int totalPRs,
            List<LanguageStats> languages
    ) {}

    public record LanguageStats(
            String name,
            int percent,
            String color
    ) {}
}
