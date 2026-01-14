package com.portfolio;

import com.portfolio.service.ContactService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ContactEmailIntegrationTest {

    @Test
    @EnabledIfEnvironmentVariable(named = "RESEND_API_KEY", matches = ".+")
    @EnabledIfEnvironmentVariable(named = "RESEND_FROM", matches = ".+")
    @EnabledIfEnvironmentVariable(named = "CONTACT_EMAIL", matches = ".+")
    void sendContactMessageReturnsResendId() throws Exception {
        ContactService service = new ContactService();

        String result = service.sendContactMessage(
                "contact-test@example.com",
                "Contact form test " + Instant.now()
        );

        assertNotNull(result);
        assertFalse(result.isBlank());
    }
}
