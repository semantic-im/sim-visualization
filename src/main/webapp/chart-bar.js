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
	this.focusArea.selectAll("text.bar").remove();
	
	var enterNodes = this.focusArea.selectAll("rect.bar").data(data)
		.enter();
	var bars = enterNodes
		.append("svg:rect")
		.attr("class", "bar")
		.attr("x", function(d, i) {return barWidth * i;})
		.attr("y", function(d) {return chart.y1(d.y);})
		.attr("width", function(d) {return barWidth;})
		.attr("height", function(d) {
			return chart.y1(chart.focusMinY) - chart.y1(d.y);
		})
		.style("fill", function(d) {return d.fill;})
		.style("fill-opacity", ".8")
		.style("stroke", function(d) {return d.fill;})
		.style("stroke-width", "1px");

	enterNodes.append("svg:text")
		.attr("class", "bar")
		.attr("x", function(d, i) {
			if (barWidth < 60) {
				return barWidth * i + (barWidth / 2) + 5;
			} else {
				return barWidth * i + (barWidth / 2);
			}
		})
		.attr("y", function(d) {
			if ((chart.y1(chart.focusMinY) - chart.y1(d.y)) < 80) { //height
				return chart.y1(d.y) - 5;
			} else {
				return chart.y1(d.y) + 15;
			}
		})
		.style("font-family", "Verdana")
		.style("font-size", "10px")
		.style("stroke", "0px")
		.style("fill", function(d) {
			if ((chart.y1(chart.focusMinY) - chart.y1(d.y)) < 80) { //height
				return d.fill;
			} else {
				return "#FFFFFF";
			}
		})
		.style("text-anchor", function(d) {
			if (barWidth < 60) {
				if ((chart.y1(chart.focusMinY) - chart.y1(d.y)) < 80) { //height
					return "start";
				} else {
					return "end";
				}
			} else {
				return "middle";
			}
		})
		.attr("transform", function(d, i) {
			if (barWidth < 60) {
				if ((chart.y1(chart.focusMinY) - chart.y1(d.y)) < 80) { //height
					return "rotate(-90 " + (barWidth * i + (barWidth / 2) + 5) + " " + (chart.y1(d.y) - 5) + ")";
				} else {
					return "rotate(-90 " + (barWidth * i + (barWidth / 2) + 5) + " " + (chart.y1(d.y) + 15) + ")";
				}
			} else {
				return "";
			}
		})
		.text(function(d) {
			return chart.getYLabel(d.y);
		});
	
	bars.append("svg:title")
		.text(function(d) {
			var timeFormat = d3.time.format("%d.%m.%y %H:%M:%S");
			return "time=" + timeFormat(new Date(d.x)) + " \nvalue=" + chart.getYLabel(d.y);
		});
	
};
