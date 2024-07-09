
var parseDate = d3.timeParse("%B");
const margin = {top: 20, right: 20, bottom: 40, left: 40};

d3.csv("filtered_eredivisie_ScatterPlot.csv")
.then(data => {
    return data.map(d => {
        return {
            Fee: Number(d.Fee),
            Age: Number(d.Age)
        };
    });
})
.then(processedData => {
    console.log("Processed data:", processedData);

    var height = 300;
    var width = 600;
    var maxFee = d3.max(processedData, function (d) { return d.Fee; });
    var minFee = d3.min(processedData, function (d) { return d.Fee; });
    var minAge= d3.min(processedData,function (d) { return d.Age; })
    var maxAge= d3.max(processedData,function (d) { return d.Age; })
    const meanFee = d3.mean(processedData, d => d.Fee);

        // Group data by Age
    const groupedData = d3.group(processedData, d => d.Age);

    // Compute statistics for each group
    const sumstat = Array.from(d3.rollup(
        processedData,
        group => {
            const fees = group.map(d => +d.Fee).sort(d3.ascending); 
            const q1 = d3.quantile(fees, 0.25);
            const median = d3.quantile(fees, 0.5);
            const q3 = d3.quantile(fees, 0.75);
            const interQuantileRange = q3 - q1;
            const min = 0;
            const max = q3 + 1.5 * interQuantileRange;
            const avg= d3.mean(fees);
            return { q1, median, q3, interQuantileRange, min, max, avg };

        },
        d => d.Age
    )).map(([key, value]) => ({ key, value }));

    function selectRandomTenPoints(data) {
        const sampledData = [];
        for (const [age, values] of groupedData) {
            const shuffled = [...values].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 10);
            sampledData.push(...selected);
        }
        return sampledData;
    }
    
    const sampleDataForPlotting = selectRandomTenPoints(processedData);


    console.log(maxFee);
    console.log(maxAge);
    console.log(minAge);
    
    const x = d3.scaleLinear()
        .domain([d3.min(processedData, d => d.Age)-1, d3.max(processedData, d => d.Age)+1])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(processedData, d => d.Fee), 10000000])
        .range([height, 0]);

    var svg= d3.select('body')
    .append('svg')
    .attr('height','100%')
    .attr('width','100%');

    var chartGroup=svg
    .append('g')
    .attr('transform','translate(100,100)');

    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

    chartGroup.append("g")
    .call(d3.axisLeft(y))



    // chartGroup.append('g')
    // .selectAll("dot")
    // .data(processedData)
    // .join("circle")
    //     .attr("cx", function (d) { return x(d.Age); } )
    //     .attr("cy", function (d) { return y(d.Fee); } )
    //     .attr("r", 2)
    //     .style("fill", "#69b3a2")

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`) // Adjust the position as needed
        .style("text-anchor", "middle")
        .text("Age");

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left-50)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em") 
        .style("text-anchor", "middle")
        .text("Fee");

    chartGroup
        .selectAll("vertLines")
        .data(sumstat)
        .enter()
        .append("line")
          .attr("x1", function(d){return(x(d.key))})
          .attr("x2", function(d){return(x(d.key))})
          .attr("y1", function(d){return(y(d.value.min))})
          .attr("y2", function(d){return(y(d.value.max))})
          .attr("stroke", "black")
          .style("width", 40)

    var avgline=chartGroup.append('g')
                            .attr('class','avgline')
    chartGroup
        .selectAll("Lines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", function(d){return(x(d.key))})
        .attr("x2", function(d){return(x(d.key))})
        .attr("y1", function(d){return(y(d.value.avg))})
        .attr("y2", function(d){return(y(d.value.avg))})
        .attr("stroke", "black")
        .style("width", 40)

    var tooltip = chartGroup.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

    tooltip.append("rect")
        .attr("width", 150) // Adjust as needed
        .attr("height", 50) // Adjust as needed
        .attr("fill", "white")
        .style("opacity", 0.8);

    tooltip.append("text")
        .attr("x", 5)
        .attr("dy", "1.2em")
        .style("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("font-family", "sans-serif");

    var boxWidth = 20
    var highlightedBox = chartGroup.select(null);
    chartGroup
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
            .attr("x", function(d){return(x(d.key)-boxWidth/2)})
            .attr("y", function(d){return(y(d.value.q3))})
            .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
            .attr("width", boxWidth )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("click",function(d) {
                // Recolor the last clicked rect.
                highlightedBox.style("fill", "#69b3a2")
                // Color the new one:
                highlightedBox = d3.select(this);
                highlightedBox.style("fill","steelblue");
              })
        .on("click", function(event, d) {
            // Recolor the last clicked rect.
            highlightedBox.style("fill", "#69b3a2");

            // Color the new one:
            highlightedBox = d3.select(this);
            highlightedBox.style("fill", "steelblue");

            // Set the position and text of the tooltip:
            tooltip
                .attr("transform", `translate(${x(d.key) + 5}, ${y(d.value.q3) - 50})`)
                .style("display", null);
            
            tooltip.select("text")
                .text(`Age: ${d.key}`)
                .append("tspan")
                .attr("x", 5)
                .attr("dy", "1.2em")
                .text(`Median Fee: ${d.value.median}`);
            })
        .on("mouseout", function() {
                tooltip.style("display", "none");
            });






            


    
        // Show the median
    chartGroup
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
        .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
        .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
        .attr("y1", function(d){return(y(d.value.median))})
        .attr("y2", function(d){return(y(d.value.median))})
        .attr("stroke", "black")
        .style("width", 80)

    var jitterWidth = 10
    chartGroup
        .selectAll("indPoints")
        .data(sampleDataForPlotting)
        .enter()
        .append("circle")
        .attr("cx", function(d){return(x(d.Age) - jitterWidth/2 + Math.random()*jitterWidth )})
        .attr("cy", function(d){return(y(d.Fee))})
        .attr("r", 4)
        .style("fill", "white")
        .attr("stroke", "black")
    

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${-10})`) 
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Box Plot of Age vs. Transfer Fee");


})
.catch(error => {
    console.error("Error loading or processing the CSV:", error);
});
