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

function getMetricData(node) {
	ajaxCall("metric", callback, node, async);
}