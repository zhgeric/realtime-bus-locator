import React, { useState } from 'react';
import { StyleSheet, View, Button,Text, Pressable } from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

export default function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);

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

    const subscription = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 500,
      distanceInterval: 1,
    }, (location) => {
      console.log(location);
      fetch('http://localhost:3000/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });
    });

    setLocationSubscription(subscription);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  return (
    <View style={styles.container}>
      <Picker
        style={styles.picker}
        selectedValue={selectedBus}
        onValueChange={(itemValue) => {
          setSelectedBus(itemValue);
          setSelectedDirection(null);
        }}
      >
        <Picker.Item label="Select a bus" value={null} />
        {Object.keys(buses).map((bus) => (
          <Picker.Item key={bus} label={bus} value={bus} />
        ))}
      </Picker>

      {selectedBus && (
        <Picker
          style={styles.picker}
          selectedValue={selectedDirection}
          onValueChange={(itemValue) => setSelectedDirection(itemValue)}
          disabled={!selectedBus}
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