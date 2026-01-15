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

}
