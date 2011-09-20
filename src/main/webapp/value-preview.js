
function ValuePreview(chart) {
	this.chart = chart;
	this.chart.mouseMoveHandlers.push(valuePreviewMovers);
	
	var mouseover = false;

	this.refreshValuePreview = function() {
		var valuePreviewContent = d3.select("#" + chart.id + "ValuePreviewContent");
		if (valuePreviewContent.empty()) {
			var chartSelection = d3.select("#" + this.chart.id);
			
			//the content
			this.valuePreviewContent = chartSelection.append("div")
				.attr("id", this.chart.id + "ValuePreviewContent")
				.classed("value-preview-content", true)
				.classed("value-preview-transparent", true)
				.style("top", 20 + "px")
				.style("left", 80 + "px")
				.style("height", ((20 * this.chart.chartMetrics.length) + 2) + "px")
				.style("width", 200 + "px")
				.on("mouseup", unmoveService)
				.on("mousedown", moveService)
				.on("mouseover", valuePreviewMouseover)
				.on("mouseout", valuePreviewMouseout);
		}
		valuePreviewContent = d3.select("#" + chart.id + " .value-preview-content");
		valuePreviewContent.style("height", ((20 * this.chart.chartMetrics.length) + 2) + "px");
		valuePreviewContent.selectAll("div").remove();
		for (var i = 0; i < this.chart.chartMetrics.length; i++) {
			var metric = chart.chartMetrics[i];
			var div = valuePreviewContent.append("div")
				.attr("id", validID(metric.metric) + "MetricValuePreview");
			div.append("canvas")
				.attr("id", validID(metric.metric) + "ValuePreviewIcon")
				.attr("width", "16")
				.attr("height", "16")
				.attr("class", "metric-icon");
			drawCircle($('#' + validID(metric.metric) + "ValuePreviewIcon")[0], 8, metric.fill);
			div.append("span")
				.attr("id", validID(metric.metric) + "ValuePreviewLabel")
				.attr("class", "metric-label")
				.text("N/A");
		}

	};

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
		itemX = d3.select("#" + chart.id + "ValuePreviewContent").style("left");
		itemY = d3.select("#" + chart.id + "ValuePreviewContent").style("top");
		arX = pxRegExp.exec(itemX);
		arY = pxRegExp.exec(itemY);
		Xoffset = clickX - arX[1];
		Yoffset = clickY - arY[1];
		d3.select("#" + chart.id + "ValuePreviewContent").classed('value-preview-transparent-drag', true);
		d3.select("#" + chart.id + "ValuePreviewContent").style('cursor', 'move');
	}
	
	function unmoveService() {
		clicked = false;
		d3.select("#" + chart.id + "ValuePreviewContent").style("top", y +'px');
		d3.select("#" + chart.id + "ValuePreviewContant").style("left", x +'px');
		d3.select("#" + chart.id + "ValuePreviewContent").classed('value-preview-transparent-drag', false);
		d3.select("#" + chart.id + "ValuePreviewContent").style('cursor', 'auto');
	}

	function valuePreviewMovers() {
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
			d3.select("#" + chart.id + "ValuePreviewContent").classed('value-preview-transparent-drag', true);
			d3.select("#" + chart.id + "ValuePreviewContent").style("top", y +'px');
			d3.select("#" + chart.id + "ValuePreviewContent").style("left", x +'px');
		}
	}

	function valuePreviewMouseover() {
		if (mouseover) return;
		var valuePreviewContentDiv = d3.select("#" + chart.id + " .value-preview-content");
		valuePreviewContentDiv.classed("value-preview-transparent", false);
		mouseover = true;
	};

	function valuePreviewMouseout() {
		if (!mouseover) return;
		var valuePreviewContentDiv = d3.select("#" + chart.id + " .value-preview-content");
		valuePreviewContentDiv.classed("value-preview-transparent", true);
		mouseover = false;
	};

}