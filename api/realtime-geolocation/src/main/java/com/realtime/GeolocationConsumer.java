package com.realtime;

import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerConfig;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;

import java.util.Collections;
import java.util.Properties;

public class GeolocationConsumer {
    private KafkaConsumer<String, String> consumer;
    private HttpClient httpClient;
    private String topic = "geolocation";

    public GeolocationConsumer(HttpClient httpClient) {
        // Kafka consumer configuration settings
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9093"); // Update with your Kafka broker address
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "geolocation-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        this.consumer = new KafkaConsumer<>(props);
        this.httpClient = httpClient;

        // Subscribe to the topic
        this.consumer.subscribe(Collections.singletonList(topic));
    }

    public void start() {
        // Consume messages indefinitely
        while (true) {
            ConsumerRecords<String, String> records = consumer.poll(100);
            for (ConsumerRecord<String, String> record : records) {
                System.out.println("Received message: " + record.value());
                sendGeolocationInformation(record.value());
            }
        }
    }

    private void sendGeolocationInformation(String jsonMessage) {
        try {
            String url = "http://localhost:3000/geolocation";
            HttpPost httpPost = new HttpPost(url);

            StringEntity jsonEntity = new StringEntity(jsonMessage);
            httpPost.setEntity(jsonEntity);
            httpPost.setHeader("Content-Type", "application/json");

            HttpResponse response = httpClient.execute(httpPost);

            if (response.getStatusLine().getStatusCode() == 200) {
                System.out.println("Message successfully sent to other service.");
            } else {
                System.err.println("Failed to send message to other service. Status code: " + response.getStatusLine().getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Error while sending message to other service: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void stop() {
        consumer.close();
    }
}
