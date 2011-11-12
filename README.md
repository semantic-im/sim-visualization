SIM VISUALIZATION
=================

DESCRIPTION
-----------

This project is a web tool for graphical visualization of ontologies.
The tool is designed as a client server application, the client is used for visualization and the server supplies the data for the client.

The client is a javascript application running into any browser supporting HTML5. The ontology is visualizaed into the client as a graph. 
The nodes of the graph are classes, object properties and data properties. The D3 library specialized in manipulating documents based on data 
is used to create interactive SVG graph and charts, see http://mbostock.github.com/d3/

The navigation start from one root element, which is the ontology. The childrens of the root element are all the classes that are no subclasses 
of any other class (we ignore here the possible inferences which would make any class a subclass of owl:Thing). One class can have the following 
childrens : other classes that directly subclass it, properties having this class as range or domain.

To allow a better navigation of this graph we group into clusters childrens more than a configurable value. For example, if a class has 18 childrens
and the cluster maximum size is 10 then before displaying the childrens we display 2 clusters, one which give access to the first 10 elements of the
class and another one giving access to the other 8 childrens.

The client obtains the data to display from the server. The server is an web server following the REST (REpresentational State Transfer) technology and
is implemented using Restlet framework, see http://www.restlet.org/

The data transfer between client and server and viceversa is respecting JSON format, see http://www.json.org/
Most of the client calls are done asynchronously to assure a smooth visualization.
On his end the server connects to a Sesame HTTP repository for obtaining ontologie's data. The data is obtaining using SPARQL interrogations and the
the Java library for this job is RDF2GO, see http://semanticweb.org/wiki/RDF2Go


USAGE
-----

- start an Sesame HTTP server on localhost (the current hardcoded url is 'http://127.0.0.1:8080/openrdf-sesame'), an repository with id 'sim' must exist in sesame
- start the tool using the mvaen command : 'mvn jetty:run'
- browse to this location : 'http://localhost:8081/sim-visualization/'

 
