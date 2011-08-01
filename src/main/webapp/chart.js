var p,
	time = d3.time.format("%Y-%m-%dT%H:%M:%S"),
	shortTime = d3.time.format("%d.%m.%y %H:%M:%S");

function Metric() {
	this.type = null;
	this.metric = null;
	this.metricLabel = null;
	this.method = null;
	this.methodLabel = null;
	
	this.fill = null;
	
	this.data = new Array();
}
function Chart(id, width, height) {
	this.id = id;
	
	this.fill = d3.scale.category20();
	
	//this.chartHeight = ((clientHeight * 90) / 100);
	this.allChartWidth = width;
	this.chartHeight = height;

	this.leftSpaceWidth = 40;
	this.rightSpaceWidth = 20;
	this.chartWidth = this.allChartWidth - this.leftSpaceWidth - this.rightSpaceWidth;
	
	this.h1 = ((this.chartHeight * 80) / 100);
	this.h2 = ((this.chartHeight * 10) / 100);
	p = this.chartHeight - (this.h1 + this.h2 + 1);
	this.chartMetrics = new Array();
	
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
	
	this.legend;
}

Chart.prototype.init = function(color) {
	var chart = this;
	
	d3.select("#" + chart.id).on("mousemove", function() {
		if (chart.xx != null) {
			var multipleMetrics = (chart.chartMetrics.length > 1);
			
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
			
			var metrics = chart.chartMetrics;
			for (var i = 0; i < metrics.length; i++) {
				var newData = computeFocusData(chart, metrics[i]);
				
				// Recompute the focus path.
				if (multipleMetrics) {
					chart.focusArea.select("#" + validID(metrics[i].metric))
					.data([newData])
					.attr("d", 
						d3.svg.line().x(function(d) {
							return tx(d.x);
						})
						.y(function(d) {
							return chart.y1(d.y);
						})
					);					
				} else {
					chart.focusArea.select("#" + validID(metrics[i].metric))
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
			}
			
			// Reposition the active region rect.
			chart.active.attr("x", chart.x(chart.x0)).attr("width", chart.x(chart.x1) - chart.x(chart.x0));
			
			//console.debug(chart.focusArea.selectAll("text")[0][0]);
			chart.focusArea.selectAll("#x0label").text(shortTime(new Date(chart.x0)));
			chart.focusArea.selectAll("#x1label").text(shortTime(new Date(chart.x1)));
		}
	});
	d3.select("#" + chart.id).on("mouseup", function() {chart.xx = null;});

	this.chartSvgArea = d3.select("#" + this.id)
		.append("svg:svg")
		.attr("width", (this.allChartWidth - 4) + "px")
		.attr("height", (this.chartHeight - 4) + "px")
		.style("position", "relative")
		.style("top", 2 + "px")
		.style("left", 2 + "px");
	
	this.chartSvgArea.append("svg:rect")
			.attr("pointer-events", "none")
			.attr("x", 0 + "px")
			.attr("y", 0 + "px")
			.attr("height", (this.chartHeight  - 4)  + "px")
			.attr("width", (this.allChartWidth - 4) + "px")
			.attr("fill", color).attr("fill-opacity", .2);
	this.chartSvgArea.append("svg:text")
		.attr("font-family", "Verdana")
		.attr("font-size", "64")
		.attr("stroke", "0px")
		.attr("fill", color)
		.attr("fill-opacity", "0.2")
		.attr("x", this.allChartWidth / 2)
		.attr("y", (this.h1 + this.h2 + p) / 2)
		.attr("text-anchor", "middle")
		.text("DROP HERE!");

	this.focusArea = this.chartSvgArea.append("svg:g")
		.attr("transform", "translate(" + this.leftSpaceWidth + ",0)");
	
	this.context = this.chartSvgArea.append("svg:g")
		.attr("transform", "translate(" + this.leftSpaceWidth + "," + this.h1 + ")");
	
	this.legend = new Legend(this);
};

function computeFocusData(chart, metric) {
	var newData = new Array();
	var lastMinXData = null, firstMaxXData = null;
	var data = metric.data;
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
	var result = "{" + "metric:'" + metric.metric + "'";
	if (metric.method) {
		result = result + ", method:'" + metric.method + "'";
	}
	return result + "}";
};

Chart.prototype.addMetricToChart = function(aMetric, aMetricLabel, aMethod, aMethodLabel) {
	var metric = new Metric();
	metric.metric = aMetric;
	metric.metricLabel = aMetricLabel;
	metric.method = aMethod;
	metric.methodLabel = aMethodLabel;
	metric.fill = this.fill(aMetric);
	var exists = false;
	for (var i = 0; i < this.chartMetrics.length; i++) {
		if (this.chartMetrics[i].metric == metric.metric) {
			exists = true;
			break;
		}
	}
	if (exists) {
		return;
	} 
	this.chartMetrics.push(metric);
	this.displayChart();
	this.legend.refreshLegend();
};

Chart.prototype.removeMetric = function(metric) {
	var index = -1;
	for (var i = 0; i < this.chartMetrics.length; i++) {
		if (this.chartMetrics[i].metric == metric.metric) {
			index = i;
			break;
		}
	}
	if (index == -1) {
		return;
	}
	this.chartMetrics.splice(index, 1);
	this.displayChart();
	this.legend.refreshLegend();
};

Chart.prototype.displayChart = function() {
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		if (metrics[i].data.length == 0) {
			var metricData = null;
			getMetricData(this.createMetricJsonParameter(metrics[i]), function(data) {metricData = data;});
			metrics[i].data = this.processData(metricData);
			//this.computeScales();
		};
	};
	this.computeScales();
	this.drawChart();
	for (var i = 0; i < metrics.length; i++) {
		this.drawMetric(metrics[i]);
	}
};

