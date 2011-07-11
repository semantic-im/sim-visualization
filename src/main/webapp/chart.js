var chartNodes = new HashSet();

function createMetricJsonParameter(node) {
	var result = "{" + "name:'" + node.name + "'";
	result = result + ",type:" + node.type;
	return result + "}";
}

function addNodeToChart(node) {
	if (!chartNodes.contains(node)) {
		chartNodes.add(node);
	}
	redrawChart();
}

function redrawChart() {
	var data = getMetric(createMetricJsonParameter(node));
}
