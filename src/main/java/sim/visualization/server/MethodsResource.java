/**
 * 
 */
package sim.visualization.server;

import org.apache.log4j.Logger;
import org.json.JSONArray;
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
public class MethodsResource extends ServerResource {

	public static final Logger logger = Logger.getLogger(MethodsResource.class);
	
	@Post("json")
	public Representation post(Representation entity) throws ResourceException {
	        try {
	        	Model model = ModelUtil.openModel();
	    		StringBuilder query = new StringBuilder();
	    		query.append(ModelUtil.readSparqlFile(this.getClass().getResource("/prefixes.sparql")));
	    		query.append(ModelUtil.readSparqlFile(this.getClass().getResource("/methods.sparql")));
	    		
	    		JSONArray data = new JSONArray();
	    		
	    		QueryResultTable qrt = model.sparqlSelect(query.toString());
	    		ClosableIterator<QueryRow> it = qrt.iterator();
	    		while (it.hasNext()) {
	    			QueryRow qr = it.next();
	    			Node subject = qr.getValue("subject");
	    			//JSONObject jsonObject = new JSONObject();
	    			//jsonObject.put("method", subject.toString());
	    			data.put(subject.toString());
	    		}

                getResponse().setStatus(Status.SUCCESS_ACCEPTED);
                
                Representation rep = new JsonRepresentation(data);
                
                getResponse().setStatus(Status.SUCCESS_OK);
                
                return rep;
	        } catch (Exception e) {
	        	
	            getResponse().setStatus(Status.SERVER_ERROR_INTERNAL);
	        }
	        return null;
	}

}
