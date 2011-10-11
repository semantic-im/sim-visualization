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
	this.chartLeft = Math.round(clientWidth * 1 / 100);
	this.chartWidth = Math.round(clientWidth * 98 / 100);
	this.barChartWidth = this.chartWidth - 80;

	this.data = this.loadData();
	this.scales = this.processScales();

	this.barHeight = 12;
	this.barChartGroupHeight = this.barHeight * (this.scales.length + 2);

	this.chartHeight = this.barChartGroupHeight * this.data.length; //Math.round((clientHeight * 96) / 100);
	
	//this.barChartGroupHeight = Math.round(this.chartHeight / this.data.length);
	//this.barHeight = Math.round(this.barChartGroupHeight / (this.scales.length + 2)); //add two for the space between groups
	
	var methodCallStatistics = d3.select("#methodCallStatistics");
	var svg = methodCallStatistics.append("svg:svg")
		//.style("border", "1px solid black")
		.attr("width", this.chartWidth + "px")
		.attr("height", this.chartHeight + "px")
		.style("position", "relative")
		.style("top", this.chartTop + "px")
		.style("left", this.chartLeft + "px");

	var chartG = svg.append("svg:g")
		.attr("transform", "translate(80, 0)");
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
			var width = Math.ceil(this.scales[j](aData));
			var x = 0;
			var y = (this.barChartGroupHeight * i) +  (this.barHeight * (j + 1));
			if (width == 0) {
				x = x - 1;
				width = 1;
			}
			chartG.append("svg:rect")
				.attr("height", this.barHeight - 1)
				.attr("width", width)
				.attr("x", x)
				.attr("y", y)
				.attr("fill", colors(j));
			var textX = width + 2;
			var textOnBar = false;
			if (width > this.barChartWidth - 30) {
				textOnBar = true;
			} 
			var anchor = "start";
			var fill = colors(j);
			if (textOnBar == true) {
				anchor = "end";
				textX = this.scales[j](aData) - 2;
				fill = "white";
			}
			chartG.append("svg:text")
				.style("font-family", "Verdana")
				.style("font-size", "10px")
				.style("font-weight", "normal")
				.style("stroke", "0px")
				.style("fill", fill)
				.style("text-anchor", anchor)
				.attr("x", textX)
				.attr("y", y + this.barHeight - 3)
				//.attr("transform", "rotate(-90 " + (x + (this.barWidth/2) + 2) + " " + textY + ")")
				.text(aData);
			chartG.append("svg:text")
				.style("font-family", "Verdana")
				.style("font-size", "10px")
				.style("font-weight", "normal")
				.style("stroke", "0px")
				.style("fill", colors(j))
				.style("text-anchor", "end")
				.attr("x", this.scales[j](0) - 2)
				.attr("y", y + this.barHeight - 3)
				//.attr("transform", "rotate(-90 " + (x + (this.barWidth/2) + 2) + " " + this.scales[j](0) + ")")
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
		chartG.append("svg:text")
			.style("font-family", "Verdana")
			.style("font-size", "10px")
			.style("font-weight", "bold")
			.style("stroke", "0px")
			.attr("x", Math.ceil(this.scales[0](0)))
			.attr("y", this.barChartGroupHeight * i + this.barHeight - 3)
			.text(this.data[i].method);
			//.attr("transform", "rotate(-90 " + (this.barChartGroupWidth * i + (this.barWidth / 2)) + " " + Math.ceil(this.scales[0](0)) + ")");
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
		scales[i] = d3.scale.linear().range([0, this.barChartWidth]).domain([0, maxValues[i]]);
	}
	return scales;
};
