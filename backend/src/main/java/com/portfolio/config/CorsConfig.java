package com.portfolio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String origins = EnvConfig.get("CORS_ALLOWED_ORIGINS", EnvConfig.get("cors.allowed-origins", ""));
        String methods = EnvConfig.get("CORS_ALLOWED_METHODS", EnvConfig.get("cors.allowed-methods", "GET,POST,DELETE,OPTIONS"));
        String headers = EnvConfig.get("CORS_ALLOWED_HEADERS", EnvConfig.get("cors.allowed-headers", "*"));

        String[] originList = splitCsv(origins);
        String[] methodList = splitCsv(methods);
        String[] headerList = splitCsv(headers);

        registry.addMapping("/**")
                .allowedOrigins(originList.length > 0 ? originList : new String[0])
                .allowedMethods(methodList.length > 0 ? methodList : new String[]{"GET", "POST", "DELETE", "OPTIONS"})
                .allowedHeaders(headerList.length > 0 ? headerList : new String[]{"*"});
    }

    private String[] splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return new String[0];
        }
        return java.util.Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .toArray(String[]::new);
    }
}
