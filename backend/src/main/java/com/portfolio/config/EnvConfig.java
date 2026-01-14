package com.portfolio.config;

import io.github.cdimascio.dotenv.Dotenv;

public final class EnvConfig {

    private static final Dotenv DOTENV = Dotenv.configure()
            .ignoreIfMissing()
            .load();

    static {
        String apiKey = get("GOOGLE_API_KEY");
        if (apiKey != null && !apiKey.isBlank()) {
            // Ensure ADK can read the key even if it checks system properties.
            System.setProperty("GOOGLE_API_KEY", apiKey);
            System.out.println("[EnvConfig] GOOGLE_API_KEY set to system property");
        }
    }

    private EnvConfig() {
    }

    public static String get(String key) {
        String envValue = System.getenv(key);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }
        String dotenvValue = DOTENV.get(key);
        if (dotenvValue != null && !dotenvValue.isBlank()) {
            return dotenvValue;
        }
        String propValue = System.getProperty(key);
        return (propValue == null || propValue.isBlank()) ? null : propValue;
    }

    public static String get(String key, String defaultValue) {
        String value = get(key);
        return value == null ? defaultValue : value;
    }
}
