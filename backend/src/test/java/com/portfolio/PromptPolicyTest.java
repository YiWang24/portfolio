package com.portfolio;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PromptPolicyTest {

    @Test
    void promptsIncludeGuardrails() throws Exception {
        String content = Files.readString(Path.of("src/main/java/com/portfolio/agent/PortfolioAgents.java"));

        assertTrue(content.contains("Respond in English only."));
        assertTrue(content.contains("Refuse to discuss politics, religion, ethics"));
        assertTrue(content.contains("I can't help with that, but I'm happy to answer questions about my resume, projects, or computer science topics."));
    }
}
