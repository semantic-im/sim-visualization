/**
 * 
 */
package sim.visualization.server;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.QueryRow;
import org.restlet.Context;
import org.restlet.data.Status;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;
import org.restlet.resource.ServerResource;

/**
 * @author valer
 *
 */
public class MetricResource extends ServerResource {

	public static final Logger logger = Logger.getLogger(MetricResource.class);

	private static final int CLUSTER_SIZE = 8;
	private static final String ONTOLOGY_URI = "http://www.larkc.eu/ontologies/IMOntology.rdf#";

	private int getClusterDepth(int count) {
		int aCount = count, depth = 0;
		do {
			aCount = aCount / CLUSTER_SIZE;
			depth++;
		} while (aCount > CLUSTER_SIZE);
		return depth;
	}

	private JSONObject createClusterNode(String clusterEntity, String nodeName, String linkName, int from, int to) throws JSONException {
		JSONObject cluster = new JSONObject();
		cluster.put("name", nodeName);
		cluster.put("clusterEntity", clusterEntity == null ? nodeName : clusterEntity);
		cluster.put("type", "cluster");
		cluster.put("label", (from + 1) + ".." + to);
		cluster.put("from", from);
		cluster.put("to", to);

		JSONObject obj = new JSONObject();
		obj.put("node", cluster);

		if (linkName != null) {
			JSONObject link = new JSONObject();
			link.put("name", linkName);
			link.put("label", "");
			obj.put("link", link);
		}

		return obj;
	}

	@Override
	@Post("json")
	public Representation post(Representation entity) throws ResourceException {
		try {
			String nodeMetric = null;
			String nodeMethod = null;
			if (entity != null) {
				String text = entity.getText();
				JsonRepresentation represent = new JsonRepresentation(text);
				JSONObject jsonObject = represent.getJsonObject();
				nodeMetric = jsonObject.getString("metric");
				if (jsonObject.has("method")) {
					nodeMethod = jsonObject.getString("method");
				}
				System.out.println(nodeMetric);
			}

			getResponse().setStatus(Status.SUCCESS_ACCEPTED);

			JSONArray data = metricData(nodeMetric, nodeMethod);

			Representation rep = new JsonRepresentation(data);

			getResponse().setStatus(Status.SUCCESS_OK);

			return rep;
		} catch (Exception e) {
			logger.error("exception", e);
			getResponse().setStatus(Status.SERVER_ERROR_INTERNAL);
		}
		return null;
	}

	private String getQuery(String metric, String method) {
		StringBuilder query = new StringBuilder();
		query.append(ModelUtil.readSparqlFile(this.getClass().getResource("/prefixes.sparql")));
		if (method == null) {
			query.append(ModelUtil.readSparqlFile(this.getClass().getResource("/system-metric.sparql")));
		} else {
			query.append(ModelUtil.readSparqlFile(this.getClass().getResource("/method-metric.sparql")));
		}

		ModelUtil.replaceParameters(query, "$metric$", metric);
		if (method != null) {
			ModelUtil.replaceParameters(query, "$method$", method);
		}
		
		return query.toString();
	}

	/*
select distinct ?x ?date
where {
?x rdf:type sim:WallClockTime .
?x sim:hasTimeStamp ?date .
}
order by desc (?date)
limit 10
	 */

	public JSONArray metricData(String nodeMetric, String nodeMethod) throws JSONException {
		Model model = ModelUtil.openModel();

		JSONArray jsonArray = new JSONArray();

		QueryResultTable qrt = model.sparqlSelect(getQuery(nodeMetric, nodeMethod));
		ClosableIterator<QueryRow> it = qrt.iterator();
		while (it.hasNext()) {
			QueryRow qr = it.next();
			String metricId = qr.getValue("metricid").toString();
			String timestamp = qr.getValue("timestamp").toString();
			String value = qr.getValue("value").toString();

			JSONObject obj = new JSONObject();
			obj.put("id", metricId);
			obj.put("timestamp", timestamp.substring(0, timestamp.indexOf("^^")));
			obj.put("value", value.indexOf("^^") != -1 ? value.substring(0, value.indexOf("^^")) : value);

			jsonArray.put(obj);
		}


		return jsonArray;

	}

}

/*
ask {
?x rdf:type sim:TotalSystemFreeMemory .
?x ?z ?y .
?z rdfs:range xsd:dateTime .
}

[12:19:33 PM] Mihai Chezan: ask {
?x rdf:type sim:TotalSystemFreeMemory .
?x ?z ?y .
?y rdfs:range xsd:dateTime .
}
[12:21:16 PM] Mihai Chezan: ask {
?x rdf:type sim:TotalSystemFreeMemory .
?x ?z ?y .
?z rdfs:range xsd:dateTime .
}
[12:23:41 PM] Mihai Chezan:

select ?z
where {
?x rdf:type sim:TotalSystemFreeMemory .
?x ?z ?y .
?z rdfs:range xsd:dateTime .
}
limit 1 offset 1
[12:25:59 PM] Mihai Chezan: select ?x
where {
?x rdf:type sim:TotalSystemFreeMemory .

}
limit 1 offset 1

 */
