/**
 * 
 */
package sim.visualization.server;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URL;

import org.apache.log4j.Logger;
import org.ontoware.rdf2go.model.Model;
import org.openrdf.rdf2go.RepositoryModel;
import org.openrdf.repository.http.HTTPRepository;
import org.restlet.Context;
import org.restlet.Response;

/**
 * @author valer
 *
 */
public class ModelUtil {

	public static final Logger logger = Logger.getLogger(ModelUtil.class);

	public static Model openModel() {
		String repoAddress = "http://" + Response.getCurrent().getServerInfo().getAddress() + ":"
				+ Response.getCurrent().getServerInfo().getPort() + "/openrdf-sesame";
		Context.getCurrentLogger().info("Model.openModel(): " + repoAddress);
		Model model = new RepositoryModel(new HTTPRepository(repoAddress, "sim"));
		model.open();
		return model;
	}

	public static String readSparqlFile(URL url) {
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

	public static void replaceParameters(StringBuilder query, String parameterName, String value) {
		int start = -1;
		while (true) {
			start = query.indexOf(parameterName, start);
			if (start == -1) {
				break;
			}
			int end = start + parameterName.length();
			query.replace(query.indexOf(parameterName), end, "<" + value + ">");
		}
	}

}
