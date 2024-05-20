package com.realtime;

import org.apache.http.impl.client.CloseableHttpClient;

import org.apache.http.impl.client.HttpClients;

public class GeolocationApp {
    public static void main(String[] args) {

        CloseableHttpClient httpClient = HttpClients.createDefault();

        // Start the producer in a separate thread
        Thread producerThread = new Thread(() -> {
            GeolocationProducer producer = new GeolocationProducer();
            producer.start();
        });

        // Start the consumer in a separate thread
        Thread consumerThread = new Thread(() -> {
            GeolocationConsumer consumer = new GeolocationConsumer(httpClient);
            consumer.start();
        });

        producerThread.start();
        consumerThread.start();

        // Optionally wait for both threads to finish (this is optional depending on your use case)
        try {
            producerThread.join();
            consumerThread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
