# Stage 1: Build the Spring Boot application
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy gradle wrapper and config files
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Fix execute permissions for gradlew
RUN chmod +x gradlew

# Pre-fetch dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy application source code
COPY src src

# Build executable jar without running tests
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Runtime environment
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create a non-root application user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Set permissions
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
