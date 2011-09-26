var p,
	time = d3.time.format("%Y-%m-%dT%H:%M:%S"),
	shortTime = d3.time.format("%d.%m.%y %H:%M:%S");

//type
Metric.VALUES_TYPE = "VALUES_TYPE";
Metric.INCREMENT_TYPE = "INCREMENT_TYPE";

//measurement units
Metric.KILOBYTE = ":Kilobyte";
Metric.BYTE = ":Byte";
Metric.PERCENTAGE = ":Percent";
Metric.SECOND = ":Second";
Metric.MILLISECOND = ":Millisecond";
Metric.TIMESTAMP = ":TimePoint";
Metric.COUNTER = ":Counter";
Metric.NUMERIC = ":NumericValue";

function Metric(model) {

	this.metric = model.id;
	this.metricLabel = model.label;
	this.method = null;
	this.methodLabel = null;
	if (model.method) {
		this.method = model.method.id;
		this.methodLabel = model.method.label;
	}
	
	this.description = model.description;
	this.unit = model.unit;
	this.unitLabel = model.unitLabel;
	
	this.fill = null;
	
	this.data = new Array();
	this.focusData = new Array();

	this.type = function() {
		switch (this.metric) {
		case IO_READ:
		case IO_WRITE:
		case IDLE_CPU_TIME:
		case USER_CPU_TIME:
		case WAIT_CPU_TIME:
		case SYSTEM_CPU_TIME:
		case PLATFORM_UPTIME:
			return Metric.INCREMENT_TYPE;
		default:
			return Metric.VALUES_TYPE;
		}
	};
	
	this.getFormattedValue = function(value) {
		switch (this.unit) {
		case Metric.KILOBYTE:
			if (value > 1024 * 1024) {
				return d3.format(".2f")(value/1024/1024) + "Gb";
			} else if (value > 1024) {
				return d3.format(".2f")(value/1024) + "Mb";
			} else {
				return Math.floor(value) + "Kb";
			}
		case Metric.BYTE:
			if (value > 1024 * 1024) {
				return d3.format(".2f")(value/1024/1024) + "M";
			} else if (value > 1024) {
				return d3.format(".2f")(value/1024) + "Kb";
			} else {
				return Math.floor(value) + "b";
			}
		case Metric.PERCENTAGE:
			return d3.format(".2%")(value);
		case Metric.SECOND:
			if (value > 60 * 60) {
				return Math.floor(value / (60 * 60)) + "h" + Math.floor((value % (60 * 60)) / 60) + "m" + Math.floor(value % 60) + "s";
			} else if (value > 60) {
				return Math.floor(value / 60) + "m" + Math.floor(value % 60) + "s";
			} else {
				return d3.format(".2f")(value) + "s";
			}
		case Metric.MILLISECOND:
		case Metric.TIMESTAMP:
			if (value > 1000) {
				return d3.format(".2f")(value / 1000) + "s";
			} else if (value > 1000 * 60) {
				return d3.format(".2f")(value / (1000 * 60)) + "m";
			} else {
				return d3.format(".2f")(value) + "ms";
			}
		case Metric.COUNTER:
			return Math.round(value);
		default:
			return Math.floor(value);
		}
	};
	
	/*
	this.measurementUnit = function () {
		switch (this.metric) {
		case IO_READ:
		case IO_WRITE:
		case SWAP_IN:
		case SWAP_OUT:
		case TOTAL_SYSTEM_FREE_MEMORY:
		case TOTAL_SYSTEM_USED_MEMORY:
		case TOTAL_SYSTEM_USED_SWAP:
		//platform metrics
		case PLATFORM_USED_MEMORY:
			return Metric.KILOBYTES;
		case IDLE_CPU_LOAD:
		case IRQ_CPU_LOAD:
		case SYSTEM_CPU_LOAD:
		case SYSTEM_LOAD_AVERAGE:
		case USER_CPU_LOAD:
		case WAIT_CPU_LOAD:
		//platform metrics
		case PLATFORM_AVG_CPU_USAGE:
		case PLATFORM_CPU_USAGE:
			return Metric.PERCENTAGE;
		//system metrics
		case IDLE_CPU_TIME:
		case IRQ_CPU_TIME:
		case SYSTEM_CPU_TIME:
		case USER_CPU_TIME:
		case WAIT_CPU_TIME:
		//method metrics
		case PROCESS_TOTAL_CPU_TIME:
		case THREAD_BLOCK_TIME:
		case THREAD_GCC_TIME:
		case THREAD_SYSTEM_CPU_TIME:
		case THREAD_TOTAL_CPU_TIME:
		case THREAD_USER_CPU_TIME:
		case THREAD_WAIT_TIME:
		case WALL_CLOCK_TIME:
		//platform metrics
		case PLATFORM_CPU_TIME:
		case PLATFORM_GCC_TIME:
		case PLATFORM_UPTIME:
			return Metric.TIMESTAMP;
		default:
			return Metric.NUMERIC;
		}
	};
	*/
}

