// Load external data and boot
d3.queue()
  .defer(d3.json, "Data/mapdata.json")
  .defer(d3.csv, "Data/gini.csv")
  .await(ready);
// The svg
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3
  .geoMercator()
  .scale(150)
  .center([0, 20])
  .translate([width / 2, height / 2]);
// Data and color scale
var data = d3.map();
var colorScale = d3
  .scaleThreshold()
  .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) // Schwellenwerte im Bereich von 1 bis 100
  .range(d3.schemeBlues[7]);

function ready(error, topo, gini) {
  // Hier wird die GINI-Map aus den geladenen Daten erstellt
  var giniMap = d3.map();
  gini.forEach(function (d) {
    giniMap.set(d["Country Code"], +d["Value"], +d["Year"], +d["Country Name"]);
  });

  let mouseOver = function (d) {
    d3.selectAll(".Country").transition().duration(10).style("opacity", 0.5);
    d3.select(this)
      .transition()
      .duration(10)
      .style("opacity", 1)
      .style("stroke", "black");
  };

  let mouseLeave = function (d) {
    d3.selectAll(".Country").transition().duration(10).style("opacity", 0.5);
    d3.select(this).transition().duration(10).style("stroke", "transparent");
  };
  function clickCountry(d) {
    // Hier können Sie die Daten des geklickten Landes in der Konsole anzeigen
    var countryCode = d.properties["ISO_A2"];
    var giniValue = giniMap.get(countryCode);
    var countryName = d.properties["NAME"];

    console.log("Country Code: " + countryCode);
    console.log("Country Name: " + countryName);
    console.log("Gini Value: " + giniValue);
  }
  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")

    // draw each country
    .attr("d", d3.geoPath().projection(projection))

    // set the color of each country
    .attr("fill", function (d) {
      var giniValue = giniMap.get(d.id);
      return colorScale(giniValue);
    })
    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "Country";
    })
    .style("opacity", 0.8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);
}

// Funktion zur Aktualisierung der GINI-Map basierend auf dem ausgewählten Jahr
function updateYear(selectedYear) {
  // Das ausgewählte Jahr im HTML-Dokument aktualisieren
  var slider = document.getElementById("yearSlider");
  document.getElementById("selectedYear").textContent =
    "Selected Year: " + selectedYear;

  // Daten filtern, um nur Daten für das ausgewählte Jahr zu behalten
  var filteredData = gini.filter(function (d) {
    return +d["Year"] === +selectedYear;
  });

  // Ein leeres Objekt erstellen, um die GINI-Werte pro Land zu speichern
  var giniValues = {};

  // Daten in das Objekt speichern
  filteredData.forEach(function (d) {
    giniValues[d["Country Code"]] = +d["Value"];
  });

  // Daten neu zeichnen
  svg.selectAll("path").attr("fill", function (d) {
    // GINI-Wert für das ausgewählte Land finden
    var giniValue = giniValues[d.id];

    // Wenn ein Wert gefunden wurde, die Kartenfarbe aktualisieren
    if (giniValue) {
      return colorScale(giniValue);
    } else {
      // Wenn kein Wert gefunden wurde, eine Standardfarbe verwenden
      return "gray"; // Ändern Sie dies nach Bedarf
    }
  });
}
