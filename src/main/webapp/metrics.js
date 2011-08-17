var	chartsDashboardHeight = clientHeight - 2 - 2, //2 from the border + 2 to not make it to fix
	chartsDashboardWidth = clientWidth - 2 - 2; //2 from the border + 2 to not make it to fix

var PLATFORM_METRIC_ICON_COLOR = "#8c564b",
	COMPOUND_METRIC_ICON_COLOR = "#17becf",
	ATOMIC_METRIC_ICON_COLOR = "#2ca02c";

var methods = getMethods();
var selectedMethodMetric, selectedMethodMetricLabel;
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

$(document).ready(function() {
	var metricsSelectorHeight = (clientHeight - clientHeight * 0.1);
	var metricsSelectorPaddingHeight = 10;
	var metricsSelectorWidth = 450;
	var metricsSelector = d3.select("#metrics-selector")
		.style("height", metricsSelectorHeight + "px")
		.style("width", metricsSelectorWidth + "px")
		.style("padding-top", 10 + "px")
		.style("padding-bottom", 10 + "px")
		.style("padding-left", 5 + "px")
		.style("top", ((clientHeight - metricsSelectorHeight - (metricsSelectorPaddingHeight * 2)) / 2) + "px");

	d3.select("#metrics-selector-scroll")
		.style("height", (metricsSelectorHeight - 20) + "px")
		.style("width", (metricsSelectorWidth - 20) + "px") //substract the slider and the toggle width
		.style("position", "relative");

	d3.select("#metrics-selector-content")
		.style("width", (metricsSelectorWidth - 20) + "px") //substract the slider and the toggle width
		.style("position", "relative");

	//METRICS SELECTOR TOGGLE
	var metricsSelectorToggle = d3.select("#metrics-selector-toggle")
		.style("position", "absolute")
		.style("height", (metricsSelectorHeight) + "px")
		.style("width", 10 + "px")
		.style("top", 10 + "px")
		.style("left", (metricsSelectorWidth - (10 - 5)) + "px") //substract this element width - the left pading of parent
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
	//~~
	
	//~add div for draggable over all divs
	d3.select("body").append("div").attr("id", "for-dragging")
		.style("position", "absolute").style("width", clientWidth).style("height", clientHeight)
		.style("z-index", "99");
		
	//~~
	
	//METRICS SELECTOR SLIDER
	var metricsSelectorSlider = d3.select("#metrics-selector-slider")
		.style("height", (metricsSelectorHeight - 20) + "px") //sbustract 20 for whn the slider is at min or max
		.style("width", 10 + "px")
		.style("top", (10 + 10) + "px") //add 10 for the reason explained on height
		.style("left", (metricsSelectorWidth - 20) + "px");
	
	function handleSliderChange(e, ui) {
	  var maxScroll = $("#metrics-selector-scroll").attr("scrollHeight") -
	                  $("#metrics-selector-scroll").height();	  
	  var scroll = (100 - ui.value) * (maxScroll / 100);
	  $("#metrics-selector-scroll").animate({scrollTop: scroll }, 1000);
	}

	function handleSliderSlide(e, ui)
	{
	  var maxScroll = $("#metrics-selector-scroll").attr("scrollHeight") -
	                  $("#metrics-selector-scroll").height();
	  var scroll = (100 - ui.value) * (maxScroll / 100);
	  $("#metrics-selector-scroll").attr({scrollTop: scroll });
	}
	
	$("#metrics-selector-slider").slider({
	    animate: true,
	    orientation: "vertical",
		min: 0,
		max: 100,
		value: 100,
	    change: handleSliderChange,
	    slide: handleSliderSlide
	  });
	//~~

	// CHART GRID
	var displaySettings = d3.select("#display-settings");
	var gridDiv = displaySettings.append("div")
		.style("display", "inline-block")
		.style("vertical-align", "top")
		.style("text-align", "center");
		//.style("width", "200px");
	
	gridDiv.append("input")
		.attr("id", "r1x1")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r1x1")
		.attr("checked", "true")
		.on("click", gridChanged);
	gridDiv.append("span")
		.attr("class", "metrics-title-label")
		.text("1x1");		
	gridDiv.append("input")
		.attr("id", "r2x1")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r2x1")
		.on("click", gridChanged);
	gridDiv.append("span")
		.attr("class", "metrics-title-label")
		.text("2x1");		
	gridDiv.append("input")
		.attr("id", "r4x1")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r4x1")
		.on("click", gridChanged);
	gridDiv.append("span")
		.attr("class", "metrics-title-label")
		.text("4x1");
	gridDiv.append("br");
	gridDiv.append("input")
		.attr("id", "r2x2")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r2x2")
		.on("click", gridChanged);
	gridDiv.append("span")
		.attr("class", "metrics-title-label")
		.text("2x2");		
	gridDiv.append("input")
		.attr("id", "r4x2")
		.attr("type", "radio")
		.attr("name", "grid")
		.attr("value", "r4x2")
		.on("click", gridChanged);
	gridDiv.append("span")
		.attr("class", "metrics-title-label")
		.text("4x2");
	//~

	//SYSTEM METRICS
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
			.attr("width", "12")
			.attr("height", "12")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.text(systemMetricLabels[i]);
		
		drawCircle($('#' + systemMetricId + 'Icon')[0], 6, "#ff7f0e");
		
		$('#' + systemMetricId + 'Container').draggable({
			appendTo: '#for-dragging',
			scroll: false,
			helper: 'clone', 
			opacity: 0.7});
	}
	//~~
		
	//METHOD METRICS
	var methodMetricsSelector = d3.select("#method-metrics-selector");
	var methodMetricsDiv = methodMetricsSelector.append("div")
		.style("display", "inline-block")
		.style("vertical-align", "top");
		//.style("float", "right");
	for (var i = 0; i < methodMetrics.length; i++) {
		var methodMetricId = validID(methodMetrics[i]);
		var div = methodMetricsDiv.append("div")
			.attr("id",  methodMetricId + "Container")
			.attr("data",  i)
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", methodMetricId + "Icon")
			.attr("width", "12")
			.attr("height", "12")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.style("pointer-events", "none")
			.text(methodMetricLabels[i]);
		div.append("canvas")
			.attr("id", methodMetricId + "Icon1")
			.attr("width", "16")
			.attr("height", "16")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");

		drawCircle($('#' + methodMetricId + 'Icon')[0], 6, "#1f77b4");
		drawTriangle($('#' + methodMetricId + 'Icon1')[0]);
		
		$("#" + methodMetricId + "Container").click(function(eventObject) {
			displayMethods(eventObject);
		});
	}

	var methodsDiv = d3.select("body").append("div")
		.attr("id", "methods")
		.style("display", "none")
		.style("position", "absolute")
		.style("z-index", "2")
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
			appendTo: '#for-dragging',
			scroll: false,
			helper: 'clone', 
			opacity: 0.7});
	}
	//~~
	
	//PLATFORM METRICS
	var platformMetricsSelector = d3.select("#platform-metrics-selector");
	var platformMetricsDiv = platformMetricsSelector.append("div")
		.style("display", "inline-block");
		//.style("float", "right");
	for (var i = 0; i < platformMetrics.length; i++) {
		var platformMetricId = validID(platformMetrics[i]);
		var div = platformMetricsDiv.append("div")
			.attr("id",  platformMetricId + "Container")
			.attr("data", systemMetrics.length + methods.length + i)
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", platformMetricId + "Icon")
			.attr("width", "12")
			.attr("height", "12")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.style("pointer-events", "none")
			.text(platformMetricLabels[i]);

		drawCircle($('#' + platformMetricId + 'Icon')[0], 6, PLATFORM_METRIC_ICON_COLOR);
		
		$('#' + platformMetricId + 'Container').draggable({
			appendTo: '#for-dragging',
			scroll: false,
			helper: 'clone', 
			opacity: 0.7});
	}
	//~~

	//COMPOUND METRICS
	var compoundMetricsSelector = d3.select("#compound-metrics-selector");
	var compoundMetricsDiv = compoundMetricsSelector.append("div")
		.style("display", "inline-block");
		//.style("float", "right");
	for (var i = 0; i < compoundMetrics.length; i++) {
		var compoundMetricId = validID(compoundMetrics[i]);
		var div = compoundMetricsDiv.append("div")
			.attr("id",  compoundMetricId + "Container")
			.attr("data", systemMetrics.length + methods.length + platformMetrics.length + i)
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", compoundMetricId + "Icon")
			.attr("width", "12")
			.attr("height", "12")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.style("pointer-events", "none")
			.text(compoundMetricLabels[i]);

		drawCircle($('#' + compoundMetricId + 'Icon')[0], 6, COMPOUND_METRIC_ICON_COLOR);
		
		$('#' + compoundMetricId + 'Container').draggable({
			appendTo: '#for-dragging',
			scroll: false,
			helper: 'clone', 
			opacity: 0.7});
	}
	//~~

	//ATOMIC METRICS
	var atomicMetricsSelector = d3.select("#atomic-metrics-selector");
	var atomicMetricsDiv = atomicMetricsSelector.append("div")
		.style("display", "inline-block");
		//.style("float", "right");
	for (var i = 0; i < atomicMetrics.length; i++) {
		var atomicMetricId = validID(atomicMetrics[i]);
		var div = atomicMetricsDiv.append("div")
			.attr("id",  atomicMetricId + "Container")
			.attr("data", systemMetrics.length + methods.length + platformMetrics.length + compoundMetrics.length + i)
			.attr("class",  "metric-container");
		div.append("canvas")
			.attr("id", atomicMetricId + "Icon")
			.attr("width", "12")
			.attr("height", "12")
			.style("pointer-events", "none")
			.attr("class", "metric-icon");
		div.append("span")
			.attr("class", "metric-label")
			.style("pointer-events", "none")
			.text(atomicMetricLabels[i]);

		drawCircle($('#' + atomicMetricId + 'Icon')[0], 6, ATOMIC_METRIC_ICON_COLOR);
		
		$('#' + atomicMetricId + 'Container').draggable({
			appendTo: '#for-dragging',
			scroll: false,
			helper: 'clone', 
			opacity: 0.7});
	}
	//~~

	//chart settings
	chartSettingsInit();
	//~~
	
	d3.select("#charts-dashboard")
		.style("width", chartsDashboardWidth + "px")
		.style("height", chartsDashboardHeight + "px")
		.style("top", 2 + "px")
		.style("left", 2 + "px");
	
	displayChart1x1();
});

