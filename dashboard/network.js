//The force graph was created based on https://observablehq.com/@d3/force-directed-graph/2?intent=fork
function updateVisualization() {

    // 获取选择框的元素
    const selectElement = document.getElementById('networkSelect');

    // 获取选择的值
    const selectedNetwork = selectElement.value;
    console.log(selectedNetwork);

    const netList = ["transfer_network_top30.json", "transfer_network_top100.json", "transfer_network_colored.json"];

    const minTrans = document.getElementById('minSelect').value;

    d3.json(netList[selectedNetwork])
        .then(function (data) {
            const width = 900;
            const height = 900;

            // Specify the color scale.
            const color = [
                "#d20515", // Bundesliga (Germany)
                "#ff9b00", // Eredivisie (Netherlands)
                "#0D6938", // Liga Portugal (Portugal)
                "#dae025", // Ligue 1 (France)
                "#3d195b", // Premier League (England)
                "#ef3340", // La Liga (Spain)
                "#024494"  // Serie A (Italy)
            ];

            const league = ["Bundesliga (GER)", "Eredivisie (NED)", "Liga Portugal (POR)", "Ligue 1 (FRA)",
                "Premier League (ENG)", "La Liga (ESP)", "Serie A (ITA)"];

            // The force simulation mutates links and nodes, so create a copy
            // so that re-evaluating this cell produces the same result.
            const links = data.links.filter(d => d.weight >= minTrans);
            console.log(links.length)
            const nodes = data.nodes;

            d3.selectAll("svg").remove();
            // Create a simulation with several forces.

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-100000 / (minTrans * Math.sqrt(minTrans * nodes.length * links.length))))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .on("tick", ticked);

            // Create the SVG container.
            const svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto;");

            function onMouseOver(selected) {
                svg.selectAll(".links")
                    .filter(d => d.source.index == selected.index || d.target.index == selected.index)
                    .attr("stroke", color[selected.group])
                    .attr("stroke-opacity", 1);

                svg.selectAll(".links")
                    .filter(d => d.source.index !== selected.index && d.target.index !== selected.index)
                    .attr("stroke-opacity", 0.2);
            }

            function onMouseOut() {
                svg.selectAll(".links")
                    .attr("stroke", "#999")
                    .attr("stroke-opacity", 0.6)
            }

            // Add a line for each link, and a circle for each node.
            const link = svg.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll()
                .data(links)
                .join("line")
                .attr('class', 'links')
                .attr("stroke-width", d => d.weight - minTrans + 1);

            tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("width", "text.length + 'px'");

            const nodeR = [10, 8, 5];

            const node = svg.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll()
                .data(nodes)
                .join("circle")
                .attr("r", nodeR[selectedNetwork])
                .attr("fill", d => color[d.group])
                .attr('class', 'nodes')
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.8);
                    tooltip.html('<b>' + d.id + '</b><br>' + league[d.group])
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                    onMouseOver(d);
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                    onMouseOut();
                });

            // Set the position attributes of links and nodes each time the simulation ticks.
            function ticked() {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            }

            // Add a drag behavior.
            node.call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

            // Reheat the simulation when drag starts, and fix the subject position.
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            // Update the subject (dragged node) position during drag.
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            // Restore the target alpha so the simulation cools after dragging ends.
            // Unfix the subject position now that it’s no longer being dragged.
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            //Create legend
            const svg_legend = d3.select("body")
                .append("svg")
                .attr("width", 500)
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
                .style("fill", function (d, i) { return color[i] })

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
}