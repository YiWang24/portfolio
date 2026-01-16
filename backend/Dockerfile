# Multi-stage build for Portfolio Backend
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first for better layer caching
COPY mvnw pom.xml ./
COPY .mvn/ .mvn/

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests -B && \
    mv target/*.jar target/app.jar

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init tzdata && \
    # Set timezone to UTC
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    # Create non-root user
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/app.jar ./app.jar

# Create directory for content volume
RUN mkdir -p /app/content && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

# Optimized for 1GB server - use aggressive memory settings
CMD ["java", \
     "-XX:+UseContainerSupport", \
     "-XX:MaxRAMPercentage=60.0", \
     "-XX:MinRAMPercentage=40.0", \
     "-XX:+UseG1GC", \
     "-XX:+UseStringDeduplication", \
     "-XX:MaxGCPauseMillis=200", \
     "-XX:+ExplicitGCInvokesConcurrent", \
     "-XX:+HeapDumpOnOutOfMemoryError", \
     "-XX:HeapDumpPath=/tmp/heapdump.hprof", \
     "-Djava.security.egd=file:/dev/./urandom", \
     "-Dspring.jmx.enabled=false", \
     "-jar", "app.jar"]
