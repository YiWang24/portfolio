package com.portfolio;


import com.portfolio.tools.GitHubTools;
import com.portfolio.tools.RAGTools;
import com.portfolio.tools.UtilityTools;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ToolsTest {

    @Test
    void testGetDeveloperProfile() {
        Map<String, Object> profile = GitHubTools.getDeveloperProfile();
        System.out.println("Developer Profile: " + profile);
        
        assertNotNull(profile);
        if (!profile.containsKey("error")) {
            assertTrue(profile.containsKey("total_stars"));
            assertTrue(profile.containsKey("top_languages"));
            assertTrue(profile.containsKey("pinned_repos"));
        }
    }

    @Test
    void testSearchProjects() {
        List<Map<String, String>> results = GitHubTools.searchProjects("java");
        System.out.println("Search Results: " + results);
        
        assertNotNull(results);
        assertFalse(results.isEmpty());
    }

    @Test
    void testReadRepoFile() {
        // Test whitelist - should work
        Map<String, String> readme = GitHubTools.readRepoFile("MyNote", "README.md");
        System.out.println("README: " + readme);
        assertNotNull(readme);

        // Test blacklist - should be blocked
        Map<String, String> blocked = GitHubTools.readRepoFile("dsa", ".env");
        assertTrue(blocked.containsKey("error"));
        System.out.println("Blocked .env: " + blocked.get("error"));
    }

    @Test
    void testListAllRepos() {
        List<Map<String, Object>> repos = GitHubTools.listAllRepos("stars");
        System.out.println("All Repos: " + repos.size() + " repos");
        repos.stream().limit(15).forEach(r -> System.out.println("  - " + r.get("name") + " (" + r.get("language") + ")"));
        
        assertNotNull(repos);
        assertFalse(repos.isEmpty());
    }

    @Test
    void testGetRepoDetails() {
        Map<String, Object> details = GitHubTools.getRepoDetails("MyNote");
        System.out.println("Repo Details: " + details);
        
        assertNotNull(details);
        if (!details.containsKey("error")) {
            assertTrue(details.containsKey("name"));
            assertTrue(details.containsKey("stars"));
        }
    }

    @Test
    void testGetRepoLanguages() {
        Map<String, Object> languages = GitHubTools.getRepoLanguages("MyNote");
        System.out.println("Repo Languages: " + languages);
        
        assertNotNull(languages);
    }

    @Test
    void testGetRepoCommits() {
        Map<String, Object> commits = GitHubTools.getRepoCommits("MyNote", 3);
        System.out.println("Repo Commits: " + commits);
        
        assertNotNull(commits);
    }

    @Test
    void testListRepoContents() {
        List<Map<String, String>> contents = GitHubTools.listRepoContents("MyNote", "");
        System.out.println("Repo Contents: " + contents);
        
        assertNotNull(contents);
    }

    @Test
    void testGetContributionStats() {
        Map<String, Object> stats = GitHubTools.getContributionStats();
        System.out.println("Contribution Stats: " + stats);
        
        assertNotNull(stats);
    }

    @Test
    void testQueryPersonalInfo() {
        Map<String, Object> result = RAGTools.queryPersonalInfo("experience");
        System.out.println("Personal Info Query: " + result);
        
        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    @Test
    void testQueryProjects() {
        Map<String, Object> result = RAGTools.queryProjects("MyNote");
        System.out.println("Projects Query: " + result);
        
        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    @Test
    void testQueryBlogPosts() {
        Map<String, Object> result = RAGTools.queryBlogPosts("microservices");
        System.out.println("Blog Query: " + result);
        
        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    @Test
    void testSearchAllContent() {
        Map<String, Object> result = RAGTools.searchAllContent("Java");
        System.out.println("Search All: " + result);
        
        assertNotNull(result);
        assertTrue(result.containsKey("results"));
    }

    @Test
    void testListDocuments() {
        Map<String, Object> docs = RAGTools.listDocuments();
        System.out.println("Documents: " + docs);
        
        assertNotNull(docs);
        assertTrue((Integer) docs.get("total") > 0);
    }

    @Test
    void testGetContactCard() {
        Map<String, String> contact = UtilityTools.getContactCard();
        System.out.println("Contact Card: " + contact);
        
        assertNotNull(contact);
        assertTrue(contact.containsKey("email"));
        assertTrue(contact.containsKey("linkedin"));
        assertTrue(contact.containsKey("github"));
    }
}
