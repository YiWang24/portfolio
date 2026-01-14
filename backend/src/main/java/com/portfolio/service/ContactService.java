package com.portfolio.service;

import com.portfolio.config.EnvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);
    private static final String RESEND_BASE_URL = "https://api.resend.com";

    private final WebClient webClient;
    private final String apiKey;
    private final String fromAddress;
    private final String toAddress;
    private final String subject;

    public ContactService() {
        this.apiKey = EnvConfig.get("RESEND_API_KEY", "");
        this.fromAddress = EnvConfig.get("RESEND_FROM");
        this.toAddress = EnvConfig.get("CONTACT_EMAIL");
        this.subject = EnvConfig.get("CONTACT_SUBJECT", "Portfolio contact");

        this.webClient = WebClient.builder()
                .baseUrl(RESEND_BASE_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String sendContactMessage(String replyTo, String message) {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is not configured");
        }
        if (fromAddress == null || fromAddress.isBlank()) {
            throw new IllegalStateException("RESEND_FROM is not configured");
        }
        if (toAddress == null || toAddress.isBlank()) {
            throw new IllegalStateException("CONTACT_EMAIL is not configured");
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("from", fromAddress);
        requestBody.put("to", List.of(toAddress));
        requestBody.put("subject", subject);
        requestBody.put("text", buildBody(replyTo, message));
        requestBody.put("reply_to", replyTo);

        ResendEmailResponse response = webClient.post()
                .uri("/emails")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse ->
                        clientResponse.bodyToMono(String.class).flatMap(body -> {
                            log.warn("Resend API error: status={}, body={}", clientResponse.statusCode(), body);
                            return Mono.error(new IllegalStateException("Resend API error"));
                        }))
                .bodyToMono(ResendEmailResponse.class)
                .block();

        if (response == null || response.id() == null || response.id().isBlank()) {
            throw new IllegalStateException("Resend API response missing id");
        }

        return response.id();
    }

    private String buildBody(String replyTo, String message) {
        StringBuilder body = new StringBuilder();
        body.append("From: ").append(replyTo).append("\n\n");
        body.append(message);
        return body.toString();
    }

    private record ResendEmailResponse(String id) {
    }
}
