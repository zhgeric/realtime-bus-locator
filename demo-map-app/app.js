// Créer la carte
var map = L.map('map').setView([48.8566, 2.3522], 12);

// Ajouter la couche de tuiles OpenStreetMap à la carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Charger le fichier GeoJSON et ajouter les marqueurs à la carte
fetch('stationspre.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
        

            onEachFeature: function(feature, layer) {
                console.log(data);

                var popupContent = '';
                if (feature.busses) {
                    feature.busses.forEach(function(bus) {
                        popupContent +='Direction: ' + bus.direction + ', Line Number: ' + bus.line_number + '<br>';
                       console.log(feature.properties.busses);
                    });
                }
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    })
    .catch(err => {
        console.error('Erreur de chargement du GeoJSON :', err);
    });

