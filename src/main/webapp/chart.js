var nodes = new HashSet();

function createMetricJsonParameter(node) {
	var result = "{" + "name:'" + node.name + "'";
	result = result + ",type:" + node.type;
	return result + "}";
}

function addNodeToChart(node) {
	if (!nodes.contains(node)) {
		nodes.add(node);
	}
	redrawChart();
}

function redrawChart() {
	var data = getMetric(createMetricJsonParameter(node));
}
