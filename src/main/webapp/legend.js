
function Legend(chart) {
	
	this.chart = chart;
	
	var mouseover = false;
	var contentShow = true;
	var legendContent;
	
	this.refreshLegend = function () {
		var legendDiv = d3.select("#" + chart.id + " .legend");
		if (legendDiv.empty()) {
			var chartSelection = d3.select("#" + this.chart.id);
			var legendTitleLeft = (chart.allChartWidth - 80);
			legendDiv = chartSelection.append("div")
				.style("top", 10 + "px")
				.style("left", legendTitleLeft + "px")
				.style("height", 20 + "px")
				.style("width", 60 + "px")
				.style("text-align", "center")
				.on("mouseover", legendMouseover)
				.on("mouseout", legendMouseout)
				.on("click", toggleContent);
			legendDiv.classed("legend", true);
			legendDiv.classed("legend-transparent", true);
			legendDiv.append("span").text("Legend");
			
			//the content
			legendContent = chartSelection.append("div")
				.classed("legend-content", true)
				.classed("legend-transparent", true)
				.style("display", "inline-block")
				.style("top", (10 + 20 + 2*2) + "px") //2*2 padding
				.style("left", (legendTitleLeft - 140) + "px")
				.style("height", 80 + "px")
				.style("width", (200 + 2*2) + "px") //padding
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
				.attr("width", "12")
				.attr("height", "12")
				.attr("class", "metric-icon");
			drawCircle($('#' + validID(metric.metric) + "LegendIcon")[0], 6, metric.fill);
			div.append("span")
				.attr("class", "metric-label").text(metric.metricLabel);
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

	function legendMouseover() {
		if (mouseover) return;
		var legendDiv = d3.select("#" + chart.id + " .legend");
		legendDiv.classed("legend-transparent", false);
		var legendContentDiv = d3.select("#" + chart.id + " .legend-content");
		legendContentDiv.classed("legend-transparent", false);
		mouseover = true;
	};

	function legendMouseout() {
		if (!mouseover) return;
		var legendDiv = d3.select("#" + chart.id + " .legend");
		legendDiv.classed("legend-transparent", true);
		var legendContentDiv = d3.select("#" + chart.id + " .legend-content");
		legendContentDiv.classed("legend-transparent", true);
		mouseover = false;
	};

	function toggleContent() {
		if (contentShow) {
			legendContent.style("display", "none");
		} else {
			legendContent.style("display", "inline-block");
		}
		contentShow = !contentShow;
	}
};
