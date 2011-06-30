/**
 * 
 */
package sim.visualization.server;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.QueryRow;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.openrdf.rdf2go.RepositoryModel;
import org.openrdf.repository.http.HTTPRepository;
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
public class SparqlResource extends ServerResource {

	public static final Logger logger = Logger.getLogger(SparqlResource.class);
	
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
	
	@Post("json")
	public Representation post(Representation entity) throws ResourceException {
	        try {
	                String nodeName = null;
	                String nodeType = null;
	                String clusterEntity = null;
	                int clusterFrom = 0;
	                int clusterTo = 0;
	                if (entity != null) {
	                	String text = entity.getText();
		                JsonRepresentation represent = new JsonRepresentation(text);
		                JSONObject jsonObject = represent.getJsonObject();
		                nodeName = jsonObject.getString("name");
		                nodeType = jsonObject.getString("type");
		                if (nodeType.equals("cluster")) {
	                		clusterEntity = jsonObject.getString("clusterEntity");
		                	clusterFrom = jsonObject.getInt("from");
		                	clusterTo = jsonObject.getInt("to");
		                }
		                System.out.println(nodeName);
	                } else {
	                	//nodes(null);
	                	//int count = nodesCount(null);
	                	//System.out.print(count);
	                }
	                //JSONObject json  = jsonobject.getJSONObject("request");

	                getResponse().setStatus(Status.SUCCESS_ACCEPTED);
	                
	                JSONObject data = nodes(nodeName, clusterEntity, clusterFrom, clusterTo - clusterFrom);
	                
	                Representation rep = new JsonRepresentation(data);
	                
	                getResponse().setStatus(Status.SUCCESS_OK);
	                
	                return rep;
	        } catch (Exception e) {
	        	
	            getResponse().setStatus(Status.SERVER_ERROR_INTERNAL);
	        }
	        return null;
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

	private static final String ROOT_QUERY_ID = "root";
	private static final String NODE_QUERY_ID = "node";
	
	private String readFile(URL url) {
		StringBuilder content = new StringBuilder();
		BufferedReader br;
		try {
			br = new BufferedReader(new FileReader(new File(url.toURI())));
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			throw new RuntimeException(e.getMessage(), e);
		}
		String line = null;
		try {
			while((line = br.readLine()) != null) {
				content.append(line + "\n");
			}
			br.close();
		} catch (IOException e) {
			logger.error(e.getMessage(), e);
			throw new RuntimeException(e.getMessage(), e);
		}
		return content.toString();
	}
	
	private String getQuery(String queryId, String parentNode, int offset, int limit) {
		StringBuilder query = new StringBuilder();
		query.append(readFile(this.getClass().getResource("/prefixes.sparql")));
		query.append(readFile(this.getClass().getResource("/" + queryId + ".sparql")));
		
		replaceParameters(query, "$parentNode$", parentNode);
		if (offset > -1) {
			query.append("offset " + String.valueOf(offset) + "\n");
			query.append("limit " + String.valueOf(limit) + "\n");
		}
		
		return query.toString();
	}
	
	private void replaceParameters(StringBuilder query, String parameterName, String value) {
		int start = -1;
		while (true) {
			start = query.indexOf(parameterName, start);
			if (start == -1) {
				break;
			}
			int end = start + parameterName.length();
			query.replace(query.indexOf("$parentNode$"), end, "<" + value + ">");
		}
	}
	
	public int countQueryRows(ClosableIterator<QueryRow> queryRows) {
		int count = 0;
		Set<String> subjects = new HashSet<String>();
		while (queryRows.hasNext()) {
			QueryRow qr = queryRows.next();
			String subject = qr.getValue("subject").toString();
			if (!subjects.contains(subject)) {
				count++;
				subjects.add(subject);
			}
		}
		return count;
	}
	
	private QueryResultTable getQueryResultTable(Model model, String parentNode, int offset, int limit) {
		String queryId = null;
		if (parentNode.equals("ROOT_NODE_ID")) {
			queryId = ROOT_QUERY_ID;
		} else {
			queryId = NODE_QUERY_ID;
		}
		
		QueryResultTable qrt = model.sparqlSelect(getQuery(queryId, parentNode, offset, limit));
		return qrt;
	}
	
	public int nodesCount(String parentNode) {
		Model model = openModel();
		
		ClosableIterator<QueryRow> queryRows = getQueryResultTable(model, parentNode, -1, -1).iterator();
		int count = countQueryRows(queryRows);
		
		model.close();
		
		return count;
	}

	public JSONObject nodes(String parentNode, String clusterEntity, int offset, int count) {
		Model model = openModel();
		
		if (clusterEntity == null) {
			count = nodesCount(parentNode);
		}
		
		if (count <= CLUSTER_SIZE) {
			JSONObject childs;
			try {
				String node = clusterEntity != null ? clusterEntity : parentNode;
				childs = getChildsJSON(getQueryResultTable(model, node, offset, count), parentNode);
			} catch (JSONException e) {
				logger.error(e.getMessage(), e);
				throw new RuntimeException(e.getMessage(), e);
			} finally {
				model.close();
			}
			
			return childs;
		}
		
		clusterEntity = clusterEntity != null ? clusterEntity : parentNode;
		int depth = getClusterDepth(count);
		
		JSONArray jsonArray = new JSONArray();
		
		int clusterSize = (int) Math.pow(CLUSTER_SIZE, depth);
		int clustersCount = count / clusterSize;
		int clustersRest = count % clusterSize;
		if (clustersRest > 0) {
			clustersCount++;
		}
		for (int i = 0; i < clustersCount; i++) {
			int from = offset + (i * clusterSize);
			int to = offset + (((clustersRest > 0) && (i == clustersCount - 1)) ? (from + clustersRest) : ((i + 1) * clusterSize));
			
			String clusterName = clusterEntity + "-C_" + from + "_" + to;
			
			try {
				jsonArray.put(createClusterNode(clusterEntity, clusterName, clusterName + "L", from, to));
			} catch (JSONException e) {
				logger.error(e.getMessage(), e);
				throw new RuntimeException(e.getMessage(), e);
			}
		}
		
		JSONObject jsonObject = new JSONObject();
		try {
			jsonObject.put("node", parentNode);
			jsonObject.put("childs", jsonArray);
		} catch (JSONException e) {
			logger.error(e.getMessage(), e);
			throw new RuntimeException(e.getMessage(), e);
		}
		
		return jsonObject;		
		
	}

	private Model openModel() {
		Model model = new RepositoryModel(new HTTPRepository("http://127.0.0.1:8080/openrdf-sesame", "sim"));
		model.open();
		
		return model;
	}
	
	private JSONObject getChildsJSON(QueryResultTable queryResultTable, String parentNode) throws JSONException {
		if (queryResultTable.getVariables().size() != 3) {
			logger.error("The query must return exactly three variables!");
			throw new RuntimeException("The query must return exactly three variables!");
		}
		
		JSONArray jsonArray = new JSONArray();
		
		ClosableIterator<QueryRow> queryRows = queryResultTable.iterator();
		Set<String> subjects = new HashSet<String>();
		while (queryRows.hasNext()) {
			QueryRow qr = queryRows.next();
			Node subject = qr.getValue("subject");
			Node type = qr.getValue("type");
			Node predicate = qr.getValue("predicate");
			if (!(subject instanceof URI)) {
				logger.error("the return types must pe URI!");
				throw new RuntimeException("the return types must pe URI!");
			}
			if (subjects.contains(subject.toString())) {
				continue; //the predicate must be different, save it on the links name
			}
			subjects.add(subject.toString());

			URI valueURI = subject.asURI();
			URI typeURI = type.asURI();
			URI predicateURI = predicate.asURI();
			jsonArray.put(createNode(valueURI, typeURI, predicateURI));
		}
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("node", parentNode);
		jsonObject.put("childs", jsonArray);

		return jsonObject;
	}

	private JSONObject createNode(URI subjectURI, URI typeURI, URI predicateURI) throws JSONException {
		JSONObject node = new JSONObject();
		node.put("name", subjectURI.toString());
		node.put("type", typeURI.equals(OWL.Class) ? "class" : typeURI.equals(OWL.ObjectProperty) ? "objectProperty" : typeURI.equals(OWL.DatatypeProperty) ? "datatypeProperty" : "entity");
		node.put("label", subjectURI.toString().replace(ONTOLOGY_URI, ""));
		
		JSONObject obj = new JSONObject();
		obj.put("node", node);

		String linkName = predicateURI.toString();
		if (linkName != null) {
			JSONObject link = new JSONObject();
			link.put("name", linkName);		
			link.put("label", linkName);
			obj.put("link", link);
		}
		
		return obj;
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
