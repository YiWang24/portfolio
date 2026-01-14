package com.portfolio.controller;

import com.portfolio.service.GitHubStatsService;
import com.portfolio.service.GitHubStatsService.GitHubStatsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/github")
public class GitHubStatsController {

    private static final Logger log = LoggerFactory.getLogger(GitHubStatsController.class);
    private final GitHubStatsService gitHubStatsService;

    public GitHubStatsController(GitHubStatsService gitHubStatsService) {
        this.gitHubStatsService = gitHubStatsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<GitHubStatsResponse> getGitHubStats() {
        try {
            log.info("[GitHubStats] Fetching GitHub stats...");
            GitHubStatsResponse stats = gitHubStatsService.getGitHubStats();
            log.info("[GitHubStats] Successfully fetched stats: {} stars, {} commits", stats.totalStars(), stats.ytdCommits());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("[GitHubStats] Error fetching GitHub stats", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
