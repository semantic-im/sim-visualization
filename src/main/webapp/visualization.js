var INITIAL_VISIBLE_DEPTH = 1;

var w = window.innerWidth - ((window.innerWidth*5)/100),//document.all.ontoview.clientWidth,
	h = window.innerHeight - ((window.innerHeight*5)/100);//document.all.ontoview.clientHeight;
	//fill = d3.scale.category10();

if (w < 800) {
	w = 800;
}
if (h < 600) {
	h = 600;
}
//console.debug(w);
//console.debug(h);

var nodes, links;
var nodesHash = new Hashtable(), force;
var childLinksHash = new Hashtable();

var vis = d3.select("#ontoview")
	.append("svg:svg")
	.attr("width", w + "px")
	.attr("height", h + "px")
	.style("border", "1px solid black")
	.attr("pointer-events", "all")
	.call(d3.behavior.zoom().on("zoom", redraw))
	.append("svg:g");

function redraw() {
	vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

function Node(jsonNode) {
	this.name = jsonNode.name;
	this.type = jsonNode.type;
	this.label = jsonNode.label;
	if (this.type == "cluster") {
		this.clusterEntity = jsonNode.clusterEntity;
		this.clusterEntityType = jsonNode.clusterEntityType;
		this.from = jsonNode.from;
		this.to = jsonNode.to;
	}
	
	this.isChildCount = 0;
	this.links = new HashSet(); //Link
}

function Link(jsonLink, target) {
	this.name = jsonLink.name;
	this.label = jsonLink.label;
	
	this.target = target; //Node
}

function nodeid(n) {
	return n.name;
}

function linkid(l) {
	var u = nodeid(l.source),
		v = nodeid(l.target);
	return u.name + v.name;
}

function getLinks(nodes_) {
	var links_ = new Array();
	for (var i = 0; i < nodes_.length; i++) {
		var linksValues = nodes_[i].links.values();
		for (var j = 0; j < linksValues.length; j++) {
			linksValues[j].source = nodes_[i];
			links_.push(linksValues[j]);
		}
	}
	return links_;
}

function draw() {
	nodes = nodesHash.values();
	links = getLinks(nodes);
	
	if (force) force.stop();
	
	force = d3.layout.force()
		.charge(-500)
		.distance(80)
		.nodes(nodes)
		.links(links)
		.size([w, h])
		.start();

	var link = vis.selectAll("line.link").data(links, linkid);
	link.exit().remove();
	link.enter().insert("svg:line", "g.node")
		.attr("class", "link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
	link = vis.selectAll("line.link");
	link.style("stroke", function(d) {return getLinkColor(d); });
	
	//line arrow
	var linkArrow = vis.selectAll("polyline.link").data(links, linkid);
	linkArrow.exit().remove();
	linkArrow.enter().insert("svg:polyline", "g.node")
		.attr("class", "link")
		.attr("points", function(d) {return positionArrow(d); });
	linkArrow = vis.selectAll("polyline.link");
	linkArrow.style("fill", function(d) {return getLinkColor(d); });
	//~

	var node = vis.selectAll("g.node")
		.data(nodes, nodeid);
	node.exit().remove();
	var enterNodes = node.enter();
	
	var svgGraphic = enterNodes.append("svg:g")
		.attr("id", function(d) {return validID(d.name);})
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	svgGraphic.append("svg:circle")
		.attr("class", "node")
		.attr("r", function(d) {return getRadius(d);})
		.style("fill", function(d) { return getFill(d); });

	
	displayExpandSigns(vis.selectAll("g.node"));
	
	svgGraphic.append("svg:text")
		.attr("class", "node")
		.attr("dx", "12") 
		.attr("dy", ".35em") 
		.text(function(d) { return d.label; });

	svgGraphic.append("svg:title")
		.text(function(d) { return d.label; });

	node = vis.selectAll("g.node");
	node.on("mouseover", function(d) {actionsDisplay(d);});
	node.on("mouseout", function(d) {actionsCancelTimeout(d);});
	node.on("click", function(d) {if (!(d3.event.target.id.match("actions"))) {expand(d);}})
		.call(force.drag);
	
	force.on("tick", function() {
		link.attr("x1", function(d) {return d.source.x;})
			.attr("y1", function(d) {return d.source.y;})
			.attr("x2", function(d) {return d.target.x;})
			.attr("y2", function(d) {return d.target.y;});

		linkArrow.attr("points", function(d) {return positionArrow(d); });
		
		node.attr("transform", function(d) { 
			return "translate(" + d.x + "," + d.y + ")"; });		
	});
}

function start() {
	draw();

	vis.style("opacity", 1e-6)
		.transition()
		.duration(1000)
		.style("opacity", 1);
};

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

function validID(id) {
	return id.replace("#", "_").replace(new RegExp("\\.", "g"), "").replace(new RegExp("/", "g"), "").replace(new RegExp(":", "g"), "");
}

function displayExpandSign(id) {
	var selection = vis.select("#" + validID(id));
	
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

function getRadius(d) {
	if (d.type == "cluster") {
		return 8;
	} else {
		return 10;
	}
}

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

function getFill(node) {
	if (node.type == "ontology") {
		return "#9467bd";
	} else if (node.type == "class") {
		return "#ff7f0e";
	} else if (node.type == "objectProperty") {
		return "#1f77b4";
	} else if (node.type == "datatypeProperty") {
		return "#2ca02c";
	} else if (node.type == "cluster") {
		return "#999";
	}
}

function getLinkColor(link) {
	if (link.name.match("subClassOf")) {
		return "#ff7f0e";
	} else if (link.name.match("domain")) {
		return "#1f77b4";
	} else if (link.name.match("range")) {
		return "#17becf";
	} else {
		return "#999";
	}
}

function createGetChildsJsonParameter(node) {
	var result = "{" + "name:'" + node.name + "'";
	result = result + ",type:" + node.type;
	if (node.type == "cluster") {
		result = result + ",clusterEntity:'" + node.clusterEntity + "'";
		result = result + ",clusterEntityType:'" + node.clusterEntityType + "'";
		result = result + ",from:" + node.from;
		result = result + ",to:" + node.to;
	}
	return result + "}";
}

function cacheNodesChilds(nodes_) {
	for (var i = 0; i < nodes_.length; i++) {
		var node = nodes_[i];
		if (childLinksHash.containsKey(node.name)) {
			continue;
		}
		var jsonNode = createGetChildsJsonParameter(node);
		getChilds(jsonNode, function(childs_) {
			cacheNodeChilds(childs_.node, childs_.childs);
		});
	}
}

function cacheNodeChilds(parentNodeName, childs_) {
	if (!parentNodeName) {
		return;
	}
	var childLinks = new HashSet();
	for (var i = 0; i < childs_.length; i++) {
		var jsonLink = childs_[i].link;
		var jsonNode = childs_[i].node;
		var child = new Node(jsonNode);
		var childLink = null;
		if (jsonLink) {
			childLink = new Link(jsonLink);
			childLink.target = child;
		}
		if (childLink) {
			childLink.source = nodesHash.get(parentNodeName);
			childLink.target = child;
			childLinks.add(childLink);			
		}
	}
	childLinksHash.put(parentNodeName, childLinks);
	
	if (childs_.length > 0) {
		nodesHash.get(parentNodeName).expanded = false;
		displayExpandSign(parentNodeName);
	}
}

function recursive(node, depth) {
	var jsonNode = null;
	if (node) {
		jsonNode = createGetChildsJsonParameter(node);
	}
	getChilds(jsonNode, 
		function (childs_) {
			cacheNodeChilds(childs_.node, childs_.childs);
			for (var i = 0; i < childs_.childs.length; i++) {
				var jsonNode = childs_.childs[i].node;
				var child;
				child = new Node(jsonNode);
				if (!nodesHash.containsKey(child.name)) {
					nodesHash.put(child.name, child);
				}
				var child = nodesHash.get(child.name);
				if (depth < INITIAL_VISIBLE_DEPTH) {
					recursive(child, depth + 1);
				}
			}
			depth++;
		},
		false
	);
	if (node) {
		expand(node);
	}
}
var jsonNode = new Object();
var ontologyName = getOntology();
jsonNode.name = ontologyName; //"ROOT_NODE_ID";
jsonNode.type = "ontology";
jsonNode.label = ontologyName; //"Root";
var rootNode = new Node(jsonNode);
nodesHash.put(rootNode.name, rootNode);
recursive(rootNode, 1);

start();
//cacheNodesChilds(nodesHash.values());

//d3.json("ontology.json", jsonCallback);

window.transition = function() {
	draw();
};

function expand(d) {
	
	//node does not have childs so expanded is undefined, or it could be that the async call for childs is not finished ...!!!
	if (d.expanded == undefined) {
		return;
	}
	
	var node = nodesHash.get(d.name);
	var childLinks = childLinksHash.get(d.name);
	if (!childLinks) {return;}
	
	if (node.expanded) {
		implodeChildLinks(node, childLinks);
	} else {
		var childNodes = new Array();
		childLinks.values().forEach(function(childLink) {
			var newNode = childLink.target;
			if (!nodesHash.containsKey(newNode.name)) {
				nodesHash.put(newNode.name, newNode);
			} else {
				newNode = nodesHash.get(newNode.name);
			}
			newNode.isChildCount = newNode.isChildCount + 1;
			childLink.target = newNode;
			node.links.add(childLink);
			childNodes.push(newNode);
		});
		cacheNodesChilds(childNodes);
		node.expanded = true;
	}
	draw();
};

function implodeChildLinks(node, childLinks) {
	if (!node.expanded) {return;}
	if (!childLinks) {return;}
	var childLinksValues = childLinks.values();
	for(var i = 0; i < childLinksValues.length; i++) {
		implodeChildLink(node, childLinksValues[i]);
	}
	node.expanded = false;
}

function implodeChildLink(node, childLink) {
	var newNode = childLink.target;
	implodeChildLinks(newNode, childLinksHash.get(newNode.name));
	if (newNode.isChildCount == 1) {
		nodesHash.remove(newNode.name);
	}
	node.links.remove(childLink);
	newNode.isChildCount = newNode.isChildCount - 1;	
}
