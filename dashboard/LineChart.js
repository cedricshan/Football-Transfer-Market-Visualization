// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 0, left: 30 },
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("Total_Transfer_Fee_by_Year.csv").then(function (data) {
  console.log("Processed data:", data);

  // List of groups = header of the csv files
  const keys = data.columns.slice(1)

  console.log("keys:", keys);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, function (d) { return d.Year; }))
    .range([60, width]);

  const scaleLeft = d3.scaleLinear().domain([5000, 0]).range([0, height - 50]);
  const scaleBottom = d3.scaleTime().domain([new Date("1993-12-31"), new Date("2024-01-01")])
    .range([0, width - 50]);
  var axisLeft = d3.axisLeft(scaleLeft);
  var axisBottom = d3.axisBottom(scaleBottom);
  //axisLeft.tickValues([0,100,200,300,400,200]);
  svg.append('g').attr('transform', 'translate (60, 0)').call(axisLeft);
  svg.append('g').attr('transform', 'translate (60, ' + (height - 50) + ')').call(axisBottom);

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "centering")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .text("Time (year)");

  // Add Y axis label:
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", - (height / 2))
    .style("text-anchor", "middle")
    .text("Total Fee (million euros)");

  var colors = [
    "#d20515", // Bundesliga (Germany)
    "#ff9b00", // Eredivisie (Netherlands)
    "#0D6938", // Liga Portugal (Portugal)
    "#dae025", // Ligue 1 (France)
    "#3d195b", // Premier League (England)
    "#ef3340", // La Liga (Spain)
    "#024494"  // Serie A (Italy)
  ];

  tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("width", "text.length + 'px'")
    .style("height", "15px")

  const mouseover = function (event, d) {
    d3.selectAll(".lines")
      .filter(x => x.League !== d.League)
      .style("stroke-opacity", .2)
    d3.selectAll(".circ")
      .filter(x => x.League !== d.League)
      .style("opacity", .2)
  }
  const mouseleave = function (event, d) {
    d3.selectAll(".lines")
      .filter(x => x.League !== d.League)
      .style("stroke-opacity", 1)
    d3.selectAll(".circ")
      .filter(x => x.League !== d.League)
      .style("opacity", 1)
  }

  for (var i = 0; i < keys.length; i++) {
    var lgd = [];
    for (var j = 0; j < data.length; j++) {
      lgd.push({
        'Year': data[j]['Year'],
        'Fee': Math.round(data[j][keys[i]] / 1000000),
        'League': keys[i]
      })
    }
    lgd['League'] = keys[i]
    svg.append("path")
      .datum(lgd)
      .attr("fill", "none")
      .attr("stroke", colors[i])
      .attr("stroke-width", 3)
      .attr("class", "lines")
      .attr("d", d3.line()
        .x(function (d) { return x(d.Year) })
        .y(function (d) { return scaleLeft(d.Fee) })
      )
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)

    svg.selectAll("circles")
      .data(lgd)
      .enter()
      .append("circle")
      .attr("class", "circ")
      .attr("r", 4)
      .attr("stroke", "none")
      .attr("fill", colors[i])
      .attr("cx", function (d) { return x(d.Year) })
      .attr("cy", function (d) { return scaleLeft(d.Fee) })
      .on("mouseover", function (event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.8);
        tooltip.html('Year: ' + d.Year + '<br>Total Fee: €' + d.Fee + 'm')
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
        mouseover(event, d);
      })
      .on("mouseout", function (event, d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        mouseleave(event, d);
      });
  }

  //Create legend
  const league = ["Bundesliga (GER)", "Eredivisie (NED)", "Liga Portugal (POR)", "Ligue 1 (FRA)",
    "Premier League (ENG)", "La Liga (ESP)", "Serie A (ITA)"];

  const svg_legend = d3.select("body")
    .append("svg")
    .attr("width", 300)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;")
    .attr("transform", "translate(0,10)");

  svg_legend.append("text")
    .attr("x", 175)
    .attr("y", 75)
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Legend");

  svg_legend.selectAll("mydots")
    .data(league)
    .enter()
    .append("circle")
    .attr("cx", 100)
    .attr("cy", function (d, i) { return 100 + i * 25 })
    .attr("r", 7)
    .style("fill", function (d, i) { return colors[i] })

  svg_legend.selectAll("mylabels")
    .data(league)
    .enter()
    .append("text")
    .attr("x", 120)
    .attr("y", function (d, i) { return 100 + i * 25 })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
})
