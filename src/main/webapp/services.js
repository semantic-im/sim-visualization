var serverUrl = "server/";

function ajaxCall(service, callback, theData, async) {
	if (async === undefined) {
		async = true;
	}
	var params = { url: serverUrl + service,
			contentType: "application/json; charset=utf-8",
			type: "POST",
			data: theData, 
			dataType: "json", 
			success: callback,
			async: async
	};
	$.ajax(params); 	
}

function getOntology() {
	var theResult = null;
	ajaxCall("ontology/name", function(result) {theResult = result.ontology;}, null, false);
	return theResult;
}

function getChilds(node, callback, async) {
	ajaxCall("ontology/browse", callback, node, async);
}

function getMetricData(metric, callback) {
	ajaxCall("metric", callback, metric, false);
}

function executeSparql(selectVariableNames, sparql, async, callback) {
	var s = "[";
	for (var i = 0; i < selectVariableNames.length; i++) {
		if (i != 0) {
			s = s + ",";
		}
		s = s + "'" + selectVariableNames[i] + "'";
	}
	s = s + "]";
	if (async) {
		ajaxCall("query", callback, "{select-variable-names:" + s + ", sparql:'" + sparql + "'}", async);
	} else {
		var theResult = null;
		ajaxCall("query", function(result) {theResult = result;}, "{select-variable-names:" + s + ", sparql:'" + sparql + "'}", async);
		return theResult;
	}
}
