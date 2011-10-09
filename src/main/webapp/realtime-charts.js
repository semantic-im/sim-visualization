var loadDataInterval, displayChartInterval;

var	chartsDashboardHeight = clientHeight - 20,
	chartsDashboardWidth = clientWidth - 20;
var chartColors = d3.scale.category10();
var chart1, chart2;
var time = d3.time.format("%Y-%m-%dT%H:%M:%S"), shortTime = d3.time.format("%d.%m.%y %H:%M:%S");

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

var CHART_DATA_COUNT = 100; //the number of points to get from DB
var CHART_MIN_POINTS = 50; //the number of points to use for chart 
var MAX_POINTS_FROM_BUFFER = 2;//the maximum points to read from the buffer of data
var xGridValues = new Array();

Metric.SYSTEM = "SystemType";
Metric.PLATFORM = "PlatformType";

REALTIME_CHART_TRANSITION_DURATION = 5000;
REALTIME_CHART_DISPLAY_UPDATE = 5000;
REALTIME_CHART_LOAD_DATA_INTERVAL = 30000;

function RealtimeMetric(id, type, label, description, unit, unitLabel) {

	this.metricType = type;
	
	this.metric = id;
	this.metricLabel = label;
	this.method = null;
	this.methodLabel = null;
	
	this.description = description;
	this.unit = unit;
	this.unitLabel = unitLabel;
	
	this.fill = null;
	
	this.data = new Array();
	this.bufferData = new Array();
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
	
}

function RealtimeChart(id, width, height) {
	this.id = id;
	
	this.fill = d3.scale.category20();
	
	//this.chartHeight = ((clientHeight * 90) / 100);
	this.allChartWidth = width;
	this.allChartHeight = height;

	this.leftSpaceWidth = 40;
	this.rightSpaceWidth = 20;
	this.topSpaceHeight = 10;
	this.bottomSpaceHeight = 20;
	this.chartWidth = this.allChartWidth - this.leftSpaceWidth - this.rightSpaceWidth;
	this.chartHeight = this.allChartHeight - this.topSpaceHeight - this.bottomSpaceHeight;
	
	this.chartMetrics = new Array();
	
	this.xFocus = d3.scale.linear().range([-200, this.chartWidth + 10]);
	//this.xContext = d3.scale.linear().range([0, this.chartWidth]);
	this.y = d3.scale.linear().range([this.chartHeight, 0]);
	
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
	
	//this.valuePreview;
	
	this.mouseMoveHandlers = new Array();
	
	this.isBarTypeChart = false;
	
	this.lastX = null;
	
	this.xScaleTimeFormat = null;
	
}

RealtimeChart.prototype.init = function(color) {
	var chart = this;
	
	d3.select("#" + chart.id).on("mousemove", function() {
		for (var i = 0; i < chart.mouseMoveHandlers.length; i++) {
			chart.mouseMoveHandlers[i].call();
		}
	});

	this.chartSvgArea = d3.select("#" + this.id)
		.append("svg:svg")
		.attr("width", (this.allChartWidth - 4) + "px")
		.attr("height", (this.allChartHeight - 4) + "px")
		.style("position", "relative")
		.style("top", 2 + "px")
		.style("left", 2 + "px");
	
	
	this.focusArea = this.chartSvgArea.append("svg:g")
		.attr("id", validID(this.id + "RealtimeFocusArea"))
		.attr("transform", "translate(" + this.leftSpaceWidth + "," + this.topSpaceHeight + ")");

	this.focusArea.append("svg:rect")
		.attr("x", -this.leftSpaceWidth)
		.attr("y", -1)
		.attr("width", this.leftSpaceWidth)
		.attr("height", this.allChartHeight + 1)
		.style("fill", "white");
	
	this.focusArea.append("svg:rect")
		.attr("x", this.chartWidth)
		.attr("y", -1)
		.attr("width", this.rightSpaceWidth)
		.attr("height", this.allChartHeight + 1)
		.style("fill", "white");

	this.legend = new Legend(this);
	
	//this.valuePreview = new ValuePreview(this);
};

