package com.portfolio;

import com.portfolio.tools.KnowledgeTools;
import org.junit.jupiter.api.*;
import java.nio.file.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class KnowledgeToolsTest {

    @Test
    @Order(1)
    void testSemanticSearch() {
        Map<String, Object> result = KnowledgeTools.semanticSearch("AI 大语言模型", 3);
        System.out.println("[语义搜索] " + result);
        assertNotNull(result.get("results"));
        assertTrue((Integer) result.get("total") >= 0);
    }

    @Test
    @Order(2)
    void testSearchByCategory() {
        Map<String, Object> result = KnowledgeTools.searchByCategory("blog", "微服务");
        System.out.println("[分类搜索-blog] " + result);
        assertNotNull(result.get("results"));
        assertEquals("blog", result.get("category"));
    }

    @Test
    @Order(3)
    void testSearchProjects() {
        Map<String, Object> result = KnowledgeTools.searchByCategory("projects", "Java");
        System.out.println("[分类搜索-projects] " + result);
        assertNotNull(result.get("results"));
    }

    @Test
    @Order(4)
    void testListKnowledgeBase() {
        Map<String, Object> result = KnowledgeTools.listKnowledgeBase();
        System.out.println("[知识库列表] " + result);
        assertTrue((Integer) result.get("total") > 0);
        assertNotNull(result.get("documents"));
    }

    @Test
    @Order(5)
    void testRefreshIndex() {
        Map<String, Object> result = KnowledgeTools.refreshIndex();
        System.out.println("[刷新索引] " + result);
        assertEquals("refreshed", result.get("status"));
        assertTrue((Integer) result.get("documents") > 0);
    }

    @Test
    @Order(6)
    void testWebSearchWithoutKey() {
        Map<String, Object> result = KnowledgeTools.webSearch("Java 21 features", 3);
        System.out.println("[联网搜索] " + result);
        assertNotNull(result);
        assertTrue(result.containsKey("results") || result.containsKey("error"));
    }

    @Test
    @Order(10)
    void testFileWatcherNewFile() throws Exception {
        Path testFile = Paths.get("../content/blog/test-watcher.md");
        Files.writeString(testFile, "# Test Watcher\n\nUnique content for file watcher test.");
        
        Thread.sleep(2000);
        
        Map<String, Object> result = KnowledgeTools.semanticSearch("Unique content watcher", 1);
        System.out.println("[文件监控-新增] " + result);
        
        Files.deleteIfExists(testFile);
        Thread.sleep(1500);
        System.out.println("[文件监控-删除] 完成");
    }
}
