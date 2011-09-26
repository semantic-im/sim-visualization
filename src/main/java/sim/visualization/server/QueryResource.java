/**
 * 
 */
package sim.visualization.server;

import java.io.IOException;
import java.util.Map;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.QueryRow;
import org.ontoware.rdf2go.model.node.Node;
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
public class QueryResource extends ServerResource {

	public static final Logger logger = Logger.getLogger(QueryResource.class);
	
	@Post("json")
	public Representation post(Representation entity) throws ResourceException {
		if (entity == null) {
			throw new ResourceException(Status.CLIENT_ERROR_BAD_REQUEST, "expecting input sparql!");
		}
		try {
			JsonRepresentation jsonRepresentation = new JsonRepresentation(entity.getText());
			JSONObject jsonObject = jsonRepresentation.getJsonObject();
			JSONArray selectVariableNames = jsonObject.getJSONArray("select-variable-names");
			String sparql = jsonObject.getString("sparql");
			
        	Model model = ModelUtil.openModel();
        	Map<String, String> namespaces = model.getNamespaces();
    		StringBuilder query = new StringBuilder();
    		query.append(ModelUtil.readSparqlFile(this.getClass().getResource("/prefixes.sparql")));
    		query.append(sparql);
    		
    		JSONArray data = new JSONArray();
    		
    		QueryResultTable qrt = model.sparqlSelect(query.toString());
    		ClosableIterator<QueryRow> it = qrt.iterator();
    		while (it.hasNext()) {
    			QueryRow qr = it.next();
    			JSONObject obj = new JSONObject();
    			for (int i = 0; i < selectVariableNames.length(); i++) {
    				String name = null;
    				try {
    					Node value = qr.getValue(selectVariableNames.getString(i));
    					name = value.toString();
    				} catch (NullPointerException e) {
    					logger.warn("can not find " + selectVariableNames.getString(i) + " in arguments !");
    					name = "";
    				}

    				for (String namespacePrefix : namespaces.keySet()) {
    					String namespace = namespaces.get(namespacePrefix);
    					if (name.contains(namespace)) {
    						name = name.replace(namespace, namespacePrefix + ":");
    						break;
    					}
    				}

    				obj.put(selectVariableNames.getString(i), name);
    			}
    			data.put(obj);
    		}

            getResponse().setStatus(Status.SUCCESS_ACCEPTED);
            
            Representation rep = new JsonRepresentation(data);
            
            getResponse().setStatus(Status.SUCCESS_OK);
            
            return rep;
		} catch (IOException e) {
			throw new ResourceException(e);
		} catch (JSONException e) {
			throw new ResourceException(e);
		}
	}

}
