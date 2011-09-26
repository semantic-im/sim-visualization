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

function Metric(id, label, description, unit, unitLabel) {

	this.metric = id;
	this.metricLabel = label;
	this.method = null;
	this.methodLabel = null;
	
	this.description = description;
	this.unit = unit;
	this.unitLabel = unitLabel;
	
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
	
}

function Chart(id, width, height) {
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
	
	this.xFocus = d3.scale.linear().range([0, this.chartWidth]);
	this.xContext = d3.scale.linear().range([0, this.chartWidth]);
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
	
	this.valuePreview;
	
	this.mouseMoveHandlers = new Array();
	
	this.isBarTypeChart = false;
	
	this.lastX = null;
	
	this.xScaleTimeFormat = null;
	
}

Chart.prototype.init = function(color) {
	var chart = this;
	
	d3.select("#" + chart.id).on("mousemove", function() {
		for (var i = 0; i < chart.mouseMoveHandlers.length; i++) {
			chart.mouseMoveHandlers[i].call();
		}
		chart.showValues();
	});

	this.chartSvgArea = d3.select("#" + this.id)
		.append("svg:svg")
		.attr("width", (this.allChartWidth - 4) + "px")
		.attr("height", (this.allChartHeight - 4) + "px")
		.style("position", "relative")
		.style("top", 2 + "px")
		.style("left", 2 + "px");
	
	this.focusArea = this.chartSvgArea.append("svg:g")
		.attr("id", "focusArea")
		.attr("transform", "translate(" + this.leftSpaceWidth + "," + this.topSpaceHeight + ")");
	
	this.legend = new Legend(this);
	
	this.valuePreview = new ValuePreview(this);
};

Chart.prototype.processData = function(metric, data) {
	var newData = new Array();
	var metricType = metric.type();
	var lastValue = 0;
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

Chart.prototype.addMetricToChart = function(metric) {
	metric.fill = this.fill(metric.metric);
	this.chartMetrics.push(metric);
};


Chart.prototype.displayChart = function() {
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		metrics[i].loaded = false;
		this.loadData(i, metrics[i]);
	};
	
	/*
	this.computeScales();
	this.drawChart();
	for (var i = 0; i < metrics.length; i++) {
		this.drawMetric(metrics[i]);
	}
	this.drawGrid();
	*/
};

Chart.prototype.loadData = function(index, metric) {
	var sparql = "select ?metricid ?timestamp ?value "
			+ "	where { "
			+ "		?metricid rdf:type <" + metric.metric + "> ."
			+ "		?metricid :hasTimeStamp ?timestamp ."
			+ "		?metricid :hasDataValue ?value ."
			+ "	} "
			+ "order by ASC(?timestamp) "
			+ "LIMIT 200 OFFSET 0";
	var chart = this;
	executeSparql([ "metricid", "timestamp", "value" ], sparql, true, function(data) {chart.treatData(index, data);});
	setTimeout(function() {chart.checkAllDataLoadedFct();}, 100);
};

Chart.prototype.checkAllDataLoadedFct = function() {
	var metrics = this.chartMetrics;
	var chart = this;
	var notLoaded = false;
	for (var i = 0; i < metrics.length; i++) {
		if (!metrics[i].loaded) {
			notLoaded = true;
			break;
		}
	}
	if (!notLoaded) {
		this.continueDisplayChart();
	} else {
		  var date = new Date();
		  var curDate = null;
		  do { curDate = new Date(); }
		  while(curDate-date < 1000);

		setTimeout(function() {chart.checkAllDataLoadedFct();}, 100);
	}
};

Chart.prototype.treatData = function(index, data) {
	var metrics = this.chartMetrics;
	metrics[index].data = this.processData(metrics[index], data);
	metrics[index].focusData = metrics[index].data;
	metrics[index].loaded = true;
};

Chart.prototype.continueDisplayChart = function() {
	this.computeScales();
	this.drawChart();
	var metrics = this.chartMetrics;
	for (var i = 0; i < metrics.length; i++) {
		this.drawMetric(metrics[i]);
	}
	this.drawGrid();
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
					return chart.y(d.y);
				}));
		focusPath.style("stroke", metric.fill);
		focusPath.style("stroke-width", "2px");
		focusPath.style("fill", "none");
	} else {
		focusPath.attr("d", d3.svg.area().x(function(d) {return chart.xFocus(d.x);})
				// .y0(y1(0))
				.y0(this.y(this.minY))
				.y1(function(d) {
					return chart.y(d.y);
				}));
		focusPath.style("fill", metric.fill);
		focusPath.style("fill-opacity", ".8");
		focusPath.style("stroke", metric.fill);
		focusPath.style("stroke-width", "1px");
	}
	
};

