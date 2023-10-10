// Load external data and boot
d3.queue()
  .defer(d3.json, "Data/mapdata.json")
  .defer(d3.csv, "Data/ginihaupt.csv")
  .defer(d3.csv, "Data/crimeRate.csv")
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
  .center([0, 40])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3
  .scaleThreshold()
  .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) // Schwellenwerte im Bereich von 1 bis 100
  .range(d3.schemeBlues[7]);

var gini;

function ready(error, topo, giniData, crimeData) {
  // Hier wird die GINI-Map aus den geladenen Daten erstellt
  gini = giniData;
  var giniMap = d3.map();
  gini.forEach(function (d) {
    giniMap.set(d["Country Code"], +d["Value"], +d["Year"], +d["Country Name"]);
  });

  var crimeMap = d3.map();
  crimeData.forEach(function (d) {
    crimeMap.set(d["Country"], +d["VALUE"]);
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
//Draw the circles
svg
  .append("g")
  .selectAll("circle")
  .data(topo.features)
  .enter()
  .append("circle")
  .attr("transform", function (d) {
    var centroid = projection(d3.geoCentroid(d));
    return "translate(" + centroid + ")";
  })
  .attr("r", function (d) {
    var crimeRate = crimeMap.get(d.properties["NAME"]);
    return crimeRate ? crimeRate / 10 : 0; // Skalieren Sie die Kreisgröße nach Bedarf
  })
  .attr("fill", "yellow"); // Setzen Sie die Füllfarbe der Kreise

// Funktion zur Aktualisierung der GINI-Map basierend auf dem ausgewählten Jahr
function updateYear(selectedYear) {
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
    var giniValue = giniValues[d.id];
    if (giniValue) {
      return colorScale(giniValue);
    } else {
      return "white";
    }
  });
}
function updateCrimeYear(selectedYear) {
  var filteredCrimeData = crimeData.filter(function (d) {
    return +d["Year"] === +selectedYear;
  });

  // Eine leere Map erstellen, um die Kriminalitätsraten pro Land zu speichern
  var crimeRates = {};

  // Daten in die Map speichern
  filteredCrimeData.forEach(function (d) {
    crimeRates[d["Country"]] = +d["VALUE"];
  });

  // Kreise neu zeichnen
  svg.selectAll("circle").attr("r", function (d) {
    var crimeRate = crimeRates[d.properties["NAME"]];
    if (crimeRate) {
      return crimeRate / 10; // Skalieren Sie die Kreisgröße nach Bedarf
    } else {
      return 0;
    }
  });
}

var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