RealtimeChart.prototype.processData = function(metric, data) {
	var newData = new Array();
	var metricType = metric.type();
	var lastValue = 0;
	data.reverse();
	for ( var i = 0, n = data.length, o; i < n; i++) {
		data[i].timestamp = data[i].timestamp.substr(0, data[i].timestamp.indexOf("^^"));
		data[i].value = data[i].value.substr(0, data[i].value.indexOf("^^"));
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

RealtimeChart.prototype.addMetricToChart = function(metric) {
	metric.fill = this.fill(metric.metric);
	this.chartMetrics.push(metric);
};


RealtimeChart.prototype.loadChartData = function() {
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		metrics[i].loaded = false;
		this.loadData(i, metrics[i]);
	};
};

RealtimeChart.prototype.loadData = function(index, metric) {
	var sparql = null;
	sparql = "select ?metricid ?timestamp ?value "
		+ "	where { "
		+ "		?metricid rdf:type <" + metric.metric + "> ."
		+ "		?metricid :hasTimeStamp ?timestamp ."
		+ "		?metricid :hasDataValue ?value .";
	if (metric.metricType != Metric.SYSTEM) {
		sparql = sparql + "		" + selectedApplication.id + " :hasMeasurement ?metricid .";
	}
	sparql = sparql + "		" + selectedSystem.id + " :hasMeasurement ?metricid .";
	if (metric.data.length != 0 || metric.bufferData.length != 0) {
		var timeFilter = null;
		if (metric.bufferData.length != 0) {
			timeFilter = time(new Date(metric.bufferData[metric.bufferData.length - 1].x));
		} else {
			timeFilter = time(new Date(metric.data[metric.data.length - 1].x));
		}
		sparql = sparql + "		" + selectedSystem.id + " :hasMeasurement ?metricid ."
			+ "     FILTER (?timestamp > xsd:dateTime(\"" + timeFilter + "\"))";
	}
	sparql = sparql + "	} "
		+ "order by DESC(?timestamp) "
		+ "LIMIT " + CHART_DATA_COUNT + " OFFSET 0";
	var chart = this;
	executeSparql([ "metricid", "timestamp", "value" ], sparql, true, function(data) {chart.treatData(index, data);});
	setTimeout(function() {chart.checkAllDataLoadedFct();}, 1000);
};

RealtimeChart.prototype.checkAllDataLoadedFct = function() {
	var metrics = this.chartMetrics;
	var chart = this;
	var notLoaded = false;
	for (var i = 0; i < metrics.length; i++) {
		if (!metrics[i].loaded) {
			notLoaded = true;
			break;
		}
	}
	if (notLoaded) {
		/*
		  var date = new Date();
		  var curDate = null;
		  do { curDate = new Date(); }
		  while(curDate-date < 1000);
		*/
		setTimeout(function() {chart.checkAllDataLoadedFct();}, 1000);
	}
};

RealtimeChart.prototype.treatData = function(index, data) {
	var metrics = this.chartMetrics;
	data = this.processData(metrics[index], data);
	for (var i = 0; i < data.length; i++) {
		metrics[index].bufferData.push(data[i]);
	}
	/*
	if (metrics[index].data.length > 0) {
		while (data.length > 0) {
			if (metrics[index].data.length == CHART_MIN_POINTS) {
				metrics[index].data.shift();
				metrics[index].pointsShifted++;
			}
			metrics[index].data.push(data.shift());
		}
	} else {
		metrics[index].data = data;
		//metrics[index].focusData = metrics[index].data;
	}
	*/
	metrics[index].loaded = true;
};

RealtimeChart.prototype.displayChart = function() {
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		metrics[i].pointsShifted = 0;
		if (metrics[i].data.length != 0) {
			for (var j = 0; j < Math.min(MAX_POINTS_FROM_BUFFER, metrics[i].bufferData.length); j++) {
				if (metrics[i].data.length == CHART_MIN_POINTS) {
					metrics[i].data.shift();
					metrics[i].pointsShifted++;
				}
				metrics[i].data.push(metrics[i].bufferData.shift());
			}
		} else {
			for (var j = 0; j < Math.min(CHART_MIN_POINTS, metrics[i].bufferData.length); j++) {
				metrics[i].data.push(metrics[i].bufferData[j]);
			}
			metrics[i].bufferData = new Array();
		}
	}
	this.computeScales();
	this.drawChart();
	for (var i = 0; i < metrics.length; i++) {
		this.drawMetric(metrics[i]);
	}
	this.showValues();
	this.drawGrid();
};

