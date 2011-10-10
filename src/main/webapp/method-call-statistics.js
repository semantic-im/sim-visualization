/*
PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sim:<http://www.larkc.eu/ontologies/IMOntology.rdf#>

select 
  ?method 
  (count(?method) as ?count) 
  (sum(?duration) as ?totalTime)
  (min(?duration) as ?minTime)
  (max(?duration) as ?maxTime)
  (avg(?duration) as ?avgTime)
  (sum(?cpuTime) as ?totalCPUTime)
  (min(?cpuTime) as ?minCPUTime)
  (max(?cpuTime) as ?maxCPUTime)
  (avg(?cpuTime) as ?avgCPUTime)
where {
?me rdf:type sim:MethodExecution .
?me sim:isMethodExecutionOf ?method .

?me sim:hasMeasurement ?wct .
?wct rdf:type sim:WallClockTime .
?wct sim:hasDataValue ?duration .

?me sim:hasMeasurement ?tct .
?tct rdf:type sim:ThreadTotalCPUTime .
?tct sim:hasDataValue ?cpuTime .

sim:78fbca58-fe93-42c4-9e06-e749b0ed972f sim:hasMeasurement ?wct .
sim:7139c3e8-fa3f-44e9-a936-8be9d861cdc3 sim:hasMeasurement ?wct .

sim:78fbca58-fe93-42c4-9e06-e749b0ed972f sim:hasMeasurement ?tct .
sim:7139c3e8-fa3f-44e9-a936-8be9d861cdc3 sim:hasMeasurement ?tct .

}
group by ?method
order by desc(?totalTime)
limit 10
*/

function MethodCallStatistics() {
	this.chartTop = Math.round((clientHeight * 2) / 100);
	this.chartLeft = Math.round(clientWidth  / 100);
	this.chartHeight = Math.round((clientHeight * 90) / 100);
	this.chartWidth = Math.round(clientWidth * 98 / 100);
	this.barChartHeight = this.chartHeight;

	this.data = this.loadData();
	this.scales = this.processScales();

	console.debug(this.data.length);
	this.barChartGroupWidth = Math.round(this.chartWidth / this.data.length);
	this.barWidth = Math.round(this.barChartGroupWidth / (this.scales.length + 2)); //add two for the space between groups
	
	var methodCallStatistics = d3.select("#methodCallStatistics");
	var svg = methodCallStatistics.append("svg:svg")
		.attr("width", this.chartWidth + "px")
		.attr("height", this.chartHeight + "px")
		.style("position", "relative")
		.style("top", this.chartTop + "px")
		.style("left", this.chartLeft + "px");

	/*
	var group = svg.selectAll("g").data(this.data)
		.enter().append("svg:g")
		.attr("class", function(d, i) {return d.method + "Group" + i;});
	group.selectAll("rect").data(function(d) {return d.data;})
		.enter().append("svg:rect")
		.attr("class", function(d, i) {return "Rect" + i;});
	*/
	var colors = d3.scale.category10();
	
	for (var i = 0; i < this.data.length; i++) {
		for (var j = 0; j < this.data[i].data.length; j++) {
			/*
			if (d3.select('#' + 'MethodCallStatisticIcon' + j).empty()) {
				var div = methodCallStatistics.insert("div", "svg")
					.style("display", "inline-block")
					.style("width", "120px");
				div.append("canvas")
					.attr("id", "MethodCallStatisticIcon" + j)
					.attr("width", "12")
					.attr("height", "12")
					.attr("class", "metric-icon");
				drawCircle($('#' + 'MethodCallStatisticIcon' + j)[0], 6, colors(j));
				div.append("span")
					.style("font-family", "Verdana")
					.style("font-size", "12px")
					.style("font-weight", "normal")
					.text(function() {
						switch(j) {
						case 0:
							return "Count";
						case 1:
							return "Total Time";
						case 2:
							return "Min Time";
						case 3:
							return "Max Time";
						case 4:
							return "Avg Time";
						case 5:
							return "Total CPU Time";
						case 6:
							return "Min CPU Time";
						case 7:
							return "Max CPU Time";
						case 8:
							return "Avg CPU Time";
						}
					});
			}
			*/
			var aData = this.data[i].data[j];
			var height = Math.ceil((this.scales[j](0) - this.scales[j](aData)));
			var y = Math.floor(this.scales[j](aData));
			var x = (this.barChartGroupWidth * i) +  (this.barWidth * (j + 1));
			if (height == 0) {
				y = y - 1;
				height = 1;
			}
			svg.append("svg:rect")
				.attr("height", height)
				.attr("width", this.barWidth - 1)
				.attr("x", x)
				.attr("y", y)
				.attr("fill", colors(j));
			var textY = y - 5;
			var textOnBar = false;
			if (textY < 30) {
				textOnBar = true;
			} 
			var anchor = "start";
			var fill = colors(j);
			if (textOnBar) {
				anchor = "end";
				textY = 1;
				fill = "white";
			}
			svg.append("svg:text")
				.style("font-family", "Verdana")
				.style("font-size", "10px")
				.style("font-weight", "normal")
				.style("stroke", "0px")
				.style("fill", fill)
				.style("text-anchor", anchor)
				.attr("x", x + (this.barWidth/2))
				.attr("y", textY)
				.attr("transform", "rotate(-90 " + (x + (this.barWidth/2) + 2) + " " + textY + ")")
				.text(aData);
			svg.append("svg:text")
				.style("font-family", "Verdana")
				.style("font-size", "10px")
				.style("font-weight", "normal")
				.style("stroke", "0px")
				.style("fill", colors(j))
				.style("text-anchor", "end")
				.attr("x", x + (this.barWidth/2))
				.attr("y", this.scales[j](0))
				.attr("transform", "rotate(-90 " + (x + (this.barWidth/2) + 2) + " " + this.scales[j](0) + ")")
				.text(function() {
					switch(j) {
					case 0:
						return "Count";
					case 1:
						return "Total Time";
					case 2:
						return "Min Time";
					case 3:
						return "Max Time";
					case 4:
						return "Avg Time";
					case 5:
						return "Total CPU Time";
					case 6:
						return "Min CPU Time";
					case 7:
						return "Max CPU Time";
					case 8:
						return "Avg CPU Time";
					}
				});
		}
		svg.append("svg:text")
			.style("font-family", "Verdana")
			.style("font-size", "10px")
			.style("font-weight", "bold")
			.style("stroke", "0px")
			.attr("x", this.barChartGroupWidth * i + (this.barWidth / 2))
			.attr("y", Math.ceil(this.scales[0](0)))
			.text(this.data[i].method)
			.attr("transform", "rotate(-90 " + (this.barChartGroupWidth * i + (this.barWidth / 2)) + " " + Math.ceil(this.scales[0](0)) + ")");
	}
};


