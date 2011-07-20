package sim.visualization.server;

import java.io.IOException;
import java.util.Properties;

import org.apache.log4j.Logger;

public class Settings {

	public static final Logger logger = Logger.getLogger(Settings.class);
	
	private static Properties settings;
	
	static {
		settings = new Properties();
		try {
			settings.load(ModelUtil.class.getResourceAsStream("/settings.properties"));
		} catch (IOException e) {
			logger.error("io exception", e);
			throw new RuntimeException("io exception", e);
		}
	}
	
	public static String getRdfServerAddress() {
		return settings.getProperty("rdf.server.address");
	}

	public static String getRdfServerPort() {
		return settings.getProperty("rdf.server.port");
	}

	public static String getRdfRepositoryId() {
		return settings.getProperty("rdf.repository.id");
	}
}
