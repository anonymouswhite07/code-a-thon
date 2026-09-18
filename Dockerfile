# =======================================================
# Multi-Stage Unified Dockerfile for Render Deployment
# Bundles: Spring Boot 3 Backend + GCC + OpenJDK 17 + Python 3 Runner
# =======================================================

# Stage 1: Build Spring Boot Backend JAR with Maven & JDK 17
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /build

# Cache Maven dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package application
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Unified Lightweight Alpine Runtime
FROM alpine:3.19

# Install compilers, interpreters, and runtime tools
RUN apk add --no-cache \
    openjdk17-jre \
    openjdk17 \
    gcc \
    g++ \
    musl-dev \
    python3 \
    nodejs \
    curl

WORKDIR /app

# Copy Code-Runner service
COPY code-runner /app/runner

# Copy compiled Spring Boot JAR from builder
COPY --from=backend-builder /build/target/*.jar /app/app.jar

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose Render's default web port and internal runner port
EXPOSE 8080 5050

CMD ["/app/start.sh"]
