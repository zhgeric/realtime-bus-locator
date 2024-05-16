import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissiondenied');
        return;
      }

      Location.watchPositionAsync({
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
    })();
  }, []);

  return (
    <View>
      <Text>app</Text>
    </View>
  );
}