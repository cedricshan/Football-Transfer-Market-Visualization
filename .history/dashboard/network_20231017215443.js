//The force graph was created based on https://observablehq.com/@d3/force-directed-graph/2?intent=fork

d3.json('transfer_network_top30.json')
    .then(function (data) {
        const width = 800;
        const height = 800;

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

        // The force simulation mutates links and nodes, so create a copy
        // so that re-evaluating this cell produces the same result.
        const links = data.links;
        const nodes = data.nodes;

        // Create a simulation with several forces.
        
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-1500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", ticked);
            
        // Create the SVG container.
        const svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // Add a line for each link, and a circle for each node.
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll()
            .data(links)
            .join("line")
            .attr("stroke-width", d => d.weight);
        
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("width","text.length + 'px'");
        
        var league = ["Bundesliga (GER)", "Eredivisie (NED)", "Liga Portugal (POR)", "Ligue 1 (FRA)",
            "Premier League (ENG)", "La Liga (ESP)", "Serie A (ITA)"];

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(nodes)
            .join("circle")
            .attr("r", 10)
            .attr("fill", d => color[d.group])
            .on("mouseover", function(d) {
                tooltip.transition()
                       .duration(200)
                       .style("opacity", 0.8);
                console.log(d.toElement.__data__);
                tooltip.html('<b>' + d.toElement.__data__.id + '</b><br>' + league[d.toElement.__data__.group])
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                       .duration(500)
                       .style("opacity", 0);
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
    })