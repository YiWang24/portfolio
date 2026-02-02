package com.portfolio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for asynchronous task execution
 * Used by API logging service to avoid blocking API responses
 */
@Configuration
public class AsyncConfig {

    /**
     * Thread pool executor for async API logging
     * Configured with conservative limits to prevent resource exhaustion
     */
    @Bean(name = "apiLoggingExecutor")
    public Executor apiLoggingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Core pool size: number of threads to keep alive
        executor.setCorePoolSize(2);

        // Max pool size: maximum number of threads allowed
        executor.setMaxPoolSize(10);

        // Queue capacity: how many tasks to queue before creating new threads
        executor.setQueueCapacity(1000);

        // Thread name prefix for easy debugging
        executor.setThreadNamePrefix("api-logging-");

        // Shutdown: wait for tasks to complete
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);

        // Initialize the executor
        executor.initialize();

        return executor;
    }
}
