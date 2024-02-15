// Create the tile layer that will be the background of our map.
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map.
let myMap = L.map("map", {
    center: [40, -110],
    zoom: 5
  });

streetmap.addTo(myMap);

let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

function createMarkers(response) {

    let earthquakes = response.features;

    let eqMarkers = [];

    // Set range for depth
    let depth_min = -10;
    let depth_max = 80;

    for (let index=0; index<earthquakes.length; index++) {

        quake = earthquakes[index]
        
        // Set coordinates
        let lat = quake.geometry.coordinates[1];
        let long = quake.geometry.coordinates[0];
        let located = quake.properties.place;
 
        // Set fillColor based on depth
        let depth = quake.geometry.coordinates[2];
        let fillColor = chroma.scale(['green', 'yellow', 'red']).domain([depth_min, depth_max])(depth).hex();

        // Set radius based on magnitude
        let magnitude = quake.properties.mag;
        let radius = magnitude*10000;

        let eqCircle = L.circle([lat, long], {
            color: fillColor,
            fillColor: fillColor,
            fillOpacity: 0.75,
            radius: radius
          })
          .bindPopup("<h3>Located: " + located + "<h3><h3>Magnitude: " + magnitude + "<h3><h3>Depth: " + depth + " km</h3>");

        // Add the circle to the eqMarkers array and the map.
        eqMarkers.push(eqCircle);
        eqCircle.addTo(myMap)

    }

    // Create function to add legend to map
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
      let first_third = Math.round(depth_min + (depth_max-depth_min)*0.333);
      let sec_third = Math.round(depth_min + (depth_max-depth_min)*0.666);
      let first_col = chroma.scale(['green', 'yellow', 'red']).domain([depth_min, depth_max])(depth_min).hex();
      let sec_col = chroma.scale(['green', 'yellow', 'red']).domain([depth_min, depth_max])(first_third).hex();
      let third_col = chroma.scale(['green', 'yellow', 'red']).domain([depth_min, depth_max])(sec_third).hex();
      let last_col = chroma.scale(['green', 'yellow', 'red']).domain([depth_min, depth_max])(depth_max).hex();
      let categories = [depth_min + ' - ' + first_third,first_third + ' - ' + sec_third,sec_third + ' - ' + depth_max,'>' + depth_max];
      let labelColors = [first_col, sec_col, third_col, last_col];

      let legendInfo = "<h1>Depth of Earthquake (km)<br /></h1>" +
                      "<div class=\"labels\">" +
                      "<div class=\"first\">" + categories[0] + " <span class=\"color-block\" style=\"background-color: " + labelColors[0] + "\"></span></div>" +
                      "<div class=\"second\">" + categories[1] + " <span class=\"color-block\" style=\"background-color: " + labelColors[1] + "\"></span></div>" +
                      "<div class=\"third\">" + categories[2] + " <span class=\"color-block\" style=\"background-color: " + labelColors[2] + "\"></span></div>" +
                      "<div class=\"fourth\">" + categories[3] + " <span class=\"color-block\" style=\"background-color: " + labelColors[3] + "\"></span></div>" +
                      "</div>";

      div.innerHTML = legendInfo;

      return div;
    
    };

    // Add the legend to the map
    legend.addTo(myMap);
}

d3.json(queryURL).then(createMarkers);