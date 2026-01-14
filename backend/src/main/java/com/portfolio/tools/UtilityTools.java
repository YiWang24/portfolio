package com.portfolio.tools;

import com.google.adk.tools.Annotations.Schema;
import com.portfolio.config.EnvConfig;
import java.util.Map;

public class UtilityTools {

    @Schema(description = "Get contact information card with email, LinkedIn, and scheduling link")
    public static Map<String, String> getContactCard() {
        return Map.of(
                "email", EnvConfig.get("CONTACT_EMAIL", "contact@example.com"),
                "linkedin", EnvConfig.get("LINKEDIN_URL", "https://linkedin.com/in/yourprofile"),
                "github", "https://github.com/" + EnvConfig.get("GITHUB_USERNAME", ""),
                "calendly", EnvConfig.get("CALENDLY_URL", "https://calendly.com/yourprofile")
        );
    }
}
