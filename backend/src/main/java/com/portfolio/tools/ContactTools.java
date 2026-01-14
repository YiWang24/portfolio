package com.portfolio.tools;

import com.google.adk.tools.Annotations.Schema;
import com.portfolio.service.ContactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ContactTools {

    private static final Logger log = LoggerFactory.getLogger(ContactTools.class);
    private static final ContactService contactService = new ContactService();

    @Schema(description = "Send a contact message from a visitor to Yi Wang via email. Use this when the user wants to reach out, leave a message, or contact Yi Wang.")
    public static String sendContactMessage(
            @Schema(name = "replyTo", description = "The visitor's email address for Yi Wang to reply to. Use 'anonymous@visitor.com' if not provided.") String replyTo,
            @Schema(name = "message", description = "The message content the visitor wants to send") String message
    ) {
        try {
            String email = (replyTo == null || replyTo.isBlank()) ? "anonymous@visitor.com" : replyTo;
            String emailId = contactService.sendContactMessage(email, message);
            log.info("Contact message sent successfully: emailId={}, replyTo={}", emailId, email);
            
            if (email.equals("anonymous@visitor.com")) {
                return "Message sent successfully! However, Yi Wang won't be able to reply since no email was provided. If you'd like a response, please share your email.";
            }
            return "Message sent successfully! Yi Wang will get back to you soon at " + email;
        } catch (Exception e) {
            log.error("Failed to send contact message: replyTo={}, error={}", replyTo, e.getMessage());
            return "Sorry, I couldn't send the message right now. Please try again later or reach out directly via the contact information on the website.";
        }
    }
}
