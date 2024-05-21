package com.realtime;

import org.apache.kafka.clients.producer.KafkaProducer;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import spark.Spark;

import java.util.Properties;

public class GeolocationProducer {
    private KafkaProducer<String, String> producer;
    private String topic = "geolocation";
    String bootstrapServers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");
   //String bootstrapServers = "localhost:9092";
    public GeolocationProducer() {
        // Configure Kafka Producer
        Properties properties = new Properties();
        properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        producer = new KafkaProducer<>(properties);

        // Configure WebSocket server
        Spark.port(8080);
        Spark.webSocket("/geolocation", GeolocationWebSocketHandler.class);
        Spark.init();
    }

    public void start() {
        // Start the Spark server (blocking call)
        Spark.awaitInitialization();
    }

    public void stop() {
        producer.close();
        Spark.stop();
    }
}
