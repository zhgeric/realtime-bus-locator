// Créer la carte
var map = L.map("map").setView([48.8066, 2.3022], 14);

var greenIcon = L.icon({
	iconSize: [38, 95], // size of the icon
	shadowSize: [50, 64], // size of the shadow
	iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
	shadowAnchor: [4, 62], // the same for the shadow
	popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

// Ajouter la couche de tuiles OpenStreetMap à la carte
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Charger le fichier GeoJSON et ajouter les marqueurs à la carte
fetch("stationspre.geojson")
	.then((response) => response.json())
	.then((data) => {
		L.geoJSON(data, {
			onEachFeature: function (feature, layer) {
				var popupContent =
					(feature.properties.name && feature.properties.name) ||
					(feature.properties.tags && feature.properties.tags.name);

				if (feature.busses) {
					feature.busses.forEach(function (bus) {
						popupContent +=
							`<div>Bus: ` +
							bus.line_number +
							`</div>
                            <div>Direction: ` +
							bus.direction +
							`</div>`;
					});
				}
				layer.bindPopup(popupContent);
			},
		}).addTo(map);
	})
	.catch((err) => {
		console.error("Erreur de chargement du GeoJSON :", err);
	});

var busIcon = L.icon({
	iconUrl: "bus.png",
    
	iconSize: [40, 50],
	iconAnchor: [20, 25],
	shadowUrl: null,
});

var routeLines = [
		L.polyline([
			[48.8018406, 2.3105945],
			[48.7969701, 2.2990987],
			[48.7969569, 2.2990891],
			[48.7968586, 2.2991707],
		]),
	],
	markers = [];

$.each(routeLines, function (i, routeLine) {
	var marker = L.animatedMarker(routeLine.getLatLngs(), {
		icon: busIcon,
		autoStart: false,
		onEnd: function () {
			$(this._shadow).fadeOut();
			$(this._icon).fadeOut(3000, function () {
				map.removeLayer(this);
			});
		},
	});
	map.addLayer(marker);
	markers.push(marker);
});
$(function () {
	$("#start").click(function () {
		console.log("start");
		$.each(markers, function (i, marker) {
			marker.start();
		});
	});
});