function Chart(id, width, height) {
	this.id = id;
	
	this.fill = d3.scale.category20();
	
	//this.chartHeight = ((clientHeight * 90) / 100);
	this.allChartWidth = width;
	this.allChartHeight = height;

	this.leftSpaceWidth = 60;
	this.rightSpaceWidth = 20;
	this.topSpaceHeight = 10;
	this.bottomSpaceHeight = 10;
	this.chartWidth = this.allChartWidth - this.leftSpaceWidth - this.rightSpaceWidth;
	this.chartHeight = this.allChartHeight - this.topSpaceHeight - this.bottomSpaceHeight;
	
	this.h1 = ((this.chartHeight * 85) / 100);
	this.h2 = ((this.chartHeight * 15) / 100) - this.bottomSpaceHeight;
	//p = this.chartHeight - (this.h1 + this.h2 + 1);
	p = 20;
	this.chartMetrics = new Array();
	
	this.xFocus = d3.scale.linear().range([0, this.chartWidth]);
	this.xContext = d3.scale.linear().range([0, this.chartWidth]);
	this.y1 = d3.scale.linear().range([this.h1 - p, 0]);
	this.y2 = d3.scale.linear().range([this.h2, 0]);
	
	this.x0, // start of focus region
	this.x1, // end of focus region
	this.xx = null, // drag state

	this.minX;
	this.maxX;
	this.focusMinX = Infinity;
	this.focusMaxX = -Infinity;
	this.minY = Infinity;
	this.maxY = -Infinity;
	this.focusMinY = Infinity;
	this.focusMaxY = -Infinity;

	
	this.chartContainerVisible = false;
	
	this.chartSvgArea;
	
	this.focusArea;
	
	this.context;
	
	this.active;
	
	this.legend;
	
	this.valuePreview;
	
	this.mouseMoveHandlers = new Array();
	
	this.isBarTypeChart = false;
	
	this.lastX = null;
	
	this.xScaleTimeFormat = null;
}