function displayMethods(event) {
	var dataIndex = d3.select("#" + event.target.id).attr("data");
	selectedMethodMetric = methodMetrics[dataIndex];
	selectedMethodMetricLabel = methodMetricLabels[dataIndex];
	
	var methodsDiv = d3.select("#methods");
	methodsDiv.style("display", "inline-block");
	methodsDiv.style("top", event.pageY + "px");
	methodsDiv.style("left", event.pageX + "px");
	
	var methodsHeaderLabelDiv = d3.select("#methodsHeaderLabel");
	methodsHeaderLabelDiv.text(methodMetricLabels[dataIndex]);
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
	} else if (grid == "r4x1") {
		d3.select("#chart1").remove();
		d3.select("#chart2").remove();
		d3.select("#chart3").remove();
		d3.select("#chart4").remove();
	} else if (grid == "r2x2") {
		d3.select("#chart1").remove();
		d3.select("#chart2").remove();
		d3.select("#chart3").remove();
		d3.select("#chart4").remove();
	} else if (grid == "r4x2") {
		d3.select("#chart1").remove();
		d3.select("#chart2").remove();
		d3.select("#chart3").remove();
		d3.select("#chart4").remove();		
		d3.select("#chart5").remove();
		d3.select("#chart6").remove();
		d3.select("#chart7").remove();
		d3.select("#chart8").remove();
	}
	grid = d3.event.target.id;
	if (grid == "r1x1") {
		displayChart1x1();
	} else if (grid == "r2x1") {
		displayChart2x1();
	} else if (grid == "r4x1") {
		displayChart4x1();
	} else if (grid == "r2x2") {
		displayChart2x2();
	} else if (grid == "r4x2") {
		displayChart4x2();
	}
}

