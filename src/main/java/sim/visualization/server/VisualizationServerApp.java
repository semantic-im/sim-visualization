/**
 * 
 */
package sim.visualization.server;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.Application;
import org.restlet.Request;
import org.restlet.Response;
import org.restlet.Restlet;
import org.restlet.data.Method;
import org.restlet.data.Status;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.routing.Router;

/**
 * @author valer
 *
 */
public class VisualizationServerApp extends Application {

	/*
	public static void main(String[] args) throws Exception {
		OntoViewServerApp app = new OntoViewServerApp();
		
		 // Create a new Restlet component and add a HTTP server connector to it  
	    Component component = new Component();  
	    component.getServers().add(Protocol.HTTP, 8182);  
	  
	    // Then attach it to the local host  
	    component.getDefaultHost().attach(app);  
	  
	    // Now, let's start the component!  
	    // Note that the HTTP server connector is also automatically started.  
	    component.start();  
	}
	*/
	
	@Override
	public Restlet createInboundRoot() {
		Router router = new Router(getContext());

		Restlet test = new Restlet(getContext()) {  
		    @Override  
		    public void handle(Request request, Response response) {  
		        // Print the user name of the requested orders
		    	/*
		        String message = "Order \""  
		                + request.getAttributes().get("order")  
		                + "\" for user \""  
		                + request.getAttributes().get("user") + "\"";  
		        response.setEntity(message, MediaType.TEXT_PLAIN);
		        */
		    	Method method = request.getMethod();
		        if (!Method.POST.equals(method))  
		        {  
		            System.out.println("This is not a post request");  
		        }  
		          
		        // Find out what kind of media is enclosed with the request, for instance  
		        // application/xml, application/json etc.  
		        //MediaType theMediaType = request.getEntity().getMediaType();  
		          
		        // Get the request payload. If your service only accepts JSON, here is  
		        // where you'll retrieve teh JSON representation.
		        JSONObject newMap = null;
		        try {  
		            String theRequestPayloadString = request.getEntity().getText();
		            
					try {
						newMap = new JSONObject(theRequestPayloadString);
						newMap.put("id", "2");
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
		            System.out.println(newMap);  
		        } catch (IOException e) {  
		            // TODO Auto-generated catch block  
		            e.printStackTrace();  
		        } 
		        JsonRepresentation jr = new JsonRepresentation(newMap);
		        response.setEntity(jr);
		        response.setStatus(Status.SUCCESS_OK);  
		    }  
		};  
		
		router.attach("/test", test);
		router.attach("/ontology/name", OntologyNameResource.class);
		router.attach("/ontology/browse", OntologyBrowseResource.class);
		router.attach("/metric", MetricResource.class);
		router.attach("/query", QueryResource.class);
		
		return router;
	}

}