Chart.prototype.init = function(color) {
	var chart = this;
	
	d3.select("#" + this.id)
		.append("div")
		.attr("class", "chart-settings")
		.style("left", (chart.allChartWidth - 26) + "px")
		.style("top", 10 + "px")
		.on("click", function() {chartSettingsDisplay(chart);});
	
	d3.select("#" + chart.id).on("mousemove", function() {
		for (var i = 0; i < chart.mouseMoveHandlers.length; i++) {
			chart.mouseMoveHandlers[i].call();
		}
		chart.showValues();
		if (chart.xx != null) {
			// Compute the new (clamped) focus region.
			var xy = chart.xContext.invert(d3.svg.mouse(chart.active[0][0])[0]);
			if (chart.xx < xy) {
				chart.x0 = chart.xx;
				chart.x1 = xy;
			} else if (chart.xx > xy) {
				chart.x0 = xy;
				chart.x1 = chart.xx;
			} else
				return;
			chart.x0 = Math.max(chart.xContext.domain()[0], chart.x0);
			chart.x1 = Math.min(chart.xContext.domain()[1], chart.x1);

			chart.isBarTypeChart = chart.fctIsBarTypeChart();
			
			chart.updateFocusData(chart.isBarTypeChart);
			
			chart.drawGrid();
			if (!chart.isBarTypeChart) {
				chart.updateFocus();
			} else {
				chart.drawBarChart();
			}
			
			//console.debug(chart.focusArea.selectAll("text")[0][0]);
			chart.focusArea.selectAll("#x0label").text(shortTime(new Date(chart.focusMinX)));
			chart.focusArea.selectAll("#x1label").text(shortTime(new Date(chart.focusMaxX)));

			chart.focusArea.selectAll("#y0label").text(chart.getYLabel(chart.focusMinY));
			chart.focusArea.selectAll("#y1label").text(chart.getYLabel(chart.focusMaxY));

			// Reposition the active region rect.
			chart.active.attr("x", chart.xContext(chart.x0)).attr("width", chart.xContext(chart.x1) - chart.xContext(chart.x0));
		}
	});
	d3.select("#" + chart.id).on("mouseup", function() {chart.xx = null;});

	this.chartSvgArea = d3.select("#" + this.id)
		.append("svg:svg")
		.attr("width", (this.allChartWidth - 4) + "px")
		.attr("height", (this.allChartHeight - 4) + "px")
		.style("position", "relative")
		.style("top", 2 + "px")
		.style("left", 2 + "px");
	
	this.chartSvgArea.append("svg:rect")
			.attr("pointer-events", "none")
			.attr("x", 0 + "px")
			.attr("y", 0 + "px")
			.attr("height", (this.allChartHeight  - 4)  + "px")
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
		.attr("id", "focusArea")
		.attr("transform", "translate(" + this.leftSpaceWidth + "," + this.topSpaceHeight + ")");
	
	this.context = this.chartSvgArea.append("svg:g")
		.attr("transform", "translate(" + this.leftSpaceWidth + "," + (this.topSpaceHeight + this.h1) + ")");
	
	this.legend = new Legend(this);
	
	this.valuePreview = new ValuePreview(this);
};

Chart.prototype.updateFocusData = function(isBarTypeChart) {
	var metrics = this.chartMetrics;
	var minY = Infinity, maxY = -Infinity;
	var minX = Infinity, maxX = -Infinity;
	for (var i = 0; i < metrics.length; i++) {
		var data = computeFocusData(this, metrics[i], isBarTypeChart);
		metrics[i].focusData = data;
		for (var j = 0; j < data.length; j++) {
			if (data[j].y < minY) {
				minY = data[j].y;
			}
			if (data[j].y > maxY) {
				maxY = data[j].y;
			}
			if (data[j].x < minX) {
				minX = data[j].x;
			}
			if (data[j].x > maxX) {
				maxX = data[j].x;
			}
		}
	}
	if (minY != maxY) { //only when there is something to display change the domain
		this.focusMinY = minY;
		this.focusMaxY = maxY;
		if (this.focusMinX > 0 && isBarTypeChart) { //give min bars some height (10 % from min and max Y)
			this.focusMinY = this.focusMinY - ((this.focusMaxY - this.focusMinY) / 10);
			if (this.focusMinY < 0) {
				this.focusMinY = 0;
			}
		}
		this.y1.domain([this.focusMinY, this.focusMaxY]);
	}
	if (minX != maxX) { //only when there is something to display change the domain
		this.focusMinX = minX;
		this.focusMaxX = maxX;
		this.xFocus.domain([ this.focusMinX, this.focusMaxX ]);
	}
};

Chart.prototype.updateFocus = function() {
	var chart = this;
	var multipleMetrics = (this.chartMetrics.length > 1);
	
	this.focusArea.selectAll("rect.bar").remove();
	this.focusArea.selectAll("text.bar").remove();
	
	// Update the x-scale. TODO Recycle this scale?
	//var tx = d3.scale.linear().domain([ this.x0, this.x1 ])
	//	.range([ 0, this.chartWidth ]);
	
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		//var newData = computeFocusData(chart, metrics[i]);
		
		// Recompute the focus path.
		if (multipleMetrics) {
			this.focusArea.select("#" + validID(metrics[i].metric))
			.data([metrics[i].focusData])
			.style("stroke", metrics[i].fill)
			.attr("d", 
				d3.svg.line().x(function(d) {
					return chart.xFocus(d.x);
				})
				.y(function(d) {
					return chart.y1(d.y);
				})
			);
		} else {
			this.focusArea.select("#" + validID(metrics[i].metric))
				.data([metrics[i].focusData])
				.style("fill", metrics[i].fill)
				.style("stroke", metrics[i].fill)
				.attr("d", 
					d3.svg.area().x(function(d) {
						return chart.xFocus(d.x);
					})
					//.y0(y1(0))
					.y0(chart.y1(chart.focusMinY))
					.y1(function(d) {
						return chart.y1(d.y);
					})
				);
		}
	}
};