MethodCallStatistics.prototype.loadData = function() {
	var sparql = "select ?method \\n"
		+ "(count(?method) as ?count) \\n"
		+ "(sum(?duration) as ?totalTime) \\n"
		+ "(min(?duration) as ?minTime) \\n"
		+ "(max(?duration) as ?maxTime) \\n"
		+ "(avg(?duration) as ?avgTime) \\n"
		+ "(sum(?cpuTime) as ?totalCPUTime) \\n"
		+ "(min(?cpuTime) as ?minCPUTime) \\n"
		+ "(max(?cpuTime) as ?maxCPUTime) \\n"
		+ "(avg(?cpuTime) as ?avgCPUTime) \\n"
		+ "  where { \\n"
		+ "    ?me rdf:type :MethodExecution . \\n"
		+ "    ?me :isMethodExecutionOf ?method . \\n"
		+ "    ?me :hasMeasurement ?wct . \\n"
		+ "    ?wct rdf:type :WallClockTime . \\n"
		+ "    ?wct :hasDataValue ?duration . \\n"
		+ "    ?me :hasMeasurement ?tct . \\n"
		+ "    ?tct rdf:type :ThreadTotalCPUTime . \\n"
		+ "    ?tct :hasDataValue ?cpuTime . \\n"
		//+ "    " + selectedApplication.id + " :hasMeasurement ?me . \\n"
		//+ "    " + selectedSystem.id + " :hasMeasurement ?me . \\n"
		+ "  } \\n"
		+ "group by ?method \\n"
		+ "order by desc(?totalTime) \\n"
		+ "limit 10 offset 0";

	var data = executeSparql([ "method", "count", "totalTime", "minTime", "maxTime", "avgTime", "totalCPUTime", "minCPUTime", "maxCPUTime", "avgCPUTime" ], sparql);
	var returnData = new Array();
	for (var i = 0; i < data.length; i++) {
		/*
		data[i].count = trimDatatype(data[i].count);
		data[i].totalTime = trimDatatype(data[i].totalTime);
		data[i].minTime = trimDatatype(data[i].minTime);
		data[i].maxTime = trimDatatype(data[i].maxTime);
		data[i].avgTime = trimDatatype(data[i].avgTime);
		data[i].totalCPUTime = trimDatatype(data[i].totalCPUTime);
		data[i].minCPUTime = trimDatatype(data[i].minCPUTime);
		data[i].maxCPUTime = trimDatatype(data[i].maxCPUTime);
		data[i].avgCPUTime = trimDatatype(data[i].avgCPUTime);
		*/
		var obj = new Object();
		obj.method = data[i].method.replace(":", "");
		obj.data = new Array();
		obj.data.push(+trimDatatype(data[i].count));
		obj.data.push(+trimDatatype(data[i].totalTime));
		obj.data.push(+trimDatatype(data[i].minTime));
		obj.data.push(+trimDatatype(data[i].maxTime));
		obj.data.push(+trimDatatype(data[i].avgTime));
		obj.data.push(+trimDatatype(data[i].totalCPUTime));
		obj.data.push(+trimDatatype(data[i].minCPUTime));
		obj.data.push(+trimDatatype(data[i].maxCPUTime));
		obj.data.push(+trimDatatype(data[i].avgCPUTime));
		
		returnData.push(obj);
	}
	
	return returnData;
};

MethodCallStatistics.prototype.processScales = function() {
	var maxValues = new Array();
	var scales = [];
	
	for (var i = 0; i < this.data.length; i++) {
		for (var j = 0; j < this.data[i].data.length; j++) {
			if (maxValues.length < (j + 1)) {
				maxValues.push(-Infinity);
			}
			if (maxValues[j] < this.data[i].data[j]) {
				maxValues[j] = this.data[i].data[j];
			}
		}
	}
	for (var i = 0; i < maxValues.length; i++) {
		scales[i] = d3.scale.linear().range([this.barChartHeight - 80, 0]).domain([0, maxValues[i]]);
	}
	return scales;
};
