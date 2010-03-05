import java.net.*;
import org.xml.sax.InputSource;
import org.w3c.dom.*;
import javax.xml.xpath.*;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.*;
import java.nio.*;

import java.io.IOException;
import java.net.URISyntaxException;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;
import org.xml.sax.SAXException;

public class GeocodeProcessor {

  // Default URL prefix to the geocoder
  // The URL shown in these examples is a static URL which should already
  // be URL-encoded. In practice, you will likely have code
  // which assembles your URL from user or web service input
  // and plugs those values into its parameters.
  private static final String GEOCODE_REQUEST_PREFIX = "http://maps.google.com/maps/api/geocode/xml";
  private static final String GEOCODE_QUERY = "New+York,+NY";

  // Note: The default XPath expression "/" selects
  // all text within the XML.
  private static String XPATH_EXPRESSION = "//text()";
  
  public String _xpath = null;
  public Document _xml = null;

  public static void main(String[] args) throws IOException, URISyntaxException, ParserConfigurationException, SAXException {

    BufferedReader input = new BufferedReader(new InputStreamReader(System.in));

    String inputQuery, resultXml, urlString, xPathString = null;
    
    ByteBuffer resultBytes = null;

    // For testing purposes, allow user input for the URL.
    // If no input is entered, use the static URL defined above.    
    System.out.println("Enter the Geocode Request (default is 'New York, NY'): ");
    inputQuery = input.readLine();
    if (inputQuery.equals("")) {
      inputQuery = GEOCODE_QUERY;
    }
    
    urlString = GEOCODE_REQUEST_PREFIX + "?address=" + URLEncoder.encode(inputQuery, "UTF-8") + "&sensor=false";
    System.out.println(urlString);

    // Convert the string to a URL so we can parse it
    URL url = new URL(urlString);

    // For testing purposes, allow user input for the XPath expression.
    // If no input is entered, use the default expression defined above.   
    System.out.println("Enter the XPath expression to evaluate the response (default is '//text()'): ");
    xPathString = input.readLine();
    if (xPathString.equals("")) {
      xPathString = XPATH_EXPRESSION;
    }

    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    
    Document geocoderResultDocument = null;
    try {
      // open the connection and get results as InputSource.
      conn.connect();
      InputSource geocoderResultInputSource = new InputSource(conn.getInputStream());

      // read result and parse into XML Document
      geocoderResultDocument = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(geocoderResultInputSource);
    } finally {
      conn.disconnect();
    }

    // Process the results
    NodeList nodes = process(geocoderResultDocument, xPathString);
    
    // Print results
    for (int i = 0; i < nodes.getLength(); i++) {
      String nodeString = nodes.item(i).getTextContent();
      System.out.print(nodeString);
      System.out.print("\n");
    }
  }
  
  private void GeocodeProcessor() {
  }
  
  public static NodeList process(Document xml, String xPathString) throws IOException {

    NodeList result = null;

    System.out.print("Geocode Processor 1.0\n");

	XPathFactory factory = XPathFactory.newInstance();

    XPath xpath = factory.newXPath();

    try {
      result = (NodeList) xpath.evaluate(xPathString, xml, XPathConstants.NODESET);
    } catch (XPathExpressionException ex) {
	  // Deal with it
    }
    return result;
  }
}