Chart.prototype.updateContext = function() {
	var chart = this;
	var multipleMetrics = (this.chartMetrics.length > 1);
	
	// Update the x-scale. TODO Recycle this scale?
	//var tx = d3.scale.linear().domain([ this.x0, this.x1 ])
	//	.range([ 0, this.chartWidth ]);
	this.xContext.domain([ this.x0, this.x1 ]);
	
	var metrics = this.chartMetrics;
	var newData = new Array();
	var minY = Infinity, maxY = -Infinity;
	for (var i = 0; i < metrics.length; i++) {
		var data = computeFocusData(chart, metrics[i]);
		newData.push(data);
		for (var j = 0; j < data.length; j++) {
			if (data[j].y < minY) {
				minY = data[j].y;
			}
			if (data[j].y > maxY) {
				maxY = data[j].y;
			}
		}
	}
	if (minY != maxY) { //only when there is something to display change the domain
		this.y2.domain([minY, maxY]);
	}
	for (var i = 0; i < metrics.length; i++) {
		var newData = computeFocusData(chart, metrics[i]);
		
		// Recompute the focus path.
		if (multipleMetrics) {
			this.context.select("#" + validID(metrics[i].metric) + "Context")
			.data([newData])
			.attr("d", 
				d3.svg.line().x(function(d) {
					return chart.xContext(d.x);
				})
				.y(function(d) {
					return chart.y2(d.y);
				})
			);					
		} else {
			this.context.select("#" + validID(metrics[i].metric) + "Context")
				.data([newData])
				.attr("d", 
					d3.svg.area().x(function(d) {
						return chart.xContext(d.x);
					})
					//.y0(y1(0))
					.y0(chart.y2(minY))
					.y1(function(d) {
						return chart.y2(d.y);
					})
				);
		}
		
	}
				
	//console.debug(chart.focusArea.selectAll("text")[0][0]);
	chart.context.selectAll("#x0ContextLabel").text(shortTime(new Date(chart.x0)));
	chart.context.selectAll("#x1ContextLabel").text(shortTime(new Date(chart.x1)));
};

