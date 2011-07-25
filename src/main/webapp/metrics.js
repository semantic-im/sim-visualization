var methods = getMethods();
var selectedMethodMetric ;
var grid = "r1x1";
var chartColors = d3.scale.category10();
var chart1, chart2, chart3, chart4;

function drawCloseIcon() {
	var context = $('#closeIcon')[0].getContext('2d');
	
	context.fillStyle  = "#666666";
	context.beginPath();
	context.moveTo(2, 0);
	context.lineTo(8, 6);
	context.lineTo(14, 0);
	context.lineTo(16, 2);
	context.lineTo(10, 8);
	context.lineTo(16, 14);
	context.lineTo(14, 16);
	context.lineTo(8, 10);
	context.lineTo(2, 16);
	context.lineTo(0, 14);
	context.lineTo(6, 8);
	context.lineTo(0, 2);
	context.closePath();
	context.fill();		
}

function drawCircle(canvas, radius, color) {
	var context = canvas.getContext('2d');
	//context.fillStyle  = "rgba(255, 0, 0, 1)";
	context.fillStyle  = color;
	context.beginPath();
	context.arc(radius, radius, radius, 0, Math.PI*2, true); 
	context.closePath();
	context.fill();		
}

function drawTriangle(canvas) {
	var context = canvas.getContext('2d');
	//context.fillStyle  = "rgba(255, 0, 0, 1)";
	context.fillStyle  = "#666666";
	context.beginPath();
	context.moveTo(4, 4);
	context.lineTo(12, 4);
	context.lineTo(8, 12);
	context.lineTo(4, 4);
	context.closePath();
	context.fill();		
}

function getLabel(metric) {
	if (metric == IO_READ) {
		return 'IO Read';
	} else if (metric == IO_WRITE) {
		return 'IO Write';
	} else if (metric == IDLE_CPU_LOAD) {
		return 'Idle CPU Load';
	} else if (metric == IDLE_CPU_TIME) {
		return 'Idle CPU Time';
	} else if (metric == IRQ_CPU_LOAD) {
		return 'Irq CPU Load';
	} else if (metric == IRQ_CPU_TIME) {
		return 'Irq CPU Time';
	} else if (metric == SWAP_IN) {
		return 'Swap In';
	} else if (metric == SWAP_OUT) {
		return 'Swap Out';
	} else if (metric == SYSTEM_CPU_LOAD) {
		return 'System CPU Load';
	} else if (metric == SYSTEM_CPU_TIME) {
		return 'System CPU Time';
	} else if (metric == SYSTEM_LOAD_AVERAGE) {
		return 'System Load Average';
	} else if (metric == SYSTEM_OPEN_FILE_DESCRIPTOR_COUNT) {
		return 'System open file descriptor count';
	} else if (metric == TOTAL_SYSTEM_FREE_MEMORY) {
		return 'Total System Free Memory';
	} else if (metric == TOTAL_SYSTEM_USED_MEMORY) {
		return 'Total System Used Memory';
	} else if (metric == TOTAL_SYSTEM_USED_SWAP) {
		return 'Total System Used Swap';
	} else if (metric == USER_CPU_LOAD) {
		return 'User CPU Load';
	} else if (metric == USER_CPU_TIME) {
		return 'User CPU Time';
	} else if (metric == WAIT_CPU_LOAD) {
		return 'Wait CPU Load';
	} else if (metric == WAIT_CPU_TIME) {
		return 'Wait CPU Time';
	}
	//method metrics
	  else if (metric == PROCESS_TOTAL_CPU_TIME) {
			return 'Process Total CPU time';
	} else if (metric == THREAD_BLOCK_COUNT) {
			return 'Thread Block Count';
	} else if (metric == THREAD_BLOCK_TIME) {
			return 'Thread Block Time';
	} else if (metric == THREAD_COUNT) {
			return 'Thread Count';
	} else if (metric == THREAD_GCC_COUNT) {
			return 'Thread Gcc Count';
	} else if (metric == THREAD_GCC_TIME) {
			return 'Thread Gcc Time';
	} else if (metric == THREAD_SYSTEM_CPU_TIME) {
			return 'Thread System CPU Time';
	} else if (metric == THREAD_TOTAL_CPU_TIME) {
			return 'Thread Total CPU Time';
	} else if (metric == THREAD_USER_CPU_TIME) {
			return 'Thread User CPU Time';
	} else if (metric == THREAD_WAIT_COUNT) {
			return 'Thread Wait Count';
	} else if (metric == THREAD_WAIT_TIME) {
			return 'Thread Wait Time';
	} else if (metric == WALL_CLOCK_TIME) {
			return 'Wallclock Time';
	}
}

