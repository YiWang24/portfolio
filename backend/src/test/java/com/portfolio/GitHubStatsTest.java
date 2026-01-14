package com.portfolio;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.service.GitHubStatsService;
import com.portfolio.service.GitHubStatsService.GitHubStatsResponse;
import com.portfolio.service.GitHubStatsService.LanguageStats;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GitHubStatsTest {

    @Test
    void parseResponseAggregatesLanguagesAndRoundsPercentages() {
        String json = """
            {
              "data": {
                "viewer": {
                  "contributionsCollection": {
                    "totalCommitContributions": 12,
                    "totalPullRequestContributions": 3
                  },
                  "repositories": {
                    "nodes": [
                      {
                        "languages": {
                          "edges": [
                            { "size": 200, "node": { "name": "Java", "color": "#b07219" } },
                            { "size": 50, "node": { "name": "JavaScript" } }
                          ]
                        }
                      },
                      {
                        "languages": {
                          "edges": [
                            { "size": 100, "node": { "name": "Java", "color": "#b07219" } },
                            { "size": 0, "node": { "name": "Python", "color": "#3572A5" } }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
            """;

        GitHubStatsResponse stats = invokeParse(json);

        assertEquals(12, stats.totalCommits());

        List<LanguageStats> languages = stats.languages();
        assertEquals(2, languages.size());

        assertEquals("Java", languages.get(0).name());
        assertEquals(86, languages.get(0).percent());
        assertEquals("#b07219", languages.get(0).color());

        assertEquals("JavaScript", languages.get(1).name());
        assertEquals(14, languages.get(1).percent());
        assertEquals("#cccccc", languages.get(1).color());
    }

    @Test
    void parseResponseHandlesMissingFields() {
        String json = """
            {
              "data": {
                "viewer": {
                  "repositories": {
                    "nodes": [
                      {
                        "languages": {
                          "edges": [
                            { "size": 0, "node": { "name": "Go" } }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
            """;

        GitHubStatsResponse stats = invokeParse(json);

        assertEquals(0, stats.totalCommits());
        assertEquals(0, stats.languages().size());
    }

    @Test
    void parseResponseThrowsOnInvalidJson() {
        assertThrows(RuntimeException.class, () -> invokeParse("not-json"));
    }

    private GitHubStatsResponse invokeParse(String json) {
        GitHubStatsService service = new GitHubStatsService(new ObjectMapper());

        try {
            Method parseResponse = GitHubStatsService.class.getDeclaredMethod("parseResponse", String.class);
            parseResponse.setAccessible(true);
            return (GitHubStatsResponse) parseResponse.invoke(service, json);
        } catch (InvocationTargetException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof RuntimeException runtime) {
                throw runtime;
            }
            throw new RuntimeException("Unexpected exception while parsing GitHub stats response", ex);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException("Unable to access parseResponse via reflection", ex);
        }
    }
}
