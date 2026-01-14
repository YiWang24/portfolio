package com.portfolio.controller;

import com.portfolio.service.GitHubStatsService;
import com.portfolio.service.GitHubStatsService.GitHubStatsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/github")
public class GitHubStatsController {

    private final GitHubStatsService gitHubStatsService;

    public GitHubStatsController(GitHubStatsService gitHubStatsService) {
        this.gitHubStatsService = gitHubStatsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<GitHubStatsResponse> getGitHubStats() {
        try {
            GitHubStatsResponse stats = gitHubStatsService.getGitHubStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