$(document).ready(function() {
	var metricsSelectorHeight = (clientHeight - clientHeight * 0.1);
	var metricsSelectorPaddingHeight = 10;
	var metricsSelectorWidth = 450;
	var metricsSelector = d3.select("#metrics-selector")
		.style("height", metricsSelectorHeight + "px")
		.style("width", metricsSelectorWidth + "px")
		.style("padding-top", 10 + "px")
		.style("padding-bottom", 10 + "px")
		.style("top", ((clientHeight - metricsSelectorHeight - (metricsSelectorPaddingHeight * 2)) / 2) + "px");

	var metricsSelectorToggle = d3.select("#metrics-selector-toggle")
		.style("height", (metricsSelectorHeight) + "px")
		.style("width", 10 + "px")
		.style("top", 10 + "px")
		.style("left", (metricsSelectorWidth - 10) + "px")
		.on("mouseover", metricsSelectorToggleMouseover)
		.on("mouseout", metricsSelectorToggleMouseout);
	
	//callback function to bring a hidden box back
	function metricsSelectorToggleHideCallback() {
		d3.select("#metrics-selector").style("left", "-440px");
		$('#metrics-selector').show().fadeIn();
	};
	
	var hidden = false;
	$("#metrics-selector-toggle").click(function () {
		if (!hidden) {
			d3.select("#methods").style("display", "none");
			$("#metrics-selector").hide("slide", { direction: "left", distance: 440 }, 1000, metricsSelectorToggleHideCallback);
		} else {
			d3.select("#metrics-selector").style("left", "0px");
			$("#metrics-selector").show("slide", { direction: "left", distance: 440 }, 1000);
		}
		hidden = !hidden;
	});

	var systemMetricsSelector = d3.select("#system-metrics-selector");
	var systemMetricsDiv = systemMetricsSelector.append("div")
		.style("display", "inline-block");
		//.style("float", "left");
	for (var i = 0; i < systemMetrics.length; i++) {
		var systemMetricId = validID(systemMetrics[i]);
		var div = systemMetricsDiv.append("div")
			.attr("id",  systemMetricId + "Container")
			.attr("data", i)
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", systemMetricId + "Icon")
			.attr("width", "16")
			.attr("height", "16")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.text(getLabel(systemMetrics[i]));
		
		drawCircle($('#' + systemMetricId + 'Icon')[0], 8, "#ff7f0e");
		
		$('#' + systemMetricId + 'Container').draggable({
			helper: 'clone', 
			opacity: 0.7});
		if ((i + 1) % 4 == 0) {
			//systemMetricsDiv.append("br");
		}
	}

	var displaySettings = d3.select("#display-settings");
	// CHART GRID
	var gridDiv = displaySettings.append("div")
		.style("display", "inline-block")
		.style("vertical-align", "top")
		.style("text-align", "center")
		.style("width", "100px");
	
	gridDiv.append("input")
		.attr("id", "r1x1")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r1x1")
		.attr("checked", "true")
		.on("click", gridChanged);
	gridDiv.append("span")
		.text("1x1");		
	gridDiv.append("br");
	gridDiv.append("input")
		.attr("id", "r2x1")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r2x1")
		.on("click", gridChanged);
	gridDiv.append("span")
		.text("2x1");		
	gridDiv.append("br");
	gridDiv.append("input")
		.attr("id", "r2x2")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r2x2")
		.on("click", gridChanged);
	gridDiv.append("span")
		.text("2x2");		
	//~
	
	var methodMetricsSelector = d3.select("#method-metrics-selector");
	var methodMetricsDiv = methodMetricsSelector.append("div")
		.style("display", "inline-block")
		.style("vertical-align", "top");
		//.style("float", "right");
	for (var i = 0; i < methodMetrics.length; i++) {
		var methodMetricId = validID(methodMetrics[i]);
		var div = methodMetricsDiv.append("div")
			.attr("id",  methodMetricId + "Container")
			.attr("data", i)
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", methodMetricId + "Icon")
			.attr("width", "16")
			.attr("height", "16")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.style("pointer-events", "none")
			.text(getLabel(methodMetrics[i]));
		div.append("canvas")
			.attr("id", methodMetricId + "Icon1")
			.attr("width", "16")
			.attr("height", "16")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");

		drawCircle($('#' + methodMetricId + 'Icon')[0], 8, "#1f77b4");
		drawTriangle($('#' + methodMetricId + 'Icon1')[0]);
		
		$("#" + methodMetricId + "Container").click(function(eventObject) {
			displayMethods(eventObject);
		});
		
		if ((i + 1) % 4 == 0) {
			//methodMetricsDiv.append("br");
		}
	}

	var methodsDiv = d3.select("body").append("div")
		.attr("id", "methods")
		.style("display", "none")
		.style("position", "absolute")
		.style("height", "300px")
		.style("border", "1px solid black")
		.style("background", "white");
	var headerMethodsDiv = methodsDiv.append("div")
		.style("height", "20px")
		.style("background", "lightgrey");
	headerMethodsDiv.append("span")
		.attr("id", "methodsHeaderLabel")
		.style("font-family", "Verdana")
		.style("font-size", "14px");
	headerMethodsDiv.append("canvas")
		.attr("id", "closeIcon")
		.attr("width", "16")
		.attr("height", "16")
		.style("float", "right")
		.on("click", closeMethods);
	drawCloseIcon();
	var containerMethodsDiv = methodsDiv.append("div")
		.style("height", "280px")
		.style("overflow-y", "scroll");
	for (var i = 0; i < methods.length; i++) {
		var origMethodId = methods[i].substring(methods[i].lastIndexOf("#") + 1, methods[i].length);
		methodId = validID(origMethodId);
		var div = containerMethodsDiv.append("div")
			.attr("id",  methodId + "Container")
			.attr("data", systemMetrics.length + i)
			.attr("class",  "method-container");
		div.append("canvas")
			.attr("id", methodId + "Icon")
			.attr("width", "12")
			.attr("height", "12")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "method-label")
			.text(origMethodId);
		
		drawCircle($('#' + methodId + 'Icon')[0], 6, "#2ca02c");
		
		$('#' + methodId + 'Container').draggable({
			appendTo: 'body',
			scroll: false,
			helper: 'clone', 
			opacity: 0.7});
	}
		
	displayChart1x1();
});