function createMetric(chart, dataIndex) {
	var index = -1;
	var metric = null;
	if (dataIndex < systemMetrics.length) {
		index = dataIndex;
		metric = chart.createMetric(systemMetrics[index], systemMetricLabels[index]);
	} else if (dataIndex < systemMetrics.length + methods.length ) {
		index = dataIndex - systemMetrics.length;
		metric = chart.createMetric(selectedMethodMetric, selectedMethodMetricLabel, methods[index], methods[index].substring(methods[index].lastIndexOf("#") + 1, methods[index].length));
	} else if (dataIndex < systemMetrics.length + methods.length + platformMetrics.length) {
		index = dataIndex - systemMetrics.length - methods.length;
		metric = chart.createMetric(platformMetrics[index], platformMetricLabels[index]);
	} else if (dataIndex < systemMetrics.length + methods.length + platformMetrics.length + compoundMetrics.length) {
		index = dataIndex - systemMetrics.length - methods.length - platformMetrics.length;
		metric = chart.createMetric(compoundMetrics[index], compoundMetricLabels[index]);
	} else if (dataIndex < systemMetrics.length + methods.length + platformMetrics.length + compoundMetrics.length + atomicMetrics.length) {
		index = dataIndex - systemMetrics.length - methods.length - platformMetrics.length - compoundMetrics.length;
		metric = chart.createMetric(atomicMetrics[index], atomicMetricLabels[index]);
	}
	return metric;
}

