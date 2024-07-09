var matrix = [
    [0, 45, 11, 55, 164, 78, 82],
    [103, 0, 14, 35, 153, 50, 60],
    [40, 9, 0, 73, 107, 130, 49],
    [101, 10, 25, 0, 263, 106, 111],
    [102, 26, 28, 77, 0, 122, 151],
    [71, 15, 53, 70, 197, 0, 156],
    [101, 19, 33, 86, 180, 153, 0]
];

const colors = [
    "#d20515", // Bundesliga (Germany)
    "#ff9b00", // Eredivisie (Netherlands)
    "#0D6938", // Liga Portugal (Portugal)
    "#dae025", // Ligue 1 (France)
    "#3d195b", // Premier League (England)
    "#ef3340", // La Liga (Spain)
    "#024494"  // Serie A (Italy)
];


var labels = ["Bundesliga (GER)", "Eredivisie (NED)", "Liga Portugal (POR)", "Ligue 1 (FRA)",
    "Premier League (ENG)", "La Liga (ESP)", "Serie A (ITA)"];

var nats = ['GER', 'NED', 'POR', 'FRA', 'ENG', 'ESP', 'ITA'];

const width = 1000;
const height = 720;

const sankey = d3.sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(8)
    .nodePadding(20)
    .extent([[0, 5], [width - 200, height]])

const svg = d3.select("body")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

var gnodes = [];
var glinks = [];
for (var i = 0; i < 14; i++) {
    if (i < 7) gnodes.push({ name: nats[i], index: i })
    else gnodes.push({ name: nats[i - 7], index: i })
}
for (var i = 0; i < 7; i++) {
    for (var j = 0; j < 7; j++) {
        if (i == j) continue;
        glinks.push({
            source: i,
            target: j + 7,
            value: matrix[i][j],
            names: [gnodes[i].name, gnodes[j + 7].name]
        });
    }
}
console.log(gnodes);
console.log(glinks);

const { nodes, links } = sankey({
    nodes: gnodes.map(d => Object.create(d)),
    links: glinks.map(d => Object.create(d))
});

tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("width", "text.length + 'px'")
    .style("height", "15px")

function onMouseOver(selected) {
    svg.selectAll("rect")
        .filter(d => d.index !== selected.index)
        .style("opacity", 0.3);

    svg.selectAll(".chord")
        .filter(d => d.source.index !== selected.index && d.target.index !== selected.index)
        .style("opacity", 0.3);
}

function onMouseOut() {
    svg.selectAll("rect")
        .style("opacity", 1);
    svg.selectAll(".chord")
        .style("opacity", 0.8);
}

svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("x", d => 100 + d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => colors[d.index % 7])
    .on("mouseover", (event, d) => onMouseOver(d))
    .on("mouseout", onMouseOut);

svg.append("g")
    .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("class", "chord")
    .attr("stroke", d => colors[d.source.index])
    .attr("stroke-width", d => d.width)
    .attr("stroke-opacity", 0.8)
    .style("mix-blend-mode", "multiply").attr('transform', 'translate (100,0)')
    .on("mouseover", function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.8);
        var lga = d.source.index;
        var lgb = d.target.index;
        tooltip.html(nats[lga] + ' to ' + nats[lgb - 7] + ': ' + matrix[lga][lgb - 7])
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");

        svg.selectAll("rect")
            .filter(d => d.index !== lga && d.index !== lgb)
            .style("opacity", 0.3);

        svg.selectAll(".chord")
            .filter(d => d.source.index !== lga || d.target.index !== lgb)
            .style("opacity", 0.3);
    })
    .on("mouseout", function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        return onMouseOut();
    });

svg.append("g")
    .style("font", "12px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .filter(d => d.x0 < width / 2)
    .attr("x", d => d.x1 + 85)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .append("tspan")
    .attr("fill-opacity", 0.6)
    .text(d => ` ${d.value.toLocaleString()}`)
    .append("tspan")
    .attr("fill-opacity", 1)
    .text(d => ' ' + d.name);

svg.append("g")
    .style("font", "12px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .filter(d => d.x0 >= width / 2)
    .attr("x", d => d.x0 + 115)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .text(d => d.name)
    .append("tspan")
    .attr("fill-opacity", 0.6)
    .text(d => ` ${d.value.toLocaleString()}`);