function displayMethods(event) {
	selectedMethodMetric = methodMetrics[d3.select("#" + event.target.id).attr("data")];
	
	var methodsDiv = d3.select("#methods");
	methodsDiv.style("display", "inline-block");
	methodsDiv.style("top", event.pageY + "px");
	methodsDiv.style("left", event.pageX + "px");
	
	var methodsHeaderLabelDiv = d3.select("#methodsHeaderLabel");
	methodsHeaderLabelDiv.text(getLabel(selectedMethodMetric));
};

function closeMethods() {
	var methodsDiv = d3.select("#methods");
	methodsDiv.style("display", "none");	
}

function gridChanged() {
	if (grid == d3.event.target.id) {
		return; //same grid selected
	}
	if (grid == "r1x1") {
		d3.select("#chart1").remove();
	} else if (grid == "r2x1") {
		d3.select("#chart1").remove();
		d3.select("#chart2").remove();
	} else if (grid == "r2x2") {
		d3.select("#chart1").remove();
		d3.select("#chart2").remove();
		d3.select("#chart3").remove();
		d3.select("#chart4").remove();
	}
	grid = d3.event.target.id;
	if (grid == "r1x1") {
		displayChart1x1();
	} else if (grid == "r2x1") {
		displayChart2x1();
	} else if (grid == "r2x2") {
		displayChart2x2();
	}
}

function setDroppable(chart) {
	$( "#" + chart.id ).droppable({
		drop: function( event, ui ) {
			var dataIndex = ui.draggable.attr("data");
			if (dataIndex < systemMetrics.length) {
				chart.addMetricToChart(systemMetrics[dataIndex]);
			} else {
				chart.addMetricToChart(selectedMethodMetric, methods[dataIndex - systemMetrics.length]);
			}
		}
	});
}

function displayChart1x1() {
	d3.select("#charts").append("div").attr("id", "chart1");
	
	chart1 = new Chart("chart1", (clientWidth * 100) / 100, (clientHeight * 95) / 100);
	setDroppable(chart1);
	chart1.init(chartColors(1));
}

function displayChart2x1() {
	d3.select("#charts").append("div").attr("id", "chart1")
		.style("display", "inline-block");
	
	chart1 = new Chart("chart1", (clientWidth * 49) / 100, (clientHeight * 95) / 100);
	setDroppable(chart1);
	chart1.init(chartColors(1));
	
	d3.select("#charts").append("div").attr("id", "chart2")
		.style("display", "inline-block");
	
	chart2 = new Chart("chart2", (clientWidth * 49) / 100, (clientHeight * 95) / 100);
	setDroppable(chart2);
	chart2.init(chartColors(2));
}

function displayChart2x2() {
	d3.select("#charts").append("div").attr("id", "chart1")
		.style("display", "inline-block");
	chart1 = new Chart("chart1", (clientWidth * 49) / 100, (clientHeight * 45) / 100);
	setDroppable(chart1);
	chart1.init(chartColors(1));
	
	d3.select("#charts").append("div").attr("id", "chart2")
		.style("display", "inline-block");	
	chart2 = new Chart("chart2", (clientWidth * 49) / 100, (clientHeight * 45) / 100);
	setDroppable(chart2);
	chart2.init(chartColors(2));

	d3.select("#charts").append("div").attr("id", "chart3")
		.style("display", "inline-block");
	chart3 = new Chart("chart3", (clientWidth * 49) / 100, (clientHeight * 45) / 100);
	setDroppable(chart3);
	chart3.init(chartColors(3));

	d3.select("#charts").append("div").attr("id", "chart4")
		.style("display", "inline-block");
	chart4 = new Chart("chart4", (clientWidth * 49) / 100, (clientHeight * 45) / 100);
	setDroppable(chart4);
	chart4.init(chartColors(4));

}

function metricsSelectorToggleMouseover() {
	d3.select("#metrics-selector-toggle")
		.classed("mouseover", true);
}

function metricsSelectorToggleMouseout() {
	d3.select("#metrics-selector-toggle")
		.classed("mouseover", false);
}