RealtimeChart.prototype.computeScales = function() {
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

RealtimeChart.prototype.drawMetric = function(metric) {
	var chart = this;
	var multipleMetrics = (chart.chartMetrics.length > 1);
	
	var line = d3.svg.line()
		.x(function(d,i) { 
			return chart.xFocus(d.x); 
		})
		.y(function(d) { 
			return chart.y(d.y); 
		});
		//.interpolate("linear");

	var focusPath = this.focusArea.select("#" + validID(metric.metric));
	if (focusPath.empty()) {
		var focusPath = this.focusArea.insert("svg:path", "rect")
			.attr("d", line(metric.data))
			.attr("id", validID(metric.metric));

		if (multipleMetrics) {
			focusPath.style("stroke", metric.fill);
			focusPath.style("stroke-width", "2px");
			focusPath.style("fill", "none");
		} else {
			focusPath.style("fill", metric.fill);
			focusPath.style("fill-opacity", ".8");
			focusPath.style("stroke", metric.fill);
			focusPath.style("stroke-width", "1px");
		}
	}
	
	var focusPath = this.focusArea.selectAll("#" + validID(metric.metric));
	
	var translate1 = chart.xFocus(metric.data[metric.pointsShifted].x) - chart.xFocus(metric.data[0].x);
	if (multipleMetrics) {
		/*
		focusPath
			.data([metric.data])
			.attr("transform", "translate(" + translate1 + ")")
			.attr("d", line)
			.transition()
			.ease("linear")
			.duration(REALTIME_CHART_TRANSITION_DURATION)
			.attr("transform", "translate(0)");
		*/
		focusPath
			.data([metric.data])
			.attr("d", line);
	} else {
		focusPath.attr("d", d3.svg.area().x(function(d) {return chart.xFocus(d.x);})
				// .y0(y1(0))
				.y(this.y(this.minY))
				.y1(function(d) {
					return chart.y(d.y);
				}));
	}	

};

RealtimeChart.prototype.drawChart = function() {
	var chart = this;
	
	//this.focusArea.selectAll("circle.value").remove();
	
	// Update x- and y-scales.
	this.xFocus.domain([ this.minX, this.maxX ]);
	this.y.domain([ this.minY, this.maxY ]);

	//this.chartSvgArea.selectAll("rect").remove();
	//this.chartSvgArea.selectAll("text").remove();
	
	// Focus view.
	this.focusArea.selectAll("rect.bar").remove();
	//this.focusArea.selectAll("path").remove();

	this.focusArea.selectAll("line.chart").remove();
	this.focusArea.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", this.chartWidth)
		.attr("y1", this.y(this.minY))
		.attr("y2", this.y(this.minY));
	this.focusArea.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", this.y(this.minY))
		.attr("y2", this.y(this.maxY));
	this.focusArea.select("#" + validID(this.id + "y0label")).remove();
	this.focusArea.append("svg:text")
		.attr("id", validID(this.id + "y0label"))
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", 0)
		.attr("y", this.chartHeight)
		.text(this.getYLabel(this.minY));
	this.focusArea.select("#" + validID(this.id + "y1label")).remove();
	this.focusArea.append("svg:text")
		.attr("id", validID(this.id + "y1label"))
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", 0)
		.attr("y", 0 + 10)
		.text(this.getYLabel(this.maxY));	

};

RealtimeChart.prototype.getYLabel = function(value) {
	var metrics = this.chartMetrics;
	if (metrics.length == 0) {
		return "";
	}
	var aMetric = metrics[0];
	return aMetric.getFormattedValue(value);
};

function xGridId(d) {
	return d.id;
}

RealtimeChart.prototype.drawGrid = function() {
	var verticalGridMinSpace = 120;
	var chart = this;
	
	var verticalGridLineCount = Math.floor(this.chartWidth / verticalGridMinSpace) + 1;
	
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
	
	this.xGridIncrement = 0;
	this.xGridRestAdding = 0;
	
	var rest = 0;
	this.xScaleTimeFormat = null;
	if (!areMilliSecondsGoodDivider) {
		//can't diplay vertical grid cause not enough values 
		return;
	} else if (!areSecondsGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeMilliSeconds / verticalGridLineCount);
		rest = differenceTimeMilliSeconds % verticalGridLineCount;
		this.xScaleTimeFormat = d3.time.format("%S");
	} else if (!areMinutesGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeSeconds / verticalGridLineCount) * 1000;
		rest = (differenceTimeSeconds % verticalGridLineCount) * 1000;
		this.xScaleTimeFormat = d3.time.format("%M:%S");
	} else if (!areHoursGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeMinutes / verticalGridLineCount) * 1000 * 60;
		rest = (differenceTimeMinutes % verticalGridLineCount) * 1000 * 60;
		this.xScaleTimeFormat = d3.time.format("%M");
	} else if (!areDaysGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeHours / verticalGridLineCount) * 1000 * 60 * 60;
		rest = (differenceTimeHours % verticalGridLineCount) * 1000 * 60 * 60;
		this.xScaleTimeFormat = d3.time.format("%H:%M");
	} else if (!areWeeksGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeDays / verticalGridLineCount) * 1000 * 60 * 60 * 24;
		rest = (differenceTimeDays % verticalGridLineCount) * 1000 * 60 * 60 * 24;
		this.xScaleTimeFormat = d3.time.format("%a");
	} else if (!areMonthsGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeWeeks / verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7;
		rest = (differenceTimeWeeks % verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7;
		this.xScaleTimeFormat = d3.time.format("%W");
	} else if (!areYearsGoodDivider) {
		this.xGridIncrement = Math.floor(differenceTimeMonths / verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7 * 4;
		rest = (differenceTimeMonths % verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7 * 4;
		this.xScaleTimeFormat = d3.time.format("%d %b");
	} else {
		this.xGridIncrement = Math.floor(differenceTimeYears / verticalGridLineCount)  * 1000 * 60 * 60 * 24 * 7 * 4 * 12;
		rest = (differenceTimeYears % verticalGridLineCount) * 1000 * 60 * 60 * 24 * 7 * 4 * 12;
		this.xScaleTimeFormat = d3.time.format("%b %y");		
	}
	xGridValues = new Array();
	this.xGridRestAdding = Math.floor(rest / verticalGridLineCount);
	for (var i = 0; i < verticalGridLineCount; i++) {
		var value = new Object();
		value.id = i;
		value.value = this.xFocus.invert(0) +  (this.xGridIncrement * i) + (this.xGridRestAdding * i);
		xGridValues.push(value);
	}

	this.focusArea.selectAll("line.x-grid").remove();
	this.focusArea.selectAll("line.x-grid")
		.data(xGridValues, xGridId)
		.enter()
		.insert("svg:line")
		.attr("class", "x-grid")
		.attr("x1", function(d) {return chart.xFocus(d.value);})
		.attr("x2", function(d) {return chart.xFocus(d.value);})
		.attr("y1", this.y(this.focusMinY))
		.attr("y2", this.y(this.focusMaxY));
	
	this.focusArea.selectAll("text.x-grid").remove();
	this.focusArea.selectAll("text.x-grid")
		.data(xGridValues, xGridId)
		.enter()
		.insert("svg:text")
		.attr("class", "x-grid")
		.style("font-family", "Verdana")
		.style("font-size", "8px")
		.style("text-anchor", "middle")
		.attr("x", function(d) {return chart.xFocus(d.value);})
		.attr("y", this.chartHeight + 10)
		.text(function(d) {
			if (!areSecondsGoodDivider) {
				return chart.xScaleTimeFormat(new Date(d.value)) + "." + (d.value % 1000);
			} else {
				return chart.xScaleTimeFormat(new Date(d.value));
			}
		});

	//
	
	var horizontalGridMinSpace = 60;
	var horizontalGridLineCount = Math.floor(this.allChartHeight / horizontalGridMinSpace) - 1 - 1; //substract 1 for the start and 1 for the rest which will be distributed
	var yValues = new Array();
	var yDifference = this.y(this.focusMinY) - this.y(this.focusMaxY);
	var yIncrement = Math.floor(yDifference / horizontalGridLineCount);
	var yRest = (yDifference) % horizontalGridLineCount;
	var yRestAdding = Math.floor(yRest / horizontalGridLineCount);
	for (var i = 1; i < horizontalGridLineCount; i++) {
		yValues.push(this.y(this.focusMinY) - (yIncrement * i) - (yRestAdding * i));
	}
	
	this.focusArea.selectAll("line.y-grid").remove();
	this.focusArea.selectAll("line.y-grid", "path")
		.data(yValues)
		.enter()
		.insert("svg:line", "path")
		.attr("class", "y-grid")
		.attr("x1", chart.xFocus(chart.focusMinX))
		.attr("x2", chart.xFocus(chart.focusMaxX))
		.attr("y1", function(d) {return d;})
		.attr("y2", function(d) {return d;});
	this.focusArea.selectAll("text.y-grid").remove();
	this.focusArea.selectAll("text.y-grid")
		.data(yValues)
		.enter()
		.insert("svg:text")
		.attr("class", "y-grid")
		.style("font-family", "Verdana")
		.style("font-size", "8px")
		.style("text-anchor", "end")
		.attr("x", 0)
		.attr("y", function(d) {return d;})
		.text(function(d) {
			return chart.getYLabel(chart.y.invert(d));
		});	

};

RealtimeChart.prototype.showValues = function() {
	if (this.chartMetrics.length == 0) {
		return;
	}
	var metrics = this.chartMetrics;
	var dataValues = new Array();
	for (var i = 0; i < metrics.length; i++) {
		var metric = metrics[i];
		var dataValue = metric.data[metric.data.length -1 - metric.pointsShifted];
		dataValues.push(dataValue);
		
		d3.select("#" + validID(metric.metric) + "ValuePreviewLabel")
			.text(shortTime(new Date(dataValue.x)) + ", " + metric.getFormattedValue(dataValue.y));
	}

};

function startRealtimeCharts() {
	d3.select("#realtime-charts-dashboard").selectAll("div").remove();
	
	d3.select("#realtime-charts-dashboard")
		.style("width", chartsDashboardWidth + "px")
		.style("height", chartsDashboardHeight + "px")
		.style("top", 2 + "px")
		.style("left", 2 + "px");

	d3.select("#realtime-charts-dashboard").append("div").attr("id", "realtime_chart1")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px");
		//.style("display", "inline-block");
	
	chart1 = new RealtimeChart("realtime_chart1", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	chart1.init(chartColors(1));
	chart1.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#SystemCPULoad', Metric.SYSTEM, 'System CPU Load', 'description', ':Percent', '%'));
	chart1.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#UserCPULoad', Metric.SYSTEM, 'User CPU Load', 'description', ':Percent', '%'));
	chart1.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#IdleCPULoad', Metric.SYSTEM, 'Idle CPU Load', 'description', ':Percent', '%'));
	chart1.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#WaitCPULoad', Metric.SYSTEM, 'Wait CPU Load', 'description', ':Percent', '%'));
	
	d3.select("#realtime-charts-dashboard").append("div").attr("id", "realtime_chart2")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px")
		.style("top", ((chartsDashboardHeight - 2) / 2) + "px")
		.style("left", 0 + "px");
	
	chart2 = new RealtimeChart("realtime_chart2", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	chart2.init(chartColors(2));
	chart2.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformAllocatedMemory', Metric.PLATFORM, 'Platform Allocated Memory', 'description', ':Byte', 'b'));
	chart2.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformFreeMemory', Metric.PLATFORM, 'Platform Free Memory', 'description', ':Byte', 'b'));
	chart2.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformUnallocatedMemory', Metric.PLATFORM, 'Platform Unallocated Memory', 'description', ':Byte', 'b'));
	chart2.addMetricToChart(new RealtimeMetric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformUsedMemory', Metric.PLATFORM, 'Platform Used Memory', 'description', ':Byte', 'b'));
	
	chart1.loadChartData();
	chart2.loadChartData();
	
	loadDataInterval = setInterval(loadDataFct, REALTIME_CHART_LOAD_DATA_INTERVAL);
	
	chart1.legend.refreshLegend(false);
	chart2.legend.refreshLegend(false);
	
	displayChartInterval = setInterval(displayChartFct, REALTIME_CHART_DISPLAY_UPDATE);
};

function stopRealtimeCharts() {
	clearInterval(loadDataInterval);
	clearInterval(displayChartInterval);
}

var loadDataFct = function() {
	chart1.loadChartData();
	chart2.loadChartData();	
};

var displayChartFct = function() {
	chart1.displayChart();
	chart2.displayChart();	
};
