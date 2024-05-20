# realtime-bus-locator
Keiken Hackaton Mai 2024 project

# Geolocation Producer-Consumer App

This application consists of a Kafka producer and consumer designed to handle geolocation data. The producer receives geolocation information via HTTP and sends it to a Kafka topic. The consumer reads messages from the Kafka topic and sends them to another service.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup and Installation](#setup-and-installation)

## Prerequisites

- Java Development Kit (JDK) 8 or higher
- Apache Kafka and Zookeeper
- Maven
- curl (for testing HTTP endpoints)

## Setup and Installation

1. **Clone the repository:**
   ```sh
       git clone https://github.com/yourusername/realtime-geolocation.git
       cd realtime-geolocation

2.  **Run the App and kafka:**
    ```sh
      docker-compose up -d
3.  **Send a request to the Producer to handle it:**
    ```sh
      curl -X POST http://localhost:8080/geolocation -H "Content-Type: application/json" -d '{
     "location": {
       "longitude": "11,00099090",
       "attitude": "12,00002222"
     },"bus": {
    "direction": "terminus",
    "line_number": "12AEF"
        }
      }'
![Alt text](images/send-request.png)

![Alt text](images/kafka-topic.png)