Chart.prototype.drawChart = function() {
	var chart = this;
	
	// Update x- and y-scales.
	this.xFocus.domain([ this.minX, this.maxX ]);
	this.y.domain([ this.minY, this.maxY ]);

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
		.attr("y1", this.y(this.minY))
		.attr("y2", this.y(this.minY));
	this.focusArea.append("svg:line")
		.attr("class", "chart")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", this.y(this.minY))
		.attr("y2", this.y(this.maxY));
	this.focusArea.selectAll("text").remove();
	this.focusArea.append("svg:text")
		.attr("id", "x0label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("x", 0)
		.attr("y", this.chartHeight + 10)
		.text(shortTime(new Date(this.minX)));
	this.focusArea.append("svg:text")
		.attr("id", "x1label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", this.chartWidth)
		.attr("y", this.chartHeight + 10)
		.text(shortTime(new Date(this.maxX)));	
	this.focusArea.append("svg:text")
		.attr("id", "y0label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", 0)
		.attr("y", this.chartHeight)
		.text(this.getYLabel(this.minY));	
	this.focusArea.append("svg:text")
		.attr("id", "y1label")
		.attr("font-family", "Verdana")
		.attr("font-size", "8")
		.attr("text-anchor", "end")
		.attr("x", 0)
		.attr("y", 0 + 10)
		.text(this.getYLabel(this.maxY));	

};

Chart.prototype.getYLabel = function(value) {
	var metrics = this.chartMetrics;
	if (metrics.length == 0) {
		return "";
	}
	var aMetric = metrics[0];
	return aMetric.getFormattedValue(value);
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
		.attr("y1", this.y(this.focusMinY))
		.attr("y2", this.y(this.focusMaxY));
	this.focusArea.selectAll("text.x-grid")
		.data(xValues)
		.enter()
		.insert("svg:text", "path")
		.attr("class", "x-grid")
		.style("font-family", "Verdana")
		.style("font-size", "8px")
		.style("text-anchor", "middle")
		.attr("x", function(d) {return chart.xFocus(d);})
		.attr("y", this.chartHeight + 10)
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
	var yDifference = this.y(this.focusMinY) - this.y(this.focusMaxY);
	var yIncrement = Math.floor(yDifference / horizontalGridLineCount);
	var yRest = (yDifference) % horizontalGridLineCount;
	var yRestAdding = Math.floor(yRest / horizontalGridLineCount);
	for (var i = 1; i < horizontalGridLineCount; i++) {
		yValues.push(this.y(this.focusMinY) - (yIncrement * i) - (yRestAdding * i));
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
			return chart.getYLabel(chart.y.invert(d));
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
			return chart.y(d.y);
		})
		.attr("r", "2")
		.style("fill", "red");
	
};

$(document).ready(function() {
	d3.select("#charts-dashboard")
		.style("width", chartsDashboardWidth + "px")
		.style("height", chartsDashboardHeight + "px")
		.style("top", 20 + "px")
		.style("left", 2 + "px");

	d3.select("#charts-dashboard").append("div").attr("id", "chart1")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px");
		//.style("display", "inline-block");
	
	chart1 = new Chart("chart1", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	chart1.init(chartColors(1));
	chart1.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#SystemCPULoad', 'System CPU Load', 'description', ':Percent', '%'));
	chart1.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#UserCPULoad', 'User CPU Load', 'description', ':Percent', '%'));
	chart1.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#IdleCPULoad', 'Idle CPU Load', 'description', ':Percent', '%'));
	chart1.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#WaitCPULoad', 'Wait CPU Load', 'description', ':Percent', '%'));
	chart1.displayChart();
	chart1.legend.refreshLegend();
	chart1.valuePreview.refreshValuePreview();
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart2")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px")
		.style("top", ((chartsDashboardHeight - 2) / 2) + "px")
		.style("left", 0 + "px");
	
	chart2 = new Chart("chart2", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	chart2.init(chartColors(2));
	chart2.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformAllocatedMemory', 'Platform Allocated Memory.', 'description', ':Byte', 'b'));
	chart2.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformFreeMemory', 'Platform Free Memory.', 'description', ':Byte', 'b'));
	chart2.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformUnallocatedMemory', 'Platform Unallocated Memory.', 'description', ':Byte', 'b'));
	chart2.addMetricToChart(new Metric('http://www.larkc.eu/ontologies/IMOntology.rdf#PlatformUsedMemory', 'Platform Used Memory.', 'description', ':Byte', 'b'));
	chart2.displayChart();
	chart2.legend.refreshLegend();
	chart2.valuePreview.refreshValuePreview();
	
	setTimeout(refreshFct, 5000);
});

var refreshFct = function() {
	console.debug("ASdasd");
	chart1.displayChart();
	chart2.displayChart();	
	setTimeout(refreshFct, 5000);
};
