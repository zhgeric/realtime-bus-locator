package com.realtime;

import static spark.Spark.awaitInitialization;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

import static spark.Spark.port;
import static spark.Spark.post;

public class GeolocationProducer {
    private KafkaProducer<String, String> producer;
    private String topic = "geolocation";

    public GeolocationProducer() {
        // Configure Kafka Producer
        String bootstrapServers = "localhost:9093";
        Properties properties = new Properties();
        properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        producer = new KafkaProducer<>(properties);

        // Configure HTTP server
        port(8080);
        post("/geolocation", (request, response) -> {
            String jsonMessage = request.body();
            ProducerRecord<String, String> record = new ProducerRecord<>(topic, jsonMessage);
            producer.send(record);
            return "Message received and sent to Kafka";
        });
    }

    public void start() {
        // Start the Spark server (blocking call)
        awaitInitialization();
    }

    public void stop() {
        producer.close();
        stop();
    }
}
