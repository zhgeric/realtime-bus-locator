# Use an official Maven image to build the application
FROM maven:3.8.1-openjdk-11-slim AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application
RUN mvn clean package -DskipTests

# Use an official OpenJDK image to run the application
FROM openjdk:11-jre-slim
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/target/realtime-geolocation.jar /app/realtime-geolocation.jar

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "realtime-geolocation.jar"]
