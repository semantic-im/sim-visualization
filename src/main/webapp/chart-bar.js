var minBarWidth = 12;
var barSpaceWidth = 2;

Chart.prototype.isBarTypeChart = function() {
	var metrics = this.chartMetrics;
	var totalValuesCount = 0;
	for (var i = 0; i < metrics.length; i++) {
		var metric = metrics[i];
		for (var j = 0; j < metric.data.length; j++) {
			if (metric.data[j].x >= this.x0 && metric.data[j].x <= this.x1) {
				totalValuesCount++;
			}
		}
	}
	
	var effectiveChartWidthForBar = this.chartWidth - (barSpaceWidth * (totalValuesCount - 1));
	return (Math.floor(effectiveChartWidthForBar/totalValuesCount) > minBarWidth);
};

Chart.prototype.drawBarChart = function() {
	var metrics = this.chartMetrics;
	var chart = this;
	var data = new Array();
	for (var i = 0; i < metrics.length; i++) {
		for (var j = 0; j < metrics[i].focusData.length; j++) {
			var obj = new Object();
			obj.x = metrics[i].focusData[j].x;
			obj.y = metrics[i].focusData[j].y;
			obj.fill = metrics[i].fill;
			data.push(obj);
		}
	}
	data.sort(function (a, b) {
		if (a.x < b.x) {
			return -1;
		} else if (a.x > b.x) {
			return 1;
		} else {
			return 0;
		}
	});
	
	var barWidth = this.chartWidth / data.length;
	
	this.focusArea.selectAll("path")
		.style("fill", "none")
		.style("stroke", "none");
	this.focusArea.selectAll("rect.bar").remove();
	
	var bars = this.focusArea.selectAll("rect.bar").data(data)
		.enter()
		.append("svg:rect")
		.attr("class", "bar")
		.attr("x", function(d, i) {return barWidth * i;})
		.attr("y", function(d) {return chart.y1(d.y);})
		.attr("width", function(d) {return barWidth;})
		.attr("height", function(d) {return chart.y1(chart.focusMinY) - chart.y1(d.y);})
		.style("fill", function(d) {return d.fill;});
		
	bars.append("svg:title")
		.text(function(d) {return chart.getYLabel(d.y);});
	
};
