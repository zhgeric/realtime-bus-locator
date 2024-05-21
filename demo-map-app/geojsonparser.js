import myJson from "./full.json" assert { type: "json" };
import stationPre from "./stationspre.json" assert { type: "json" };
import fs from "node:fs";

const parseJson = () => {
	let data = myJson.features;

	let relation = data.find((feature) => feature.id.includes("relation"));
	const { ref, to } = relation.properties;

	let filteredData = data.filter(
		(feature) => feature.properties.highway == "bus_stop"
	);

	const line_number = ref;
	const direction = to;

	const finalData = filteredData.map((station) => {
		const name =
			(station.properties.name && station.properties.name) ||
			(station.properties.tags && station.properties.tags.name);

		const finish = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: station.geometry.coordinates,
			},
			busses: [
				{
					direction: direction,
					line_number: line_number,
				},
			],
			properties: {
				name: name,
			},
		};

		return finish;
	});

	fs.writeFile(
		`./stations/${
			line_number + direction.toLowerCase().replaceAll(" ", "_")
		}.json`,
		JSON.stringify(finalData),
		(err) => {
			if (err) {
				console.error(err);
			} else {
				// file written successfully
			}
		}
	);
};

// parseJson()

const deleteDuplicateStations = () => {
	let data = stationPre.features;
	const uniqueStations = [
		...new Map(data.map((v) => [v.geometry.coordinates[1], v])).values(),
	];

	data.filter((x, i) => {
		if (!uniqueStations.includes(x)) {
			const tmp = uniqueStations.find(
				(v) => x.geometry.coordinates[0] == v.geometry.coordinates[0]
			);
			tmp.busses.push(...x.busses);
		}
	});

    stationPre.features = uniqueStations;

    fs.writeFile(
		`stationspre.json`,
		JSON.stringify(stationPre),
		(err) => {
			if (err) {
				console.error(err);
			} else {
				// file written successfully
			}
		}
	);
};

// deleteDuplicateStations();