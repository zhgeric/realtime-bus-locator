
import com.realtime.GeolocationConsumer;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.StatusLine;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class GeolocationConsumerTest {

    @Mock
    private KafkaConsumer<String, String> consumer;

    @Mock
    private CloseableHttpClient httpClient;

    @Mock
    private CloseableHttpResponse httpResponse;

    @Mock
    private StatusLine statusLine;

    private GeolocationConsumer geolocationConsumer;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        geolocationConsumer = new GeolocationConsumer(httpClient);
    }

    @Test
    public void testConsumerReceivesMessage() throws Exception {
        // Read JSON file content
        String jsonMessage = new String(Files.readAllBytes(Paths.get("src/test/resources/geolocation.json")));
        System.out.println("JSON Message: " + jsonMessage); // Debugging statement

        // Create a ConsumerRecord with the JSON message
        ConsumerRecord<String, String> record = new ConsumerRecord<>("geolocation", 0, 0L, null, jsonMessage);
        TopicPartition topicPartition = new TopicPartition("geolocation", 0);
        ConsumerRecords<String, String> records = new ConsumerRecords<>(Collections.singletonMap(topicPartition, Collections.singletonList(record)));

        // Mock the Kafka consumer to return the records
        when(consumer.poll(anyLong())).thenReturn(records);
        when(httpClient.execute(any(HttpPost.class))).thenReturn(httpResponse);
        when(httpResponse.getStatusLine()).thenReturn(statusLine);
        when(statusLine.getStatusCode()).thenReturn(200);

        // Debugging: Check if the mocks are set correctly
        System.out.println("Consumer mock: " + (consumer != null));
        System.out.println("HTTP Client mock: " + (httpClient != null));
        System.out.println("HTTP Response mock: " + (httpResponse != null));
        System.out.println("Status Line mock: " + (statusLine != null));

        // Run the start method in a separate thread to simulate the consumer loop
        Thread consumerThread = new Thread(() -> {
            try {
                geolocationConsumer.start();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        consumerThread.start();

        // Allow some time for the consumer loop to process the record
        Thread.sleep(1000);
        consumerThread.interrupt(); // Stop the consumer loop

        // Capture the HTTP POST request
        ArgumentCaptor<HttpPost> httpPostCaptor = ArgumentCaptor.forClass(HttpPost.class);
        verify(httpClient, times(1)).execute(httpPostCaptor.capture());
        HttpPost httpPost = httpPostCaptor.getValue();

        // Debugging: Check if the HTTP POST request is captured
        System.out.println("HTTP Post captured: " + (httpPost != null));

        // Verify the URL of the HTTP POST request
        assertEquals("http://localhost:3000/geolocation", httpPost.getURI().toString());

        // Verify the content of the HTTP POST request
        StringEntity entity = (StringEntity) httpPost.getEntity();
        String actualContent = new String(entity.getContent().readAllBytes());
        assertEquals(jsonMessage, actualContent);

        // Verify that the response status line was accessed
        verify(httpResponse, times(1)).getStatusLine();
    }
}
