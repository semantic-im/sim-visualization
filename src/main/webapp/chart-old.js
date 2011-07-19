var chartNodes = new Hashtable();
var scale = d3.scale.category10();
var chartWidth = ((clientWidth * 80)/100),
	chartMetricsWidth = ((clientWidth * 20)/100),
	chartHeight = ((clientHeight * 30) / 100);
var h1 = ((chartHeight * 80) / 100),
	h2 = ((chartHeight * 10) / 100),
	p = 20,
	x0, // start of focus region
	x1, // end of focus region
	xx = null, // drag state
	time = d3.time.format("%Y-%m-%dT%H:%M:%S"),
	x = d3.scale.linear().range([0, chartWidth]),
	y1 = d3.scale.linear().range([h1 - p, 0]),
	y2 = d3.scale.linear().range([h2, 0]);
	
var minX,
	maxX,
	minY = Infinity,
	maxY = -Infinity;

var chartContainerVisible = false;

var chartMousedown = function chartMousedown() {
	xx = x.invert(d3.svg.mouse(this)[0]);
};

var chartMousemove = function chartMousemove() {
	if (xx != null) {

		// Compute the new (clamped) focus region.
		var xy = x.invert(d3.svg.mouse(active[0][0])[0]);
		if (xx < xy) {
			x0 = xx;
			x1 = xy;
		} else if (xx > xy) {
			x0 = xy;
			x1 = xx;
		} else
			return;
		x0 = Math.max(x.domain()[0], x0);
		x1 = Math.min(x.domain()[1], x1);

		// Update the x-scale. TODO Recycle this scale?
		var tx = d3.scale.linear().domain([ x0, x1 ]).range(
				[ 0, clientWidth ]);

		// Recompute the focus path.
		focusArea.select("path").attr("d", d3.svg.area().x(function(d) {
			return tx(d.x);
		})
		//.y0(y1(0))
		.y0(y1(minY)).y1(function(d) {
			return y1(d.y);
		}));

		// Reposition the active region rect.
		active.attr("x", x(x0)).attr("width", x(x1) - x(x0));
	}
};

var chartMouseup = function chartMouseup() {
	xx = null;
};

var chartSvgArea = d3.select("#chart")
	.append("svg:svg")
	.attr("width", chartWidth)
	.attr("height", h1 + h2 + p)
	.style("border", "1px solid black")
	.on("mousemove", chartMousemove)
	.on("mouseup", chartMouseup);

//Focus view.
var focusArea = chartSvgArea.append("svg:g");

// Context view.
var context = chartSvgArea.append("svg:g")
	.attr("transform", "translate(0," + h1 + ")");

var active;

function createMetricJsonParameter(node) {
	var result = "{" + "name:'" + node.name + "'";
	result = result + ",type:" + node.type;
	return result + "}";
}

function addNodeToChart(node) {
	if (!chartNodes.containsKey(node)) {
		chartNodes.put(node, new Array());
	}
	getChartData();
}

function getChartData() {
	var nodes = chartNodes.keys();
	for (var i = 0; i < nodes.length; i++) {
		if (chartNodes.get(nodes[i]).length == 0) {
			getMetricData(createMetricJsonParameter(nodes[i]), function(data) {chartNodes.put(nodes[i], data); drawChart(nodes[i], data);});
		}
	}	
}

function drawChart(node, data) {

	if (!chartContainerVisible) {
		d3.select("#ontoview").select("svg")
			.attr("height", ((clientHeight * 70) / 100) + "px");
		d3.select("#chart-container").style("display", "block")
			.style("top", (clientTop + (clientHeight - chartHeight)) + "px")
			.style("left", clientLeft + "px");
		d3.select("#chart")
			.style("width", chartWidth + "px")
			.style("left", chartMetricsWidth + "px");
		chartContainerVisible = true;
	}

	minY = Infinity,
	maxY = -Infinity;

	  // Compute x- and y-extent.
	  //data.reverse();
	  for (var i = 0, n = data.length, o; i < n; i++) {
	    o = data[i];
	    o = data[i] = {x: +time.parse(o.timestamp), y: +o.value};
	    if (o.y > maxY) maxY = o.y;
	    if (o.y < minY) minY = o.y;
	  }
	  minX = data[0].x;
	  maxX = data[n - 1].x;

	  // Update x- and y-scales.
	  x.domain([minX, maxX]);
	  y1.domain([minY, maxY]);
	  y2.domain([minY, maxY]);
	  console.debug(minY);
	  console.debug(maxY);
	  
	  // Focus view.
	  focusArea.select("path").remove();
	  focusArea.append("svg:path")
	      .data([data])
	      .attr("class", "chart")
	      .attr("d", d3.svg.area()
	      .x(function(d) { return x(d.x); })
	      //.y0(y1(0))
	      .y0(y1(minY))
	      .y1(function(d) { return y1(d.y); }));

	  focusArea.select("line").remove();
	  focusArea.append("svg:line")
	  	  .attr("class", "chart")	
	      .attr("x1", 0)
	      .attr("x2", chartWidth)
	      .attr("y1", y1(minY))
	      .attr("y2", y1(minY));

	  // Context view.
	  context.select("rect").remove();
	  context.append("svg:rect")
	      .attr("width", chartWidth)
	      .attr("height", h2)
	      .attr("fill", "none")
	      .attr("pointer-events", "all")
	      .attr("cursor", "crosshair")
	      .on("mousedown", chartMousedown);

	  context.select("path").remove();
	  context.append("svg:path")
	      .data([data])
	      .attr("class", "chart")
	      .attr("pointer-events", "none")
	      .attr("d", d3.svg.area()
	    		  .x(function(d) { return x(d.x); })
	    		  //.y0(y2(0))
	    		  .y0(y2(minY))
	    		  .y1(function(d) { return y2(d.y); }));

	  context.select("line").remove();
	  context.append("svg:line")
	  	  .attr("class", "chart")
	      .attr("x1", 0)
	      .attr("x2", chartWidth)
	      .attr("y1", y2(minY))
	      .attr("y2", y2(minY));

	  // Active focus region.
	  context.select("rect#active").remove();
	  active = context.append("svg:rect")
	      .attr("pointer-events", "none")
	      .attr("id", "active")
	      .attr("x", x(x0 = minX))
	      .attr("y", 0)
	      .attr("height", h2)
	      .attr("width", x(x1 = (minX + 1e11)) - x(x0))
	      .attr("fill", "lightcoral")
	      .attr("fill-opacity", .5);

};

