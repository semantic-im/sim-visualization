
function ContextGraph(metric, metricId) {

	var CONTEXT_TYPE = "context";
	var CONTEXT_GROUP_TYPE = "context_group";
	var TAG_GROUP_TYPE = "tag_group";
	var TAG_TYPE = "tag";
	var METRIC_TYPE = "metric";
	
	this.metric = metric;
	this.metricId = metricId;

	this.nodes = new Array();
	this.links = new Array();
	this.childContextCache = new Hashtable();
	this.parentContextCache = new Hashtable();
	this.force = null;

	var contextGraph = this;
	
	var ontoview = d3.select("#contextGraphDialog");
	
	ontoview.selectAll("svg").remove();
	
	var vis = ontoview
		.append("svg:svg")
		.attr("width", (clientWidth - (clientWidth/10)) + "px")
		.attr("height", (clientHeight - (clientHeight/10)) + "px")
		.style("border", "1px solid black")
		.attr("pointer-events", "all")
		.append("svg:g");

	this.start = function() {
		//alert(metric + " - " + metricId);
		
		var sparql = "PREFIX :<http://www.larkc.eu/ontologies/IMOntology.rdf#>\\n" +
					 "select ?value" +
					 "	where { " + 
					 "		<" + this.metricId + "> :hasContext ?value " + 
					 " 	} ";

		executeSparql(["value"], sparql, true, this.loadContextCallback);
		
		$("#contextGraphDialog").dialog({
			//title: this.metric + " - " + this.metricId + " Context",
			title: "Context",
			autoOpen: true,
			show: 'scale',
			modal: true, 
			width: clientWidth - (clientWidth/10), 
			height: clientHeight - (clientHeight/10), 
			//position: [left, top]
			position: 'center',
			buttons: {
				"Close" : function() {
					$(this).dialog("close");
				}}
			});
		
		//$("#contextGraphDialog").show('scale', { percent: 100 }, 500, callback);
		
	};

	this.drawContextForce = function() {
		if (this.force) this.force.stop();
		
		this.force = d3.layout.force()
			.charge(-500)
			.distance(80)
			.nodes(this.nodes)
			.links(this.links)
			.size([clientWidth - (clientWidth/10), clientHeight - (clientHeight/10)])
			.start();

		var link = vis.selectAll("line.link").data(this.links, linkid);
		link.exit().remove();
		link.enter().insert("svg:line", "g.node")
			.attr("class", "link")
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
		link = vis.selectAll("line.link");
		link.style("stroke", function(d) {return "black"; });

		//line arrow
		var linkArrow = vis.selectAll("polyline.link").data(this.links, linkid);
		linkArrow.exit().remove();
		linkArrow.enter().insert("svg:polyline", "g.node")
			.attr("class", "link")
			.attr("points", function(d) {return positionArrow(d); });
		linkArrow = vis.selectAll("polyline.link");
		linkArrow.style("fill", function(d) {return "black"; });
		//~

		var node = vis.selectAll("g.node")
			.data(this.nodes, nodeid);
		node.exit().remove();
		var enterNodes = node.enter();
		
		var svgGraphic = enterNodes.append("svg:g")
			.attr("id", function(d) {return "id" + validID(d.name);})
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
		svgGraphic.append("svg:circle")
			.attr("class", "node")
			.attr("r", function(d) {return getRadius(d);})
			.style("fill", function(d) { return getColor(d); })
			.on("mouseover", function(d) {displayMetricInstances(d);})
			.on("mouseout", function(d) {cancelDisplayMetricInstances(d);})
			.on("click", function(d) {contextGraph.expand(d);});

		displayExpandSigns(vis.selectAll("g.node"));
		
		svgGraphic.append("svg:text")
			.attr("class", "node")
			.attr("dx", "12") 
			.attr("dy", ".35em") 
			.text(function(d) { return d.label; });

		node = vis.selectAll("g.node");
		node.call(this.force.drag);
		
		this.force.on("tick", function() {
			link.attr("x1", function(d) {return d.source.x;})
				.attr("y1", function(d) {return d.source.y;})
				.attr("x2", function(d) {return d.target.x;})
				.attr("y2", function(d) {return d.target.y;});

			linkArrow.attr("points", function(d) {return positionArrow(d); });
			
			node.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; });		
		});

	};

	function nodeid(n) {
		return n.name;
	}

	function linkid(l) {
		var u = nodeid(l.source),
			v = nodeid(l.target);
		return u.name + v.name;
	}

	function transformDataToNodes(data, type) {
		var nodes = new Array();
		for (var i = 0; i < data.length; i++) {
			var obj = new Object();
			obj.type = type;
			obj.name = data[i].value;
			obj.label = data[i].value;
			obj.childs = new Array();
			nodes.push(obj);
		}
		return nodes;
	}

	this.loadContextCallback = function(data) {
		var nodes = transformDataToNodes(data, CONTEXT_TYPE);
		contextGraph.loadContext(nodes, false);
	};
	
	this.loadContext = function(nodes, cache) {
		for (var i = 0; i < nodes.length; i++) {
			if (!cache) {
				this.nodes.push(nodes[i]);
			}
			var childContextsNode = this.getChildContexts(nodes[i], cache);
			if (!cache) {
				this.putToGraph(nodes[i], childContextsNode);
			}
			var parentContextsNode = this.getParentContexts(nodes[i], cache);
			if (!cache) {
				this.putToGraph(nodes[i], parentContextsNode);
			}
			var metricTagsNode = this.loadMetricTags(nodes[i], cache);
			if (!cache) {
				this.putToGraph(nodes[i], metricTagsNode);
			}
		}
		if (!cache) {
			this.drawContextForce();
		}
	};
	
	this.putToGraph = function(sourceNode, targetNode) {
		if (targetNode == null) {
			return;
		}
		this.nodes.push(targetNode);
		var link = new Object();
		link.source = sourceNode;
		link.target = targetNode;
		this.links.push(link);
	};
	
	this.removeNodeFromGraph = function(node) {
		this.removeLinksFromGraph(node);
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].name == node.name) {
				this.nodes.splice(i, 1);
				i--;
			}
		}
		for (var i = 0; i < node.childs.length; i++) {
			this.removeNodeFromGraph(node.childs[i]);
		}
	};
	
	this.removeLinksFromGraph = function(sourceNode) {
		for (var i = 0; i < this.links.length; i++) {
			if (this.links[i].source.name == sourceNode.name) {
				this.links.splice(i, 1);
				i--;
			}
		}		
	};
	
	this.getChildContexts = function(node, cache) {
		var sparql = "PREFIX :<http://www.larkc.eu/ontologies/IMOntology.rdf#>\\n" +
					 "select ?value\\n" +
					 "	where { \\n" + 
					 "		?value :hasParentContext " + node.label + " \\n"; 
		if (node.parent) {
			sparql = sparql + "FILTER regex(?value, " + node.parent.label + ") .\\n";
		}
		sparql = sparql + " 	} ";
			
		var data = null;
		if (cache) {
			executeSparql(["value"], sparql, true, function(data) {contextGraph.treatChildContexts(node, data, cache);});
		} else {
			data = executeSparql(["value"], sparql, false);
			return this.treatChildContexts(node, data, cache);
		}
	};

	this.treatChildContexts = function(node, data, cache) {
		var nodes = transformDataToNodes(data, CONTEXT_TYPE);
		if (nodes.length == 0) {
			return null;
		}
		var aNode = new Object();
		aNode.name = node.name + "Childs";
		aNode.label = "Child contexts";
		aNode.type = CONTEXT_GROUP_TYPE;
		aNode.expanded = false;
		aNode.childs = new Array();
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].parent = node;
			aNode.childs.push(nodes[i]);
		}
		if (!cache) {
			this.loadContext(nodes, true);
		}
		node.childs.push(aNode);
		return aNode;		
	};
	
	this.getParentContexts = function(node, cache) {
		var sparql = "PREFIX :<http://www.larkc.eu/ontologies/IMOntology.rdf#>\\n" +
					 "select ?value\\n" +
					 "	where { \\n" + 
					 "		" + node.label + " :hasParentContext ?value .\\n";
		if (node.parent) {
			sparql = sparql + "FILTER regex(?value, " + node.parent.label + ") .\\n";
		}
		sparql = sparql + " 	} ";
			
		var data = null;
		if (cache) {
			executeSparql(["value"], sparql, true, function(data) {contextGraph.treatParentContexts(node, data, cache);});		
		} else {
			data = executeSparql(["value"], sparql, false);
			return this.treatParentContexts(node, data, cache);
		};
	};

	this.treatParentContexts = function(node, data, cache) {
		var nodes = transformDataToNodes(data, CONTEXT_TYPE);
		if (nodes.length == 0) {
			return null;
		}
		var aNode = new Object();
		aNode.name = node.name + "Parents";
		aNode.label = "Parent contexts";
		aNode.type = CONTEXT_GROUP_TYPE;
		aNode.expanded = false;
		aNode.childs = new Array();
		for ( var i = 0; i < nodes.length; i++) {
			nodes[i].parent = node;
			aNode.childs.push(nodes[i]);
		}
		if (!cache) {
			this.loadContext(nodes, true);
		}
		node.childs.push(aNode);
		return aNode;		
	};
	
	this.loadMetricTags = function(node, cache) {
		var sparql = "PREFIX :<http://www.larkc.eu/ontologies/IMOntology.rdf#>\\n"
				+ "select distinct ?value"
				+ "	where { "
				+ "		?MetricInstance :hasContext " + node.label + " ."
				+ "		?MetricInstance rdf:type ?type ."
				+ "		?type :hasTag ?value ."
				+ "	} "
				+ "order by ?value";

		var data = null;
		if (cache) {
			executeSparql([ "value" ], sparql, true, function(data) {contextGraph.treatMetricTags(node, data);});
		} else {
			data = executeSparql([ "value" ], sparql, false);
			return this.treatMetricTags(node, data);
		}
	};

	this.treatMetricTags = function(node, data) {
		var nodes = transformDataToNodes(data, TAG_TYPE);
		if (nodes.length == 0) {
			return null;
		}
		var aNode = new Object();
		aNode.name = node.name + "MetricTags";
		aNode.label = "Metrics";
		aNode.type = TAG_GROUP_TYPE;
		aNode.expanded = false;
		aNode.childs = new Array();
		for ( var i = 0; i < nodes.length; i++) {
			nodes[i].parent = node;
			nodes[i].name = nodes[i].parent.name + nodes[i].name;
			nodes[i].expanded = false;
			aNode.childs.push(nodes[i]);
		}
		node.childs.push(aNode);
		return aNode;		
	};
	
	this.loadMetricTypes = function(contextNode, tagNode) {
		var sparql = "PREFIX :<http://www.larkc.eu/ontologies/IMOntology.rdf#>\\n"
				+ "select distinct ?value"
				+ "	where { "
				+ "		?MetricInstance :hasContext " + contextNode.label + " ."
				+ "		?MetricInstance rdf:type ?value ."
				+ "		?value :hasTag " + tagNode.label + " ."	 //FIXME here is the label cause the name contains also the id of the context
				+ "	} "
				+ "order by ?value";

		executeSparql([ "value" ], sparql, true, function(data) {contextGraph.treatMetricTypes(contextNode, tagNode, data);});
	};
	
	this.treatMetricTypes = function(contextNode, tagNode, data) {
		var nodes = transformDataToNodes(data);
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].parent = contextNode;
			nodes[i].label = nodes[i].name;
			nodes[i].name = nodes[i].parent.name + nodes[i].name;
			nodes[i].type = METRIC_TYPE;
			nodes[i].childs = new Array();
			tagNode.childs.push(nodes[i]);
		};
		//tagNode.expanded =  false;
		//displayExpandSign(tagNode.name);
	};

	this.loadMetricInstances = function(contextNode, metricNode) {
		var sparql = "PREFIX :<http://www.larkc.eu/ontologies/IMOntology.rdf#>\\n"
				+ "select ?time ?value ?unit"
				+ "	where { "
				+ "		?MetricInstance :hasContext " + contextNode.label + " .\\n"
				+ "		?MetricInstance rdf:type " + metricNode.label + " .\\n"
				+ "		?MetricInstance :hasDataValue ?value .\\n"
				+ "		?MetricInstance :hasTimeStamp ?time .\\n"
				+ " " + metricNode.label + " :hasMeasurementUnit ?unit .\\n"
				+ "	} \\n"
				+ "order by ?time ";

		executeSparql([ "time", "value", "unit" ], sparql, true, function(data) {contextGraph.treatMetricInstances(contextNode, metricNode, data);});
	};
	
	this.treatMetricInstances = function(contextNode, metricNode, data) {
		metricNode.instances = new Array();
		for (var i = 0; i < data.length; i++) {
			var obj = new Object();
			obj.time = data[i].time;
			obj.value = data[i].value;
			obj.unit = data[i].unit;
			metricNode.instances.push(obj);
		}
	};

	function getColor(d) {
		if (d.type == CONTEXT_TYPE) {
			return "#1f77b4";
		} else if (d.type == TAG_TYPE) {
			return "#2ca02c";
		} else if (d.type == METRIC_TYPE) {
			return "#d62728";
		}else if (d.type == CONTEXT_GROUP_TYPE) {
			return "#aec7e8";
		} else if (d.type == TAG_GROUP_TYPE) {
			return "#aec7e8";
		}
	};

	this.expand = function(node) {
		if (node.type != CONTEXT_GROUP_TYPE && node.type != TAG_GROUP_TYPE && node.type != TAG_TYPE) {
			return;
		}
		if (node.expanded) {
			this.removeLinksFromGraph(node);
		}
		for (var i = 0; i < node.childs.length; i++) {
			if (node.expanded) {
				this.removeNodeFromGraph(node.childs[i]);
			} else {
				this.putToGraph(node, node.childs[i]);
				if (node.type == CONTEXT_GROUP_TYPE) {
					for (var j = 0; j < node.childs[i].childs.length; j++) {
						this.putToGraph(node.childs[i], node.childs[i].childs[j]);
						this.loadContext(node.childs[i].childs[j].childs, true);
					}
				} else if (node.type == TAG_GROUP_TYPE) {
					this.loadMetricTypes(node.childs[i].parent, node.childs[i]);
				} else if (node.type == TAG_TYPE) {
					this.loadMetricInstances(node.parent, node.childs[i]);
				}
			}
		}
		node.expanded = !node.expanded;
		contextGraph.drawContextForce();
	};
	
	/* arrow head */
	function getArrowHeadPointX(d) {
		var x1 = d.target.x, y1 = d.target.y;
		var x2 = d.source.x, y2 = d.source.y;
		
		if (x1 == x2) {
			return x1;
		}
		
		//calculate x coordonate for the arrow head (in touch with the circle)
		var tanAlpha = Math.abs(y1 - y2)/ Math.abs(x1 - x2);

		var xLen = Math.abs(getRadius(d.target) / Math.sqrt(1 + Math.pow(tanAlpha, 2)));
		var x;
		if (x2 > x1) {
			x = x1 + xLen;
		} else {
			x = x1 - xLen;
		}
		//~	
		
		return x;
	}

	function getArrowHeadPointY(d) {
		var x1 = d.target.x, y1 = d.target.y;
		var x2 = d.source.x, y2 = d.source.y;
		
		if (x1 == x2) {
			return y1;
		}

		//calculate y coordonate for the arrow head (in touch with the circle)
		var tanAlpha = Math.abs(y1 - y2)/ Math.abs(x1 - x2);
		var yLen = Math.abs((getRadius(d.target) * tanAlpha) / Math.sqrt(1 + Math.pow(tanAlpha, 2)));
		var y;
		if (y2 > y1) {
			y = y1 + yLen;
		} else {
			y = y1 - yLen;
		}
		//~
		
		return y;
	}

	function positionArrow(d) {
		var x = getArrowHeadPointX(d);
		var y = getArrowHeadPointY(d);
		
		var x1 = d.source.x, y1 = d.source.y;
		
		return x + "," + y + " " + 
			getArrowBaseLeftPointX(x, y, x1, y1) + "," + getArrowBaseLeftPointY(x, y, x1, y1) + " " + 
			getArrowBaseRightPointX(x, y, x1, y1) + "," + getArrowBaseRightPointY(x, y, x1, y1);
	}
	/* ~~~ */
	
	function getRadius(d) {
		if (d.type == CONTEXT_GROUP_TYPE) {
			return 10;
		} else {
			return 10;
		}
	}

	/*expand sign */
	function displayExpandSigns(nodeData) {
		nodeData.select("g.sign").remove();
		
		nodeData.filter(function(d) {return (d.expanded != undefined);})
			.append("svg:g")
			.attr("class", "sign");
		var g = nodeData.select("g.sign");
		
		g.append("svg:line")
			.style("pointer-events", "none")
			.attr("x1", function(d) {return - (getRadius(d) / 3);})
			.attr("x2", function(d) {return (getRadius(d) / 3);})
			.attr("y1", 0)
			.attr("y2", 0)
			.attr("stroke", "#fff");
		g.filter(function(d) {return (d.expanded == false);})
			.append("svg:line")
			.style("pointer-events", "none")
			.attr("y1", function(d) {return - (getRadius(d) / 3);})
			.attr("y2", function(d) {return (getRadius(d) / 3);})
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("stroke", "#fff");
	}
	
	function displayExpandSign(id) {
		var selection = vis.select("#id" + validID(id));
		
		selection.select("g.sign").remove();

		var g = selection.filter(function(d) {return (d.expanded != undefined);})
			.append("svg:g")
			.attr("class", "sign");
		
		g.append("svg:line")
			.attr("x1", function(d) {return - (getRadius(d) / 3);})
			.attr("x2", function(d) {return (getRadius(d) / 3);})
			.attr("y1", 0)
			.attr("y2", 0)
			.attr("stroke", "#fff");
		g.filter(function(d) {return (d.expanded == false);})
			.append("svg:line")
			.attr("y1", function(d) {return - (getRadius(d) / 3);})
			.attr("y2", function(d) {return (getRadius(d) / 3);})
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("stroke", "#fff");
	}
	/* ---- */
	
	var visibleMetricInstances = false;
	var cancelTimeoutMetricInstances = null;
	
	function displayMetricInstances(d) {
		if (!d.instances || d.instances.length == 0) {
			return;
		}
		if (d.type != METRIC_TYPE || visibleMetricInstances) {
			return;
		}
		
		var maxLengthLabel = 0;
		//compute value label
		for (var i = 0; i < d.instances.length; i++) {
			var instance = d.instances[i];
			var timeFormat = d3.time.format("%d.%m.%y %H:%M:%S");
			var timeFormat1 = d3.time.format("%Y-%m-%dT%H:%M:%S");
			var timeValue = instance.time.substr(0, instance.time.indexOf("^^"));
			var value = instance.value;
			if (instance.value.indexOf("^^") != -1) {
				value = instance.value.substr(0, instance.value.indexOf("^^"));
			}
			instance.label = "Time: " + timeFormat(timeFormat1.parse(timeValue)) + ", Value: " + getFormattedValue(value, instance.unit);
			if (instance.label.length > maxLengthLabel) {
				maxLengthLabel = instance.label.length;
			}
		}
		
		visibleMetricInstances = true;
		vis.append("svg:rect")
			.attr("class", "metric-instance")
			.attr("x", d.x)
			.attr("y", d.y)
			.attr("width", 5.6 * maxLengthLabel)
			.attr("height", "140")
			.style("fill", "white")
			.attr("fill-opacity", "0.8")
			.style("stroke-width", "1px")
			.attr("stroke-opacity", "0.8")
			.style("stroke", "black")
			.on("mouseover", function() {
				if (cancelTimeoutMetricInstances != null) {
					clearTimeout(cancelTimeoutMetricInstances);
					cancelTimeoutMetricInstances = null;
				}
			})
			.on("mouseout", function() {
				if (cancelTimeoutMetricInstances == null) {
					cancelDisplayMetricInstances(d);
				}
			});
		
		vis.selectAll("text.metric-instance")
			.data(d.instances).enter()
			.append("svg:text")
			.attr("class", "metric-instance")
			.attr("x", d.x)
			.attr("y", function(data, i) {return (d.y + ((i + 1) * 10) + 2) + "px";})
			.attr("font-family", "Verdana")
			.attr("font-size", "10")
			.attr("stroke-width", "0px")
			.attr("fill", "black")
			.attr("fill-opacity", "0.8")
			.attr("pointer-events", "none")
			.text(function(d) {
				return d.label;
			});
	}
	
	function cancelDisplayMetricInstances(d) {
		if (d.type != METRIC_TYPE || !visibleMetricInstances) {
			return;
		}
		cancelTimeoutMetricInstances = setTimeout(function() {
			visibleMetricInstances = false;
			vis.selectAll("rect.metric-instance").remove();
			vis.selectAll("text.metric-instance").remove();			
		}, 500);
	}
	
	function getFormattedValue(value, unit) {
		switch (unit) {
		case ":Byte":
			if (value > 1024 * 1024) {
				return d3.format(".2f")(value/1024/1024) + "M";
			} else if (value > 1024) {
				return d3.format(".2f")(value/1024) + "Kb";
			} else {
				return Math.floor(value) + "b";
			}
		case ":Kilobyte":
			if (value > 1024 ) {
				return d3.format(".2f")(value/1024) + "M";
			} else {
				return d3.format(".2f")(value) + "Kb";
			}
		case ":Percent":
			return d3.format(".2%")(value);
		case ":Microsecond":
			if (value > 1000) {
				return d3.format(".2f")(value / 1000) + "s";
			} else if (value > 1000 * 60) {
				return d3.format(".2f")(value / (1000 * 60)) + "m";
			} else {
				return d3.format(".2f")(value) + "ms";
			}
		case ":BooleanValue":
			if (value == 0) {
				return "false";
			} else {
				return "true";
			}
		default:
			return value;
		}
	}

};
