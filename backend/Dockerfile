# Multi-stage Dockerfile for Spring Boot Backend
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source and build production artifact
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot server port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
