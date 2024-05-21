/*package com.realtime;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

import static spark.Spark.*;

public class GeolocationProducer {
    private KafkaProducer<String, String> producer;
    private String topic = "geolocation";
    String bootstrapServers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");

    public GeolocationProducer() {
        // Configure Kafka Producer
        //String bootstrapServers = "localhost:9093";
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
*/

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
/*
    @WebSocket
    public static class GeolocationWebSocketHandler {
        @OnWebSocketConnect
        public void onConnect(Session session) {
            System.out.println("WebSocket connected: " + session.getRemoteAddress());
        }

        @OnWebSocketClose
        public void onClose(Session session, int statusCode, String reason) {
            System.out.println("WebSocket closed: " + session.getRemoteAddress());
        }

        @OnWebSocketMessage
        public void onMessage(Session session, String message) {
            KafkaProducer<String, String> producer = getKafkaProducer();
            String topic = "geolocation";
            ProducerRecord<String, String> record = new ProducerRecord<>(topic, message);
            producer.send(record, (metadata, exception) -> {
                if (exception != null) {
                    exception.printStackTrace();
                } else {
                    System.out.println("Message received: " + message);
                    System.out.println("Message sended");
                    System.out.println("Message sent to Kafka: " + message);
                }
            });
        }

        private KafkaProducer<String, String> getKafkaProducer() {
            Properties properties = new Properties();
            //String bootstrapServers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");
            String bootstrapServers = "localhost:9092";
            properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
            properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
            properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

            return new KafkaProducer<>(properties);
        }
    }*/
}
