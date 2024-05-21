// Créer la carte
import { io } from "socket.io-client";
import geojson from "./stationspre.json" assert { type: "json" };

const socket = io("http://localhost:3000");

let map = L.map("map").setView([48.8066, 2.3022], 14);

let busIcon = L.Icon.extend({
	options: {
		shadowUrl: "./busIcon/bus.png",
		iconSize: [40, 50],
		iconAnchor: [20, 25],
		shadowUrl: null,
	},
});

let icons = {
	128: new busIcon({ iconUrl: "./busIcon/128bus.png" }),
	188: new busIcon({ iconUrl: "./busIcon/188bus.png" }),
	388: new busIcon({ iconUrl: "./busIcon/388bus.png" }),
	391: new busIcon({ iconUrl: "./busIcon/391bus.png" }),
};

let busImgs = {
	128: "./busIcon/128bus.png",
	188: "./busIcon/188bus.png",
	388: "./busIcon/388bus.png",
	391: "./busIcon/391bus.png",
};

// Ajouter la couche de tuiles OpenStreetMap à la carte
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Charger le fichier GeoJSON et ajouter les marqueurs à la carte
let busMarker;
L.geoJSON(geojson, {
	onEachFeature: function (feature, layer) {
		const div = document.createElement("div");
		const bus_station_name = document.createElement("p");
		bus_station_name.innerHTML = `${
			(feature.properties.name && feature.properties.name) ||
			(feature.properties.tags && feature.properties.tags.name)
		}<br>`;
		bus_station_name.classList.add("bus-station__name");
		div.append(bus_station_name);
		if (feature.busses) {
			feature.busses.forEach(function (bus) {
				const busDiv = document.createElement("div");
				busDiv.classList.add("bus-direction")
				const button = document.createElement("button");
				button.innerHTML = `<img height="25" src="${busImgs[bus.line_number]}"/>${bus.line_number}`;
				button.classList.add("bus-button")

				busDiv.onclick = function () {
					const channel = (bus.direction + bus.line_number)
						.toLowerCase()
						.replace(" ", "_");

					busMarker && map.removeLayer(busMarker);
					socket.removeAllListeners();

					track = true;

					socket.on(channel, (msg) => {
						const location = JSON.parse(msg).location;
						busMarker && map.removeLayer(busMarker);
						busMarker = L.marker(
							[location.latitude, location.longitude],
							{
								icon: icons[bus.line_number],
							}
						)
							.addTo(map)
							.on("click", () => (track = true));
						centerOnMarker(busMarker);
					});
				};

				const direction = document.createElement("div");
				direction.innerHTML = bus.direction;

				busDiv.appendChild(button);
				busDiv.appendChild(direction);

				div.appendChild(busDiv);
			});
		}
		layer.bindPopup(div);
	},
}).addTo(map);

let track = false;

const centerOnMarker = (busMark) => {
	if (track) map.setView(busMark.getLatLng());
};

$(document.body).on("mousedown", (event) => {
	track = false;
});
