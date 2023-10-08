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
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "Data/mapdata.json")
  .defer(d3.csv, "Data/gini.csv")
  .await(ready);

function ready(error, topo, gini) {
  // Hier wird die GINI-Map aus den geladenen Daten erstellt
  var giniMap = d3.map();
  gini.forEach(function (d) {
    giniMap.set(d["Country Code"], +d["Value"]);
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
