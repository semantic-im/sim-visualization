var p = 20,
	time = d3.time.format("%Y-%m-%dT%H:%M:%S"),
	shortTime = d3.time.format("%d.%m.%y %H:%M:%S");

function Chart() {
	this.fill = d3.scale.category10();
	
	this.allChartWidth = ((clientWidth * 100)/100);
	this.chartHeight = ((clientHeight * 90) / 100);

	this.yLabelWidth = 40;
	this.legendWidth = 50;
	this.chartWidth = this.allChartWidth - this.yLabelWidth - this.legendWidth;
	
	this.h1 = ((this.chartHeight * 80) / 100);
	this.h2 = ((this.chartHeight * 10) / 100);
	
	this.chartMetrics = new Hashtable();
	
	this.x = d3.scale.linear().range([0, this.chartWidth]),
	this.y1 = d3.scale.linear().range([this.h1 - p, 0]),
	this.y2 = d3.scale.linear().range([this.h2, 0]);
	
	this.x0, // start of focus region
	this.x1, // end of focus region
	this.xx = null, // drag state

	this.minX,
	this.maxX,
	this.minY = Infinity,
	this.maxY = -Infinity;

	this.chartContainerVisible = false;
	
	this.chartSvgArea;
	
	this.focusArea;
	
	this.context;
	
	this.active;
}

Chart.prototype.init = function() {
	var chart = this;

	d3.select(window).on("mousemove", function() {
		if (chart.xx != null) {

			// Compute the new (clamped) focus region.
			var xy = chart.x.invert(d3.svg.mouse(chart.active[0][0])[0]);
			if (chart.xx < xy) {
				chart.x0 = chart.xx;
				chart.x1 = xy;
			} else if (chart.xx > xy) {
				chart.x0 = xy;
				chart.x1 = chart.xx;
			} else
				return;
			chart.x0 = Math.max(chart.x.domain()[0], chart.x0);
			chart.x1 = Math.min(chart.x.domain()[1], chart.x1);

			// Update the x-scale. TODO Recycle this scale?
			var tx = d3.scale.linear().domain([ chart.x0, chart.x1 ])
				//.range([ chart.yLabelWidth, chart.chartWidth + chart.yLabelWidth ]);
				.range([ 0, chart.chartWidth ]);
			
			var metrics = chart.chartMetrics.keys();
			for (var i = 0; i < metrics.length; i++) {
				var newData = computeFocusData(chart, metrics[i]);
				
				// Recompute the focus path.
				chart.focusArea.select("#" + validID(metrics[i]))
					.data([newData])
					.attr("d", 
						d3.svg.area().x(function(d) {
							return tx(d.x);
						})
						//.y0(y1(0))
						.y0(chart.y1(chart.minY))
						.y1(function(d) {
							return chart.y1(d.y);
						})
					);
			}
			
			// Reposition the active region rect.
			chart.active.attr("x", chart.x(chart.x0)).attr("width", chart.x(chart.x1) - chart.x(chart.x0));
			
			//console.debug(chart.focusArea.selectAll("text")[0][0]);
			chart.focusArea.selectAll("#x0label").text(shortTime(new Date(chart.x0)));
			chart.focusArea.selectAll("#x1label").text(shortTime(new Date(chart.x1)));
		}
	});
	d3.select(window).on("mouseup", function() {chart.xx = null;});

	this.chartSvgArea = d3.select("#chart1")
		.append("svg:svg")
		.attr("width", this.allChartWidth)
		.attr("height", this.h1 + this.h2 + p)
		.style("border", "1px solid black");
	
	this.focusArea = this.chartSvgArea.append("svg:g")
		.attr("transform", "translate(" + this.yLabelWidth + ",0)");
	
	this.context = this.chartSvgArea.append("svg:g")
		.attr("transform", "translate(" + this.yLabelWidth + "," + this.h1 + ")");
};

function computeFocusData(chart, metric) {
	var newData = new Array();
	var lastMinXData = null, firstMaxXData = null;
	var data = chart.chartMetrics.get(metric);
	for (var i = 0; i < data.length; i++) {
		if (data[i].x <= chart.x0) {
			lastMinXData = data[i];
			continue;
		}
		if (data[i].x >= chart.x1) {
			if (firstMaxXData == null) {
				firstMaxXData = data[i];
				if (firstMaxXData.x != chart.x1) {
					var newElement = new Object();
					newElement.x = chart.x1;
					newElement.y = (firstMaxXData.y + data[i - 1].y) / 2;
					newData.push(newElement);
				} else {
					newData.push(firstMaxXData);
				}
			}
			continue;
		}
		if (lastMinXData != null) {
			if (lastMinXData.x != chart.x0) {
				var newElement = new Object();
				newElement.x = chart.x0;
				newElement.y = (lastMinXData.y + data[i].y) / 2;
				newData.push(newElement);
			} else {
				newData.push(lastMinXData);
			}
			lastMinXData = null;
		}
		newData.push(data[i]);
	}	
	return newData;
}

Chart.prototype.createMetricJsonParameter = function(metric) {
	var result = "{" + "name:'" + metric + "', type:'type'";
	return result + "}";
};

Chart.prototype.addMetricToChart = function(metric) {
	if (!this.chartMetrics.containsKey(metric)) {
		this.chartMetrics.put(metric, new Array());
	}
	this.displayChart();
};

Chart.prototype.displayChart = function() {
	var metrics = this.chartMetrics.keys();
	for (var i = 0; i < metrics.length; i++) {
		if (this.chartMetrics.get(metrics[i]).length == 0) {
			var metricData = null;
			getMetricData(this.createMetricJsonParameter(metrics[i]), function(data) {metricData = data;});
			this.chartMetrics.put(metrics[i], this.processData(metricData));
			this.computeScales();
		};
	};
	this.drawChart();
	for (var i = 0; i < metrics.length; i++) {
		this.drawMetric(metrics[i]);
	}
};