Chart.prototype.getYLabel = function(value) {
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		if ((metrics[i].metric == IO_READ) ||
				(metrics[i].metric == IO_WRITE) ||
				(metrics[i].metric == SWAP_IN) ||
				(metrics[i].metric == SWAP_OUT) ||
				(metrics[i].metric == TOTAL_SYSTEM_FREE_MEMORY) ||
				(metrics[i].metric == TOTAL_SYSTEM_USED_MEMORY) ||
				(metrics[i].metric == TOTAL_SYSTEM_USED_SWAP)) {
			return Math.round(value / 1024) + "K";
		} else if ((metrics[i].metric == IDLE_CPU_LOAD) ||
				(metrics[i].metric == IRQ_CPU_LOAD) ||
				(metrics[i].metric == SYSTEM_CPU_LOAD) ||
				(metrics[i].metric == SYSTEM_LOAD_AVERAGE) ||
				(metrics[i].metric == USER_CPU_LOAD) ||
				(metrics[i].metric == WAIT_CPU_LOAD)) {
			return d3.format(".2%")(value);
		} else if ((metrics[i].metric == IDLE_CPU_TIME) ||
				(metrics[i].metric == IRQ_CPU_TIME) ||
				(metrics[i].metric == SYSTEM_CPU_TIME) ||
				(metrics[i].metric == USER_CPU_TIME) ||
				(metrics[i].metric == WAIT_CPU_TIME) ||
				(metrics[i].metric == PROCESS_TOTAL_CPU_TIME) ||
				(metrics[i].metric == THREAD_BLOCK_TIME) ||
				(metrics[i].metric == THREAD_GCC_TIME) ||
				(metrics[i].metric == THREAD_SYSTEM_CPU_TIME) ||
				(metrics[i].metric == THREAD_TOTAL_CPU_TIME) ||
				(metrics[i].metric == THREAD_USER_CPU_TIME) ||
				(metrics[i].metric == THREAD_WAIT_TIME) ||
				(metrics[i].metric == WALL_CLOCK_TIME)) {
			return d3.format(".4")(value) + "ms";
		} else if ((metrics[i].metric == SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT) ||
				(metrics[i].metric == THREAD_BLOCK_COUNT) ||
				(metrics[i].metric == THREAD_COUNT) ||
				(metrics[i].metric == THREAD_GCC_COUNT) ||
				(metrics[i].metric == THREAD_WAIT_COUNT)) {
			return value;
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
	var metrics = this.chartMetrics;
	for (var j = 0; j < metrics.length; j++) {
		var data = metrics[j].data;
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

Chart.prototype.drawMetric = function(metric) {
	var chart = this;
	var multipleMetrics = (chart.chartMetrics.length > 1);

	var focusPath = this.focusArea.append("svg:path").data([ metric.data ])
		.attr("id", validID(metric.metric));
	
	if (multipleMetrics) {
		focusPath.attr("d", d3.svg.line().x(function(d) {return chart.x(d.x);})
				.y(function(d) {
					return chart.y1(d.y);
				}));
		focusPath.style("stroke", chart.fill(metric.fill));
		focusPath.style("stroke-width", "2px");
		focusPath.style("fill", "none");
	} else {
		focusPath.attr("d", d3.svg.area().x(function(d) {return chart.x(d.x);})
				// .y0(y1(0))
				.y0(this.y1(this.minY))
				.y1(function(d) {
					return chart.y1(d.y);
				}));
		focusPath.style("fill", chart.fill(metric.fill));
		focusPath.style("stroke", "none");
	}
	
	var contextPath = this.context.append("svg:path")
		.data([metric.data])
		.attr("pointer-events", "none");

	if (multipleMetrics) {
		contextPath.attr("d", d3.svg.line().x(function(d) {
			return chart.x(d.x);
		})
		.y(function(d) {
			return chart.y2(d.y);
		}));
		contextPath.style("stroke", chart.fill(metric.fill));
		contextPath.style("stroke-width", "1px");
		contextPath.style("fill", "none");
	} else {
		contextPath.attr("d", d3.svg.area().x(function(d) {
			return chart.x(d.x);
		})
		//.y0(y2(0))
		.y0(this.y2(this.minY)).y1(function(d) {
			return chart.y2(d.y);
		}));
		contextPath.style("fill", chart.fill(metric.fill));
		contextPath.style("stroke", "none");
	}

};

Chart.prototype.drawChart = function() {
	var chart = this;
	
	// Update x- and y-scales.
	this.x.domain([ this.minX, this.maxX ]);
	this.y1.domain([ this.minY, this.maxY ]);
	this.y2.domain([ this.minY, this.maxY ]);

	this.chartSvgArea.selectAll("rect").remove();
	this.chartSvgArea.selectAll("text").remove();
	
	// Focus view.
	this.focusArea.selectAll("path").remove();

	this.focusArea.selectAll("line").remove();
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
	this.context.selectAll("rect").remove();
	this.context.append("svg:rect")
		.attr("width", this.chartWidth)
		.attr("height", this.h2)
		.attr("fill", "none")
		.attr("pointer-events",	"all")
		.attr("cursor", "crosshair")
		.on("mousedown", function() {
			chart.xx = chart.x.invert(d3.svg.mouse(this)[0]);
		});

	this.context.selectAll("path").remove();

	this.context.selectAll("line").remove();
	this.context.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", this.chartWidth)
		.attr("y1", this.y2(this.minY))
		.attr("y2",	this.y2(this.minY));
	this.context.selectAll("text").remove();
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
	this.context.select("rect#" + this.id + "active").remove();
	this.active = this.context.append("svg:rect")
			.attr("pointer-events", "none")
			.attr("id", this.id + "active")
			.attr("x", this.x(this.x0 = this.minX))
			.attr("y", 0)
			.attr("height", this.h2)
			//.attr("width", this.x(this.x1 = (this.minX + 1e11)) - this.x(this.x0))
			.attr("width", this.x(this.x1 = this.maxX) - this.x(this.x0))
			.attr("fill", "lightcoral").attr("fill-opacity", .2);
};
