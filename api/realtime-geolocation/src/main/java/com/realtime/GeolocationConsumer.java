package com.realtime;

import org.apache.http.client.HttpClient;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerConfig;

import org.eclipse.jetty.websocket.api.Session;

import java.util.Collections;
import java.util.Properties;
import java.util.Set;

import static com.realtime.GeolocationWebSocketHandler.channelSessions;

public class GeolocationConsumer {
    private KafkaConsumer<String, String> consumer;
    private Set<Session> sessions;
    private String topic = "geolocation";
    String groupId = "geolocation-group";
    String bootstrapServers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");

    public GeolocationConsumer(HttpClient httpClient) {
        // Kafka consumer configuration settings
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        this.consumer = new KafkaConsumer<>(props);

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
            // Iterate over all sessions in the "location" channel
            for (Session session : channelSessions.getOrDefault("location", Collections.emptySet())) {
                if (session.isOpen()) {
                    session.getRemote().sendString(jsonMessage);
                    System.out.println("Message sent to WebSocket channel: " + jsonMessage);
                }
            }
        } catch (Exception e) {
            System.err.println("Error while sending message to WebSocket channel: " + e.getMessage());
            e.printStackTrace();
        }
    }


    public void stop() {
        consumer.close();
    }

}