Chart.prototype.getYLabel = function(value) {
	var metrics = this.chartMetrics.keys();
	for (var i = 0; i < metrics.length; i++) {
		if ((metrics[i] == IO_READ) ||
				(metrics[i] == IO_WRITE)) {
			return Math.round(value / 1024) + "K";
		}
	}
};

Chart.prototype.processData = function(data) {
	var newData = new Array();
	for ( var i = 0, n = data.length, o; i < n; i++) {
		o = data[i];
		o = data[i] = {
			x : +time.parse(o.timestamp),
			y : +o.value
		};
		newData.push(o);
	}	
	return newData;
};

Chart.prototype.computeScales = function() {
	this.minX = Infinity;
	this.maxX = -Infinity;
	this.minY = Infinity;
	this.maxY = -Infinity;

	// Compute x- and y-extent.
	var metrics = this.chartMetrics.keys();
	for (var j = 0; j < metrics.length; j++) {
		var data = this.chartMetrics.get(metrics[j]);
		for ( var i = 0, n = data.length, o; i < n; i++) {
			o = data[i];
			if (o.y > this.maxY)
				this.maxY = o.y;
			if (o.y < this.minY)
				this.minY = o.y;
		}
		if (data[0].x < this.minX) {
			this.minX = data[0].x;
		}
		if (data[n - 1].x > this.maxX) {
			this.maxX = data[n - 1].x;
		}
	}	
};
function getFill(metric) {
	if (metric == IO_READ) {
		return 1;
	} else if (metric == IO_WRITE) {
		return 2;
	}
}

Chart.prototype.drawMetric = function(metric) {
	var chart = this;
	
	this.focusArea.append("svg:path").data([ this.chartMetrics.get(metric) ])
		.attr("class", "chart")
		.attr("id", validID(metric))
		.style("fill", chart.fill(getFill(metric)))
		.attr("d", d3.svg.area().x(function(d) {return chart.x(d.x);})
			// .y0(y1(0))
			.y0(this.y1(this.minY))
			.y1(function(d) {
				return chart.y1(d.y);
			}));

	this.context.append("svg:path")
		.data([this.chartMetrics.get(metric)])
		.attr("class", "chart")
		.attr("pointer-events", "none")
		.style("fill", chart.fill(getFill(metric)))
		.attr("d", d3.svg.area().x(function(d) {
			return chart.x(d.x);
		})
		//.y0(y2(0))
		.y0(this.y2(this.minY)).y1(function(d) {
			return chart.y2(d.y);
		}));

};

Chart.prototype.drawChart = function() {
	var chart = this;
	
	// Update x- and y-scales.
	this.x.domain([ this.minX, this.maxX ]);
	this.y1.domain([ this.minY, this.maxY ]);
	this.y2.domain([ this.minY, this.maxY ]);

	// Focus view.
	this.focusArea.select("path").remove();

	this.focusArea.select("line").remove();
	this.focusArea.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", this.chartWidth)
		.attr("y1", this.y1(this.minY))
		.attr("y2", this.y1(this.minY));
	this.focusArea.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", this.y1(this.minY))
		.attr("y2", this.y1(this.maxY));
	this.focusArea.selectAll("text").remove();
	this.focusArea.append("svg:text")
		.attr("id", "x0label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("x", 0)
		.attr("y", (this.h1 - p) + 10)
		.text(shortTime(new Date(this.minX)));
	this.focusArea.append("svg:text")
		.attr("id", "x1label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", this.chartWidth)
		.attr("y", (this.h1 - p) + 10)
		.text(shortTime(new Date(this.maxX)));	
	this.focusArea.append("svg:text")
		.attr("id", "y0label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", 0)
		.attr("y", (this.h1 - p))
		.text(this.getYLabel(this.minY));	
	this.focusArea.append("svg:text")
		.attr("id", "y1label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", 0)
		.attr("y", 0 + 10)
		.text(this.getYLabel(this.maxY));	

	// Context view.
	this.context.select("rect").remove();
	this.context.append("svg:rect")
		.attr("width", this.chartWidth)
		.attr("height", this.h2)
		.attr("fill", "none")
		.attr("pointer-events",	"all")
		.attr("cursor", "crosshair")
		.on("mousedown", function() {
			chart.xx = chart.x.invert(d3.svg.mouse(this)[0]);
		});

	this.context.select("path").remove();

	this.context.select("line").remove();
	this.context.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", this.chartWidth)
		.attr("y1", this.y2(this.minY))
		.attr("y2",	this.y2(this.minY));
	this.context.select("text").remove();
	this.context.append("svg:text")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("x", 0)
		.attr("y", this.h2 + 10)
		.text(shortTime(new Date(this.minX)));
	this.context.append("svg:text")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", this.chartWidth)
		.attr("y", this.h2 + 10)
		.text(shortTime(new Date(this.maxX)));	

	// Active focus region.
	this.context.select("rect#active").remove();
	this.active = this.context.append("svg:rect")
			.attr("pointer-events", "none")
			.attr("id", "active")
			.attr("x", this.x(this.x0 = this.minX))
			.attr("y", 0)
			.attr("height", this.h2)
			//.attr("width", this.x(this.x1 = (this.minX + 1e11)) - this.x(this.x0))
			.attr("width", this.x(this.x1 = this.maxX) - this.x(this.x0))
			.attr("fill", "lightcoral").attr("fill-opacity", .5);
};
