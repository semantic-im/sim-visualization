
function Legend(chart) {
	
	this.chart = chart;
	this.chart.mouseMoveHandlers.push(movers);
	
	var legendContent = null;
	
	var mouseover = false;
	var contentShow = true;
	
	this.refreshLegend = function () {
		var legendContainer = d3.select("#" + chart.id + "LegendContainer");
		if (legendContainer.empty()) {
			var chartSelection = d3.select("#" + this.chart.id);
			var legendTitleLeft = (chart.allChartWidth - 100);
			legendContainer = chartSelection.append("div")
				.attr("id", this.chart.id + "LegendContainer")
				.style("top", 10 + "px")
				.style("left", (legendTitleLeft - 220) + "px")
				.style("height", 100 + "px")
				.style("width", (220) + "px") //padding
				.on("mouseup", unmoveService);
			legendContainer.classed("legend-container", true);
			//$( "#" + chart.id + "LegendContainer" ).draggable();
			
			var legendTitle = legendContainer.append("div")
				.attr("id", this.chart.id + "LegendTitle")
				.style("top", 0 + "px")
				.style("left", 140 + "px")
				.style("height", 20 + "px")
				.style("width", 76 + "px")
				.style("text-align", "center")
				.on("mouseover", function() {d3.select("#" + chart.id + "LegendTitle").style('cursor', 'move');  legendMouseover();})
				.on("mouseout", legendMouseout)
				.on("mousedown", moveService);
			legendTitle.classed("legend-title", true);
			legendTitle.classed("legend-transparent", true);
			legendTitle.append("span").text("Legend");
			
			legendTitle.append("canvas")
				.attr("id", chart.id + "ToggleIcon")
				.attr("width", "16")
				.attr("height", "16")
				.style("cursor", "pointer")
				.attr("class", "metric-icon")
				.on("click", toggleContent);
			drawTriangle($('#' + chart.id + 'ToggleIcon')[0]);
			
			//the content
			this.legendContent = legendContainer.append("div")
				.attr("id", this.chart.id + "LegendContent")
				.classed("legend-content", true)
				.classed("legend-transparent", true)
				.style("top", (20 + 2*2 + 1) + "px") //2*2 padding
				.style("left", 0 + "px")
				.style("height", 80 + "px")
				.style("width", (220) + "px") //padding
				.on("mouseover", legendMouseover)
				.on("mouseout", legendMouseout);
		}
	
		legendContent = d3.select("#" + chart.id + " .legend-content");
		legendContent.selectAll("div").remove();
		for (var i = 0; i < this.chart.chartMetrics.length; i++) {
			var metric = chart.chartMetrics[i];
			var div = legendContent.append("div")
				.attr("id", validID(metric.metric) + "MetricLegend");
			div.append("canvas")
				.attr("id", validID(metric.metric) + "LegendIcon")
				.attr("width", "16")
				.attr("height", "16")
				.attr("class", "metric-icon");
			drawCircle($('#' + validID(metric.metric) + "LegendIcon")[0], 8, metric.fill);
			div.append("span")
				.attr("class", "metric-label")
				.text(metric.metricLabel);
			div.append("div")
				.attr("id", validID(metric.metric) + "MetricLegendDelete")
				.attr("data", i)
				.attr("class", "legend-delete");
			
			$("#" + validID(metric.metric) + "MetricLegendDelete").click(function(eventObject) {
				removeMetric(eventObject);
			});

		}
	};

	function removeMetric(event) {
		var dataIndex = d3.select("#" + event.target.id).attr("data");
		console.debug(dataIndex);
		console.debug(chart.chartMetrics[dataIndex].metric);chart.removeMetric(chart.chartMetrics[dataIndex]);
	}

	var clicked = false;
	var x = null; 
	var y = null;
	
	function moveService() {
		var event = d3.event;
		clicked = true;
		//if(event.offsetX || event.offsetY) {
		//	clickX=event.offsetX;
		//	clickY=event.offsetY;
		//}
		//else {
			clickX=event.pageX;
			clickY=event.pageY;
		//}
		itemX = d3.select("#" + chart.id + "LegendContainer").style("left");
		itemY = d3.select("#" + chart.id + "LegendContainer").style("top");
		arX = pxRegExp.exec(itemX);
		arY = pxRegExp.exec(itemY);
		Xoffset = clickX - arX[1];
		Yoffset = clickY - arY[1];
		d3.select("#" + chart.id + "LegendTitle").classed('legend-transparent-drag', true);
		d3.select("#" + chart.id + "LegendContent").classed('legend-transparent-drag', true);
		d3.select("#" + chart.id + "LegendContainer").style('cursor', 'move');
	}
	
	function unmoveService() {
		clicked = false;
		d3.select("#" + chart.id + "LegendContainer").style("top", y +'px');
		d3.select("#" + chart.id + "LegendContainer").style("left", x +'px');
		d3.select("#" + chart.id + "LegendTitle").classed('legend-transparent-drag', false);
		d3.select("#" + chart.id + "LegendContent").classed('legend-transparent-drag', false);
		d3.select("#" + chart.id + "LegendContainer").style('cursor', 'auto');
	}
	
	function movers() {
		var event = d3.event;
		if(clicked == true) {
			//if(event.offsetX || event.offsetY) {
			//	x=event.offsetX - Xoffset;
			//	y=event.offsetY - Yoffset;
			//}
			//else {
				x=event.pageX - Xoffset;
				y=event.pageY -Yoffset;
			//}
			d3.select("#" + chart.id + "LegendTitle").classed('legend-transparent-drag', true);
			d3.select("#" + chart.id + "LegendContent").classed('legend-transparent-drag', true);
			d3.select("#" + chart.id + "LegendContainer").style("top", y +'px');
			d3.select("#" + chart.id + "LegendContainer").style("left", x +'px');
		}
	}

	function legendMouseover() {
		if (mouseover) return;
		var legendDiv = d3.select("#" + chart.id + " .legend-title");
		legendDiv.classed("legend-transparent", false);
		var legendContentDiv = d3.select("#" + chart.id + " .legend-content");
		legendContentDiv.classed("legend-transparent", false);
		mouseover = true;
	};

	function legendMouseout() {
		if (!mouseover) return;
		var legendDiv = d3.select("#" + chart.id + " .legend-title");
		legendDiv.classed("legend-transparent", true);
		var legendContentDiv = d3.select("#" + chart.id + " .legend-content");
		legendContentDiv.classed("legend-transparent", true);
		mouseover = false;
	};

	function toggleContent() {
		if (contentShow) {
			legendContent.style("display", "none");
			drawTriangleUp($('#' + chart.id + 'ToggleIcon')[0]);
		} else {
			legendContent.style("display", "inline-block");
			drawTriangle($('#' + chart.id + 'ToggleIcon')[0]);
		}
		contentShow = !contentShow;
	}
};
