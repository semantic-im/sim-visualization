var selectedApplication = null;
var selectedSystem = null;

$(document).ready(function() {
	//append Applications
	var sparql = "select distinct ?id ?name "
				+ "	where { "
				+ "		?id rdf:type :Application ."
				+ "		?id :hasName ?name ."
				+ "	} "
				+ "order by DESC(?name) ";
	var applications = executeSparql([ "id", "name" ], sparql);
	d3.select("#applications").selectAll("option.application").data(applications).enter()
		.append("option")
		.attr("class", "application")
		.attr("value", function(d) {return d.id;})
		.text(function(d) {return d.name;});
	d3.select("#applications").on("change", function() {
			for (var i = 0; i < applications.length; i++) {
				if (applications[i].id = this.value) {
					selectedApplication = applications[i];
					initSystems(selectedApplication);
					break;
				}
			}
		});

	selectedApplication = applications[0];
	initSystems(selectedApplication);
	
	d3.select("#changeApplicationSystem")
		.on("click", changeApplicationSystem);
	d3.select("#toRealtimeCharts")
		.on("click", displayRealTimeCharts);
	d3.select("#toMetricCharts")
		.on("click", displayMetricCharts);
	d3.select("#toOntologyGraph")
		.on("click", displayOntologyGraph);
});

function initSystems(application) {
	//append systems
	var sparql = "select distinct ?id ?name ?totalMemory ?cpuCount "
				+ "	where { "
				+ "		?id rdf:type :System ."
				+ "		?id :hasName ?name ."
				+ "		?id :hasMeasurement ?measurement ."
				+ "		" + application.id + " :hasMeasurement ?measurement ."
				+ "		?id :hasTotalMemory ?totalMemory ."
				+ "		?id :hasCpuCount ?cpuCount ."
				+ "	} "
				+ "order by DESC(?name) ";
	var systems = executeSparql([ "id", "name", "totalMemory", "cpuCount" ], sparql);
	d3.select("#systems").selectAll("option.system").data(systems).enter()
		.append("option")
		.attr("class", "system")
		.attr("value", function(d) {return d.id;})
		.text(function(d) {return d.name;});
	d3.select("#systems").on("change", function() {
			for (var i = 0; i < systems.length; i++) {
				if (systems[i].id = this.value) {
					selectedSystem = systems[i];
					break;
				}
			}
		});
	
	selectedSystem = systems[0];
}

function changeApplicationSystem() {
	d3.select("#applicationSystemSelection").style("display", "block");
	d3.select("#realTimeCharts").style("display", "none");
	stopRealtimeCharts();
	d3.select("#metricCharts").style("display", "none");
	d3.select("#ontologyGraph").style("display", "none");
}

function checkApplicationSystemToolbarVisibility() {
	if (selectedSystem) {
		d3.select("#selectedApplication").text(selectedApplication.name);
		d3.select("#selectedSystem").text(selectedSystem.name);
		d3.select("#selectedSystemTotalMemory").text((Math.round(trimDatatype(selectedSystem.totalMemory) / 1024 / 1024)) + " Mb");
		d3.select("#selectedSystemCpuCount").text(trimDatatype(selectedSystem.cpuCount));
		d3.select("#applicationSystemToolbar").style("display", "block");
	} else {
		d3.select("#applicationSystemToolbar").style("display", "none");
	}
}

function displayRealTimeCharts() {
	checkApplicationSystemToolbarVisibility();
	
	d3.select("#applicationSystemSelection").style("display", "none");
	d3.select("#realTimeCharts").style("display", "block");
	startRealtimeCharts();
}

function displayMetricCharts() {
	checkApplicationSystemToolbarVisibility();
	
	d3.select("#applicationSystemSelection").style("display", "none");
	d3.select("#metricCharts").style("display", "block");
	startMetricCharts();
}

function displayOntologyGraph() {
	checkApplicationSystemToolbarVisibility();
	
	d3.select("#applicationSystemSelection").style("display", "none");
	d3.select("#ontologyGraph").style("display", "block");
	var ontologyGraph = new OntologyGraph();
}