function setDroppable(chart) {
	$( "#" + chart.id ).droppable({
		accept: function (draggable) {
			var dataIndex = draggable.attr("data");
			if (!dataIndex) {
				return;
			}
			var metric = createMetric(chart, dataIndex);
			return chart.acceptMetric(metric);
		},
		drop: function( event, ui ) {
			var dataIndex = ui.draggable.attr("data");
			var metric = createMetric(chart, dataIndex);
			chart.addMetricToChart(metric);
		}
	});
}

function displayChart1x1() {
	d3.select("#charts-dashboard").append("div").attr("id", "chart1")
		.attr("class", "chart")
		.style("height", (chartsDashboardHeight - 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px");
	
	chart1 = new Chart("chart1", chartsDashboardWidth - 2, chartsDashboardHeight - 2);
	setDroppable(chart1);
	chart1.init(chartColors(1));
}

function displayChart2x1() {
	d3.select("#charts-dashboard").append("div").attr("id", "chart1")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px");
		//.style("display", "inline-block");
	
	chart1 = new Chart("chart1", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	setDroppable(chart1);
	chart1.init(chartColors(1));
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart2")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px")
		.style("top", ((chartsDashboardHeight - 2) / 2) + "px")
		.style("left", 0 + "px");
	
	chart2 = new Chart("chart2", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	setDroppable(chart2);
	chart2.init(chartColors(2));
}

function displayChart4x1() {
	displayChart2x1();

	d3.select("#charts-dashboard").append("div").attr("id", "chart3")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px")
		.style("top", (chartsDashboardHeight - 2) + "px")
		.style("left", 0 + "px");
		//.style("display", "inline-block");
	
	chart3 = new Chart("chart3", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	setDroppable(chart3);
	chart3.init(chartColors(3));
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart4")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", (chartsDashboardWidth - 2) + "px")
		.style("top", (((chartsDashboardHeight - 2) / 2) * 3) + "px")
		.style("left", 0 + "px");
	
	chart4 = new Chart("chart4", (chartsDashboardWidth - 2), ((chartsDashboardHeight - 4) / 2));
	setDroppable(chart4);
	chart4.init(chartColors(4));
}

function displayChart2x2() {
	d3.select("#charts-dashboard").append("div").attr("id", "chart1")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px");
	chart1 = new Chart("chart1", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart1);
	chart1.init(chartColors(1));
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart2")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", 0 + "px")
		.style("left", ((chartsDashboardWidth - 2) / 2) + "px");
	chart2 = new Chart("chart2", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart2);
	chart2.init(chartColors(2));

	d3.select("#charts-dashboard").append("div").attr("id", "chart3")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", ((chartsDashboardHeight - 2) / 2) + "px")
		.style("left", 0 + "px");
	chart3 = new Chart("chart3", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart3);
	chart3.init(chartColors(3));

	d3.select("#charts-dashboard").append("div").attr("id", "chart4")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", ((chartsDashboardHeight - 2) / 2) + "px")
		.style("left", ((chartsDashboardWidth - 2) / 2) + "px");
	chart4 = new Chart("chart4", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart4);
	chart4.init(chartColors(4));
}

function displayChart4x2() {
	displayChart2x2();
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart5")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", (chartsDashboardHeight - 2) + "px")
		.style("left", 0 + "px");
	chart5 = new Chart("chart5", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart5);
	chart5.init(chartColors(5));
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart6")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", (chartsDashboardHeight - 2) + "px")
		.style("left", ((chartsDashboardWidth - 2) / 2) + "px");
	chart6 = new Chart("chart6", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart6);
	chart6.init(chartColors(6));
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart7")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", (((chartsDashboardHeight - 2) / 2) * 3) + "px")
		.style("left", 0 + "px");
	chart7 = new Chart("chart7", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart7);
	chart7.init(chartColors(7));
	
	d3.select("#charts-dashboard").append("div").attr("id", "chart8")
		.attr("class", "chart")
		.style("height", ((chartsDashboardHeight - 4) / 2) + "px")
		.style("width", ((chartsDashboardWidth - 4) / 2) + "px")
		.style("top", (((chartsDashboardHeight - 2) / 2) * 3) + "px")
		.style("left", ((chartsDashboardWidth - 2) / 2) + "px");
	chart8 = new Chart("chart8", ((chartsDashboardWidth - 4) / 2), (chartsDashboardHeight - 4) / 2);
	setDroppable(chart8);
	chart8.init(chartColors(8));
}

function metricsSelectorToggleMouseover() {
	d3.select("#metrics-selector-toggle")
		.classed("mouseover", true);
}

function metricsSelectorToggleMouseout() {
	d3.select("#metrics-selector-toggle")
		.classed("mouseover", false);
}
