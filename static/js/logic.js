// Create the tile layer that will be the background of our map.
let streetmap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});

// Initialize all the LayerGroups that we'll use.
let layers = {
  VERY_HIGH: new L.LayerGroup(),
  HIGH: new L.LayerGroup(),
  MEDIUM: new L.LayerGroup(),
  LOW: new L.LayerGroup(),
  VERY_LOW: new L.LayerGroup()
};

// Create the map with our layers.
let map = L.map("map-id", {
  center: [38, -145],
  zoom: 3,
  layers: [
    layers.VERY_HIGH,
    // layers.HIGH,
    // layers.MEDIUM,
    // layers.LOW,
    // layers.VERY_LOW
  ]
});

// Add our "streetmap" tile layer to the map.
streetmap.addTo(map);

// Create an overlays object to add to the layer control.
let overlays = {
  "Very High": layers.VERY_HIGH,
  "High": layers.HIGH,
  "Medium": layers.MEDIUM,
  "Low": layers.LOW,
  "Very Low": layers.VERY_LOW
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map.
let legend = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map.
legend.addTo(map);

// Initialize an object that contains icons for each layer group.
let icons = {
  VERY_HIGH: L.ExtraMarkers.icon({
    icon: "ion-alert",
    iconColor: "white",
    markerColor: "red",
    shape: "star"
  }),
  HIGH: L.ExtraMarkers.icon({
    icon: "ion-alert",
    iconColor: "white",
    markerColor: "orange-dark",
    shape: "star"
  }),
  MEDIUM: L.ExtraMarkers.icon({
    icon: "ion-android-warning",
    iconColor: "white",
    markerColor: "yellow",
    // shape: "circle"
  }),
  LOW: L.ExtraMarkers.icon({
    icon: "ion-android-sad",
    iconColor: "white",
    markerColor: "green",
    // shape: "circle"
  }),
  VERY_LOW: L.ExtraMarkers.icon({
    icon: "ion-android-sad",
    iconColor: "white",
    markerColor: "blue-dark",
    // shape: "penta"
  })
};

// Perform an API call to the Citi Bike station information endpoint.
d3.json("Resources/Microplastic.json").then(function(infoRes) {


  // let objID = infoRes.last_updated;
  // let stationStatus = statusRes.data.stations;
  let plasticsInfo = infoRes.layers[0].features;
  console.log(plasticsInfo);
  // Create an object to keep the number of markers in each layer.
  let plasticsCount = {
    VERY_HIGH: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    VERY_LOW: 0
  };
  console.log(plasticsInfo.length)
  // Initialize plasticSizeCode, which will be used as a key to access the appropriate layers, icons, and station count for the layer group.
  let plasticSizeCode;

  // Loop through the stations (they're the same size and have partially matching data).
  for (let i = 0; i < plasticsInfo.length; i+=10) {

    let sample = plasticsInfo[i].attributes;

    if (sample.DENSTEXT === "Very High") {
      plasticSizeCode = "VERY_HIGH";
    } 
    else if (sample.DENSTEXT === "High") {
      plasticSizeCode = "HIGH";
    } 
    else if (sample.DENSTEXT === "Medium") {
      plasticSizeCode = "MEDIUM";
    } 
    else if (sample.DENSTEXT === "Low") {
      plasticSizeCode = "LOW";
    } 
    else if (sample.DENSTEXT === "Very Low") {
      plasticSizeCode = "VERY_LOW";
    } 
    else {
      // Handle other cases if necessary
      plasticSizeCode = "UNKNOWN";
    }
    
    // // Update the size count.
    plasticsCount[plasticSizeCode]++;
    // // Create a new marker with the appropriate icon and coordinates.
    let newMarker = L.marker([sample.Latitude, sample.Longitude], {
      icon: icons[plasticSizeCode]
    });

    // Add the new marker to the appropriate layer.
    newMarker.addTo(layers[plasticSizeCode]);

    // // Bind a popup to the marker that will  display on being clicked. This will be rendered as HTML.
    newMarker.bindPopup("<h3>Object ID: " + sample.OBJECTID + "</h3>Sample Method: " + sample.SAMPMETHOD + "<br>Organization: " + sample.ORG + "<br>Latitude: " + sample.Latitude + "<br>Longitude: " + sample.Longitude);
  }
  console.log(plasticsCount);
  // Call the updateLegend function, which will update the legend!
  updateLegend(plasticsCount);
});

// Update the legend's innerHTML with the last updated time and station count.
function updateLegend(plasticsCount) {
  document.querySelector(".legend").innerHTML = [
    // "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
    "<p class='very-high'>Very High Counts: " + plasticsCount.VERY_HIGH + "</p>",
    "<p class='high'>High Counts: " + plasticsCount.HIGH + "</p>",
    "<p class='medium'>Medium Counts: " + plasticsCount.MEDIUM + "</p>",
    "<p class='low'>Low Counts: " + plasticsCount.LOW + "</p>",
    "<p class='very-low'>Very Low Counts: " + plasticsCount.VERY_LOW + "</p>",
  ].join("");
}
