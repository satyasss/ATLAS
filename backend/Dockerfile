# syntax=docker/dockerfile:1
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
RUN addgroup -S atlas && adduser -S atlas -G atlas

COPY --from=build --chown=atlas:atlas /app/target/*.jar app.jar

USER atlas

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
