
// 更新可视化函数
function updateVisualization() {

  // 获取选择框的元素
  const selectElement = document.getElementById('yearSelect');

  // 获取选择的值
  const selectedYear = selectElement.value;
  console.log('选中的年份是:', selectedYear);

  // 加载对应年份的数据
  d3.csv('tansfer_by_position.csv')
    .then(csvData => {
      const filteredData = csvData.filter(row => row.Year === selectedYear)
                                  .map(row => ({ Count: +row.Count, Fee: +row.Fee }));

      const matrix = filteredData.map(row => [row.Fee, row.Count]);

      const data = matrix;

      // 更新可视化
      visualizeData(data);
    });
}


function visualizeData(data) {

  d3.select("svg").remove();

  var dx = 200;
  var dy = 100;

  var loc_x = [280+dx, 500+dx, 720+dx, 280+dx, 500+dx, 500+dx, 720+dx, 280+dx, 500+dx, 720+dx, 500+dx];
  var loc_y = [100+dy, 100+dy, 100+dy, 300+dy+50, 300+dy+50, 380+dy+50, 300+dy+50, 500+dy+50, 500+dy+50, 500+dy+50, 680+dy+10];
  var pos_name = ['LW', 'CF', 'RW', 'LM', 'CM', 'DM', 'RM', 'LB', 'CB', 'RB', 'GK'];

  var width = 1000;
  var height = 1000;

  var radiusScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d, i) { return data[i][0]; })])
    .range([10, 50]);

  var colorScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d, i) { return data[i][1]; })])
    .range(["lightblue", "darkblue"]);

  var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("width", "text.length + 'px'")

  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", function(d, i) { return loc_x[i]; })
    .attr("cy", function(d, i) { return loc_y[i]; })
    .attr("r", function(d, i) { return radiusScale(data[i][0]); })
    .attr("fill", function(d, i) { return colorScale(data[i][1]); })
    .on("mouseover", function (event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.8);
      tooltip.html('Transfer Count: ' + d[1] + '<br>Average Fee: €' + Math.round(d[0] / 1000000) + 'm')
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (event, d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Adding labels to the circles
  svg.selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", function(d, i) { return loc_x[i]; })
    .attr("y", function(d, i) { return loc_y[i] + 5; })
    .text(function(d, i) { return pos_name[i]; })
    .attr("text-anchor", "middle")
    .style("fill", "white");
}
