import React, { useEffect, useState } from "react";
import { StyleSheet, View, Button, Text, Pressable } from "react-native";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { io } from "socket.io-client";

export const socket = io("http://192.168.1.20:3000");

export default function App() {
	const [isTracking, setIsTracking] = useState(false);
	const [route, setRoute] = useState(null);
	const [selectedBus, setSelectedBus] = useState(null);
	const [selectedDirection, setSelectedDirection] = useState(null);

	const [isConnected, setIsConnected] = useState(false);
	const [transport, setTransport] = useState("N/A");

	useEffect(() => {
		if (socket.connected) {
			onConnect();
		}

		function onConnect() {
			setIsConnected(true);
			setTransport(socket.io.engine.transport.name);

			socket.io.engine.on("upgrade", (transport) => {
				setTransport(transport.name);
			});
		}

		function onDisconnect() {
			setIsConnected(false);
			setTransport("N/A");
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
		};
	}, []);

	const buses = {
		128: ["Porte d'Orléans", "Robinson RER"],
		188: ["Rosenberg", "Porte d'Orléans"],
		388: ["Bourg-la-Reine RER", "Porte d'Orléans"],
		391: ["Gare de Vanves–Malakoff", "Pont Royal RER (Bagneux)"],
	};

	const startTracking = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.error("Permission denied");
			return;
		}

		const sendLocation = (location, busNumber, direction) => {
			const currentLocation = JSON.stringify({
				location: {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
				},
				bus: {
					line_number: busNumber,
					direction: direction,
				},
			});
			socket.emit("location", currentLocation);
		};

		const destination = await Location.watchPositionAsync(
			{
				accuracy: Location.Accuracy.High,
				timeInterval: 500,
				distanceInterval: 1,
			},
			(location) => {
				sendLocation(location, selectedBus, selectedDirection);
			}
		);
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
					onValueChange={(itemValue) =>
						setSelectedDirection(itemValue)
					}
				>
					<Picker.Item label="Select a direction" value={null} />
					{buses[selectedBus].map((direction, index) => (
						<Picker.Item
							key={index}
							label={direction}
							value={direction}
						/>
					))}
				</Picker>
			)}

			{isTracking ? (
				<Pressable onPress={stopTracking} style={styles.stopButton}>
					<Text style={styles.buttonText}>Stop Tracking</Text>
				</Pressable>
			) : (
				<Pressable
					onPress={startTracking}
					style={styles.button}
					disabled={!selectedDirection}
				>
					<Text style={styles.buttonText}>Start Tracking</Text>
				</Pressable>
			)}
			<View
				style={{
					position: "absolute",
					bottom: 5,
					right: 5,
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
					gap: 5,
				}}
			>
				<Text
					style={[
						isConnected
							? { backgroundColor: "green" }
							: { backgroundColor: "red" },
						{ height: 10, width: 10, borderRadius: 50 },
					]}
				>
					.
				</Text>
				<Text style={{ lineHeight: 17 }}>
					{isConnected ? "Connected" : "Disconnected"}
				</Text>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	picker: {
		marginBottom: 20,
		height: 50,
	},
	button: {
		backgroundColor: "#007BFF",
		padding: 10,
		alignItems: "center",
		borderRadius: 5,
	},
	stopButton: {
		backgroundColor: "red",
		padding: 10,
		alignItems: "center",
		borderRadius: 5,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
});
