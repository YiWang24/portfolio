package com.portfolio.service;

import com.google.adk.agents.RunConfig;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.portfolio.agent.PortfolioAgents;
import io.reactivex.rxjava3.core.Flowable;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AgentService {

    private InMemoryRunner runner;
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        runner = new InMemoryRunner(PortfolioAgents.getRootAgent());
        System.out.println("[AgentService] InMemoryRunner initialized");
    }

    public String processMessage(String sessionId, String message) {
        try {
            Session session = sessions.computeIfAbsent(sessionId, id ->
                    runner.sessionService().createSession(runner.appName(), id).blockingGet()
            );

            Content userMsg = Content.fromParts(Part.fromText(message));
            RunConfig config = RunConfig.builder().build();
            Flowable<Event> events = runner.runAsync(session.userId(), session.id(), userMsg, config);

            StringBuilder response = new StringBuilder();
            events.blockingForEach(event -> {
                if (event.finalResponse()) {
                    response.append(event.stringifyContent());
                }
            });

            return response.length() > 0 ? response.toString() : generateFallbackResponse(message);
        } catch (Exception e) {
            e.printStackTrace();
            return generateFallbackResponse(message);
        }
    }

    public Flowable<Event> processMessageStream(String sessionId, String message) {
        try {
            Session session = sessions.computeIfAbsent(sessionId, id ->
                    runner.sessionService().createSession(runner.appName(), id).blockingGet()
            );

            Content userMsg = Content.fromParts(Part.fromText(message));
            RunConfig config = RunConfig.builder()
                    .setStreamingMode(RunConfig.StreamingMode.SSE)
                    .build();
            return runner.runAsync(session.userId(), session.id(), userMsg, config);
        } catch (Exception e) {
            return Flowable.error(e);
        }
    }

    private String generateFallbackResponse(String message) {
        return "I'm here to help you learn about my background, skills, and projects. Feel free to ask anything!";
    }

    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
    }
}
