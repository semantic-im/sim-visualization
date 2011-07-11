var timeoutTable = new Hashtable();
var displayTable = new HashSet();
var ACTIONS_DELAY = 1000;
var ACTIONS_HIDE_DELAY = 3000;

var actionsNodeNames = ["http://www.larkc.eu/ontologies/IMOntology.rdf#IORead"];

function actionsExistsForNode(node) {
	var founded = false;
	for(var i = 0; i <actionsNodeNames.length; i++) {
		if (node.name == actionsNodeNames[i]) {
			founded = true;
			break;
		}
	}
	return founded;
}

function actionsDisplay(node) {
	if ((node.type == 'cluster') || !actionsExistsForNode(node)) {
		return;
	}
	if (displayTable.contains(node.name)) {
		return;
	}
	displayTable.add(node.name);
	var timeout = setTimeout(function() {display(node);}, ACTIONS_DELAY);
	timeoutTable.put(node.name, timeout);
}

function actionsCancelTimeout(node) {
	if (!displayTable.contains(node.name)) {
		return;
	}
	var element = d3.select("#" + validID(node.name) + "_actions");
	if (!element.empty()) {
		return;
	}
	if (timeoutTable.containsKey(node.name)) {
		clearTimeout(timeoutTable.get(node.name));
		timeoutTable.remove(node.name);
	}
	displayTable.remove(node.name);
}
function actionsCancelDisplay(node) {
	if (timeoutTable.containsKey(node.name)) {
		clearTimeout(timeoutTable.get(node.name));
		timeoutTable.remove(node.name);
		var element = d3.select("#" + validID(node.name) + "_actions");
		element.remove();
		displayTable.remove(node.name);
	}
}

function display(node) {
	var radius = getRadius(node);
	
	var element = d3.select("#" + validID(node.name));
	/*
	element.append("svg:circle")
		.attr("class", "nodeActions")
		.attr("id", validID(node.name) + "_actions")
		.attr("r", "30");
	*/
	var depth = 8;
	var d = "m-" + radius + ",0" +
		" a" + radius + "," + radius +  " 0 0,1 " + getXOffset(radius) + ",-" + getYOffset(radius) +
		" l-" + getXDepth(depth) + ",-" + getYDepth(depth) +
		" a" + (radius + depth) + "," + (radius + depth) +  " 0 0,0 " + "0" + "," + (2 * (getYOffset(radius) + getYDepth(depth))) +
		" l" + getXDepth(depth) + ",-" + getYDepth(depth) +
		" a" + radius + "," + radius +  " 0 0,1 -" + getXOffset(radius) + ",-" + getYOffset(radius) +
		" z";
	
	element.append("svg:path")
		.attr("id", validID(node.name) + "_actions")
		.attr("class", "nodeActions")
		//.attr("d", "m0,0 h20 v-20 z");
		.attr("d", d)
		.on("mouseover", function(d) {this.style.fill = '#d62728';})
		.on("mouseout", function(d) {this.style.fill = '#ff9896';})
		.on("click", function() {addNodeToChart(node);});
	setTimeout(function() {actionsCancelDisplay(node);}, ACTIONS_HIDE_DELAY);
}

function getYOffset(radius) {
	var c = Math.sin(45) * radius;
	return c;
}

function getXOffset(radius) {
	var c = Math.cos(45) * radius;
	return radius - c;
}

function getXDepth(depth) {
	return Math.cos(45) * depth;
}

function getYDepth(depth) {
	return Math.sin(45) * depth;
}
