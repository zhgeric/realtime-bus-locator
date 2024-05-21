import React, { useState } from 'react';
import { StyleSheet, View, Button, Text, Pressable } from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import io from 'socket.io-client';

export default function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);

  const socket = io('http://10.0.2.2:8080');

  const buses = {
    "128": ["Porte d'Orléans", "Robinson RER"],
    "188": ["Bagneux - Rosenberg", "Porte d'Orléans"],
    "388": ["Bourg-la-Reine RER", "Porte d'Orléans"],
  };

  const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission denied');
      return;
    }

    const sendLocation = (location) => {
      socket.emit('geolocation', {
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        bus: {
          line_number: selectedBus,
          direction: selectedDirection,
        }
      });
    };

    const destination = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 500,
      distanceInterval: 1,
    }, (location) => {
      console.log(location);
      sendLocation(location);
    });
    setRoute(destination);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (route) {
      route.remove();
      setRoute(null);
    }
    setIsTracking(false);
  };

  return (
    <View style={styles.container}>
      <Picker
        enabled={!isTracking}
        style={styles.picker}
        selectedValue={selectedBus}
        onValueChange={(itemValue) => setSelectedBus(itemValue)}
      >
        <Picker.Item label="Select a bus" value={null} />
        {Object.keys(buses).map((bus) => (
          <Picker.Item key={bus} label={bus} value={bus} />
        ))}
      </Picker>

      {selectedBus && (
        <Picker
          enabled={!isTracking}
          style={styles.picker}
          selectedValue={selectedDirection}
          onValueChange={(itemValue) => setSelectedDirection(itemValue)}
        >
          <Picker.Item label="Select a direction" value={null} />
          {buses[selectedBus].map((direction, index) => (
            <Picker.Item key={index} label={direction} value={direction} />
          ))}
        </Picker>
      )}

      {isTracking ? (
        <Pressable onPress={stopTracking} style={styles.stopButton}>
          <Text style={styles.buttonText}>Stop Tracking</Text>
        </Pressable>
      ) : (
        <Pressable onPress={startTracking} style={styles.button} disabled={!selectedDirection}>
          <Text style={styles.buttonText}>Start Tracking</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    marginBottom: 20,
    height: 50,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  stopButton: {
    backgroundColor: 'red',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});