function computeFocusData(chart, metric, isBarTypeChart) {
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
				if (!isBarTypeChart && (firstMaxXData.x != chart.x1)) {
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
			if (!isBarTypeChart && (lastMinXData.x != chart.x0)) {
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

/*
Chart.prototype.createMetric = function (aMetric, aMetricLabel, aMethod, aMethodLabel) {
	var metric = new Metric();
	metric.metric = aMetric;
	metric.metricLabel = aMetricLabel;
	metric.method = aMethod;
	metric.methodLabel = aMethodLabel;
	return metric;
};
*/

Chart.prototype.acceptMetric = function (metric) {
	if (this.chartMetrics.length == 0) {
		return  true;
	}
	return metric.unit == this.chartMetrics[0].unit; 
};

Chart.prototype.addMetricToChart = function(metric) {
	metric.fill = this.fill(metric.metric);
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
	this.valuePreview.refreshValuePreview();
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
	this.valuePreview.refreshValuePreview();
};

Chart.prototype.displayChart = function() {
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		if (metrics[i].data.length == 0) {
			var metricData = null;
			getMetricData(this.createMetricJsonParameter(metrics[i]), function(data) {metricData = data;});
			metrics[i].data = this.processData(metrics[i], metricData);
			metrics[i].focusData = metrics[i].data;
			//this.computeScales();
		};
	};
	this.computeScales();
	this.drawChart();
	for (var i = 0; i < metrics.length; i++) {
		this.drawMetric(metrics[i]);
	}
	this.drawGrid();
};

Chart.prototype.getYLabel = function(value) {
	var metrics = this.chartMetrics;
	if (metrics.length == 0) {
		return "";
	}
	var aMetric = metrics[0];
	return aMetric.getFormattedValue(value);
};

Chart.prototype.processData = function(metric, data) {
	var newData = new Array();
	var metricType = metric.type();
	var lastValue = 0;
	for ( var i = 0, n = data.length, o; i < n; i++) {
		o = data[i];
		var value = 0;
		if (metricType == Metric.INCREMENT_TYPE) {
			if (i != 0) {
				//console.debug((+o.value) + " " + lastValue);
				value = (+o.value) - lastValue;
			}
			lastValue = (+o.value);
		} else {
			value = +o.value;
		}
		o = data[i] = {
			id: o.id,
			x : +time.parse(o.timestamp),
			y : value
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
	this.focusMinY = this.minY;
	this.focusMaxY = this.maxY;
	this.focusMinX = this.minX;
	this.focusMaxX = this.maxX;
};

Chart.prototype.drawMetric = function(metric) {
	var chart = this;
	var multipleMetrics = (chart.chartMetrics.length > 1);

	var focusPath = this.focusArea.append("svg:path").data([ metric.data ])
		.attr("id", validID(metric.metric));
	
	if (multipleMetrics) {
		focusPath.attr("d", d3.svg.line().x(function(d) {return chart.xFocus(d.x);})
				.y(function(d) {
					return chart.y1(d.y);
				}));
		focusPath.style("stroke", metric.fill);
		focusPath.style("stroke-width", "2px");
		focusPath.style("fill", "none");
	} else {
		focusPath.attr("d", d3.svg.area().x(function(d) {return chart.xFocus(d.x);})
				// .y0(y1(0))
				.y0(this.y1(this.minY))
				.y1(function(d) {
					return chart.y1(d.y);
				}));
		focusPath.style("fill", metric.fill);
		focusPath.style("fill-opacity", ".8");
		focusPath.style("stroke", metric.fill);
		focusPath.style("stroke-width", "1px");
	}
	
	var contextPath = this.context.insert("svg:path", "rect")
		.data([metric.data])
		.attr("id", validID(metric.metric) + "Context")
		.attr("pointer-events", "none");

	if (multipleMetrics) {
		contextPath.attr("d", d3.svg.line().x(function(d) {
			return chart.xContext(d.x);
		})
		.y(function(d) {
			return chart.y2(d.y);
		}));
		contextPath.style("stroke", metric.fill);
		contextPath.style("stroke-width", "1px");
		contextPath.style("fill", "none");
	} else {
		contextPath.attr("d", d3.svg.area().x(function(d) {
			return chart.xContext(d.x);
		})
		//.y0(y2(0))
		.y0(this.y2(this.minY)).y1(function(d) {
			return chart.y2(d.y);
		}));
		contextPath.style("fill", metric.fill);
		contextPath.style("stroke", "none");
	}

};

Chart.prototype.drawChart = function() {
	var chart = this;
	
	// Update x- and y-scales.
	this.xFocus.domain([ this.minX, this.maxX ]);
	this.xContext.domain([ this.minX, this.maxX ]);
	this.y1.domain([ this.minY, this.maxY ]);
	this.y2.domain([ this.minY, this.maxY ]);

	this.chartSvgArea.selectAll("rect").remove();
	this.chartSvgArea.selectAll("text").remove();
	
	// Focus view.
	this.focusArea.selectAll("rect.bar").remove();
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
			chart.xx = chart.xContext.invert(d3.svg.mouse(this)[0]);
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
		.attr("id", "x0ContextLabel")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("x", 0)
		.attr("y", this.h2 + 10)
		.text(shortTime(new Date(this.minX)));
	this.context.append("svg:text")
		.attr("id", "x1ContextLabel")
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
			.attr("x", this.xContext(this.x0 = this.minX))
			.attr("y", 0)
			.attr("height", this.h2)
			//.attr("width", this.x(this.x1 = (this.minX + 1e11)) - this.x(this.x0))
			.attr("width", this.xContext(this.x1 = this.maxX) - this.xContext(this.x0))
			.attr("fill", "lightcoral").attr("fill-opacity", .2);
};

Chart.prototype.drawGrid = function() {
	var verticalGridMinSpace = 120;
	var verticalGridLineCount = Math.floor(this.allChartWidth / verticalGridMinSpace) - 1 - 1; //substract 1 for the start and 1 for the rest which will be distributed
	
	var differenceTimeMilliSeconds = this.focusMaxX - this.focusMinX;
	var differenceTimeSeconds = Math.floor(differenceTimeMilliSeconds / 1000);
	var differenceTimeMinutes = Math.floor(differenceTimeSeconds / 60);
	var differenceTimeHours = Math.floor(differenceTimeMinutes / 60);
	var differenceTimeDays = Math.floor(differenceTimeHours / 24);
	var differenceTimeWeeks = Math.floor(differenceTimeDays / 7);
	var differenceTimeMonths = Math.floor(differenceTimeDays / 4);
	var differenceTimeYears = Math.floor(differenceTimeDays / 12);
	
	var areMilliSecondsGoodDivider = differenceTimeMilliSeconds > verticalGridLineCount;
	var areSecondsGoodDivider = differenceTimeSeconds > verticalGridLineCount;
	var areMinutesGoodDivider = differenceTimeMinutes > verticalGridLineCount;
	var areHoursGoodDivider = differenceTimeHours > verticalGridLineCount;
	var areDaysGoodDivider = differenceTimeDays > verticalGridLineCount;
	var areWeeksGoodDivider = differenceTimeWeeks > verticalGridLineCount;
	var areMonthsGoodDivider = differenceTimeMonths > verticalGridLineCount;
	var areYearsGoodDivider = differenceTimeYears > verticalGridLineCount;
	
	var increment = 0;
	var rest = 0;
	this.xScaleTimeFormat = null;
	if (!areMilliSecondsGoodDivider) {
		//can't diplay vertical grid cause not enough values 
		return;
	} else if (!areSecondsGoodDivider) {
		increment = Math.floor(differenceTimeMilliSeconds / verticalGridLineCount);
		rest = differenceTimeMilliSeconds % verticalGridLineCount;
		this.xScaleTimeFormat = d3.time.format("%S");
	} else if (!areMinutesGoodDivider) {
		increment = Math.floor(differenceTimeSeconds / verticalGridLineCount) * 1000;
		rest = (differenceTimeSeconds % verticalGridLineCount) * 1000;
		this.xScaleTimeFormat = d3.time.format("%M:%S");
	} else if (!areHoursGoodDivider) {
		increment = Math.floor(differenceTimeMinutes / verticalGridLineCount) * 1000 * 60;
		rest = (differenceTimeMinutes % verticalGridLineCount) * 1000 * 60;
		this.xScaleTimeFormat = d3.time.format("%M");
	} else if (!areDaysGoodDivider) {
		increment = Math.floor(differenceTimeHours / verticalGridLineCount) * 1000 * 60 * 60;
		rest = (differenceTimeHours % verticalGridLineCount) * 1000 * 60 * 60;
		this.xScaleTimeFormat = d3.time.format("%H:%M");
	} else if (!areWeeksGoodDivider) {
		increment = Math.floor(differenceTimeDays / verticalGridLineCount) * 1000 * 60 * 60 * 24;
		rest = (differenceTimeDays % verticalGridLineCount) * 1000 * 60 * 60 * 24;
		this.xScaleTimeFormat = d3.time.format("%a");
	} else if (!areMonthsGoodDivider) {
		increment = Math.floor(differenceTimeWeeks / verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7;
		rest = (differenceTimeWeeks % verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7;
		this.xScaleTimeFormat = d3.time.format("%W");
	} else if (!areYearsGoodDivider) {
		increment = Math.floor(differenceTimeMonths / verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7 * 4;
		rest = (differenceTimeMonths % verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7 * 4;
		this.xScaleTimeFormat = d3.time.format("%d %b");
	} else {
		increment = Math.floor(differenceTimeYears / verticalGridLineCount)  * 1000 * 60 * 60 * 24 * 7 * 4 * 12;
		rest = (differenceTimeYears % verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7 * 4 * 12;
		this.xScaleTimeFormat = d3.time.format("%b %y");		
	}

	var xValues = new Array();
	var restAdding = Math.floor(rest / verticalGridLineCount);
	for (var i = 1; i < verticalGridLineCount; i++) {
		xValues.push(this.focusMinX + (increment * i) + (restAdding * i));
	}
	
	this.focusArea.selectAll("line.x-grid").remove();
	this.focusArea.selectAll("line.y-grid").remove();
	this.focusArea.selectAll("text.x-grid").remove();
	this.focusArea.selectAll("text.y-grid").remove();
	
	var chart = this;
	this.focusArea.selectAll("line.x-grid")
		.data(xValues)
		.enter()
		.insert("svg:line", "path")
		.attr("class", "x-grid")
		.attr("x1", function(d) {return chart.xFocus(d);})
		.attr("x2", function(d) {return chart.xFocus(d);})
		.attr("y1", this.y1(this.focusMinY))
		.attr("y2", this.y1(this.focusMaxY));
	this.focusArea.selectAll("text.x-grid")
		.data(xValues)
		.enter()
		.insert("svg:text", "path")
		.attr("class", "x-grid")
		.style("font-family", "Verdana")
		.style("font-size", "8px")
		.style("text-anchor", "middle")
		.attr("x", function(d) {return chart.xFocus(d);})
		.attr("y", (this.h1 - p) + 10)
		.text(function(d) {
			if (!areSecondsGoodDivider) {
				return chart.xScaleTimeFormat(new Date(d)) + "." + (d % 1000);
			} else {
				return chart.xScaleTimeFormat(new Date(d));
			}
		});
	
	//
	
	var horizontalGridMinSpace = 60;
	var horizontalGridLineCount = Math.floor(this.allChartHeight / horizontalGridMinSpace) - 1 - 1; //substract 1 for the start and 1 for the rest which will be distributed
	var yValues = new Array();
	var yDifference = this.y1(this.focusMinY) - this.y1(this.focusMaxY);
	var yIncrement = Math.floor(yDifference / horizontalGridLineCount);
	var yRest = (yDifference) % horizontalGridLineCount;
	var yRestAdding = Math.floor(yRest / horizontalGridLineCount);
	for (var i = 1; i < horizontalGridLineCount; i++) {
		yValues.push(this.y1(this.focusMinY) - (yIncrement * i) - (yRestAdding * i));
	}
	
	this.focusArea.selectAll("line.y-grid")
		.data(yValues)
		.enter()
		.insert("svg:line", "path")
		.attr("class", "y-grid")
		.attr("x1", chart.xFocus(chart.focusMinX))
		.attr("x2", chart.xFocus(chart.focusMaxX))
		.attr("y1", function(d) {return d;})
		.attr("y2", function(d) {return d;});
	this.focusArea.selectAll("text.y-grid")
		.data(yValues)
		.enter()
		.insert("svg:text", "path")
		.attr("class", "y-grid")
		.style("font-family", "Verdana")
		.style("font-size", "8px")
		.style("text-anchor", "end")
		.attr("x", 0)
		.attr("y", function(d) {return d;})
		.text(function(d) {
			return chart.getYLabel(chart.y1.invert(d));
		});	

};

Chart.prototype.showValues = function() {
	if (this.isBarTypeChart || (this.chartMetrics.length == 0)) {
		return;
	}
	//var xy = chart.xContext.invert(d3.svg.mouse(chart.active[0][0])[0]);
	//chart.xx = chart.xContext.invert(d3.svg.mouse(this)[0]);
	//console.debug(this.xFocus.invert(d3.svg.mouse(this.focusArea[0][0])[0]));
	var x = this.xFocus.invert(d3.svg.mouse(this.focusArea[0][0])[0]);
	if (x == this.lastX) {
		return;
	}
	this.lastX = x;
	var metrics = this.chartMetrics;
	var dataValues = new Array();
	for (var i = 0; i < metrics.length; i++) {
		var metric = metrics[i];
		var dataValue = null;
		var mainDiff = Infinity;
		for (var j = 0; j < metric.focusData.length; j++) {
			var diff = Math.abs(x - metric.focusData[j].x);
			if (diff < mainDiff) {
				dataValue = metric.focusData[j];
				mainDiff = diff;
			}
		}
		dataValues.push(dataValue);
		
		d3.select("#" + validID(metric.metric) + "ValuePreviewLabel")
			.text(shortTime(new Date(dataValue.x)) + " - " + metric.getFormattedValue(dataValue.y));
	}

	var chart = this;

	this.focusArea.selectAll("circle.value").remove();
	this.focusArea.selectAll("circle.value")
		.data(dataValues).enter()
		.append("svg:circle")
		.attr("class", "value")
		.attr("cx", function(d) {
			return chart.xFocus(d.x);
		})
		.attr("cy", function(d) {
			return chart.y1(d.y);
		})
		.attr("r", "2")
		.style("fill", "red");
	
};
