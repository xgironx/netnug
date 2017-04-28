package com.bah.vane.parsers.opnet;

import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.junit.Test;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Location;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Subnet;
import com.bah.vane.builders.opnet.BasicSubnetBuilder;

import junit.framework.TestCase;

public class OpnetSAXParserTest extends TestCase {

	private OpnetParser parser;

	public void setUp() {
		parser = new OpnetSAXParser();
	}

	@Test
	public void testEmptyXML() {
		Reader emptyReader = new StringReader("");

		OpnetRootObject emptyNetworkBuilder = new BasicSubnetBuilder();

		try {
			parser.networkFromXML(emptyReader, emptyNetworkBuilder);
			fail("Should have thrown OpnetXMLException");
		} catch (OpnetXMLException e) {

		}
	}

	@Test
	public void testTinyXML() throws IOException, OpnetXMLException {
		// Read out the network
		Reader tinyReader = new InputStreamReader(getClass().getResourceAsStream("/Tiny Example Network.xml"));

		BasicSubnetBuilder tinyNetworkBuilder = new BasicSubnetBuilder();

		parser.networkFromXML(tinyReader, tinyNetworkBuilder);

		tinyReader.close();

		Subnet tinyNetwork = tinyNetworkBuilder.build();

		// Set up some constants
		Set<String> correctNodeNames = new HashSet<>(Arrays.asList(new String[]{"Azores", "London", "Sao Paulo", "Fort Meade", "Lagos"}));

		Set<String> correctAzoresNodeNames = (new HashSet<>(correctNodeNames));
		correctAzoresNodeNames.remove("Azores");

		Map<String, Double> correctLats = new HashMap<>();
		Map<String, Double> correctLngs = new HashMap<>();

		correctLats.put("Sao Paulo", -23.514);
		correctLngs.put("Sao Paulo", -46.632);

		correctLats.put("Fort Meade", 39.05);
		correctLngs.put("Fort Meade", -76.75);

		correctLats.put("Lagos", 6.449);
		correctLngs.put("Lagos", 3.488);

		correctLats.put("London", 51.57);
		correctLngs.put("London", -0.007);

		correctLats.put("Azores", 38.732);
		correctLngs.put("Azores", -27.241);


		// Create a map (by name) of all of the nodes
		Map<String, Node> actualNodes = tinyNetwork.getDirectNodes()
				.stream()
				.collect(Collectors.toMap(node -> node.getName(), node -> node));

		// Check for correct number of items
		assertThat("Check node count", tinyNetwork.getDirectNodes(), hasSize(5));
		assertThat("Check link count", tinyNetwork.getDirectLinks(), hasSize(8));
		assertThat("Check demand count", tinyNetwork.getDirectDemands(), hasSize(2));
		assertThat("Check subnet count", tinyNetwork.getDirectSubnets(), hasSize(0));

		// Check that all of the node names are accounted for
		assertThat("Check node names", actualNodes.keySet(), equalTo(correctNodeNames));

		// Check that all of the coordinates are correct
		for(String nodeName : actualNodes.keySet()) {
			assertThat("Check " + nodeName + " latitude", actualNodes.get(nodeName).getLat(), closeTo(correctLats.get(nodeName), 1e-6));
			assertThat("Check " + nodeName + " longitude", actualNodes.get(nodeName).getLng(), closeTo(correctLngs.get(nodeName), 1e-6));
		}

		// Check that all of the links are right
		for(Node node : actualNodes.values()){
			// If it's the Azores, check all of the outgoing links
			if(node.getName().equals("Azores")){

				Set<String> azoresActualNodeNames = node.getOutgoingLinks().stream().map(link -> link.getToNode().getName()).collect(Collectors.toSet());

				assertThat(azoresActualNodeNames, equalTo(correctAzoresNodeNames));

			// If it's not the Azores, make sure it's linked to the Azores
			}else{
				assertThat(node.getOutgoingLinks().size(), equalTo(1));
				for(Link link : node.getOutgoingLinks()){
					assertThat(link.getToNode().getName(), equalTo("Azores"));
				}
			}
		}

		// Check that each demand is right
		for(Demand demand : tinyNetwork.getDirectDemands()){

			if(demand.getName().equals("Fort Meade --> Lagos")){

				assertThat(demand + " has correct from node",
						demand.getFromNode(),
						equalTo(actualNodes.get("Fort Meade")));
				assertThat(demand + " has correct to node",
						demand.getToNode(),
						equalTo(actualNodes.get("Lagos")));

				Map<BigDecimal, Long> correctPoints = new HashMap<>();
				correctPoints.put(BigDecimal.ZERO, 1L);
				correctPoints.put((new BigDecimal(86400)).stripTrailingZeros(), 0L);

				assertThat(demand + " has correct profile",
						demand.getProfile().getPointMap(),
						equalTo(correctPoints));

			}else if(demand.getName().equals("Sao Paulo --> London")){

				assertThat(demand + " has correct from node",
						demand.getFromNode(),
						equalTo(actualNodes.get("Sao Paulo")));
				assertThat(demand + " has correct to node",
						demand.getToNode(),
						equalTo(actualNodes.get("London")));

				Map<BigDecimal, Long> correctPoints = new HashMap<>();
				correctPoints.put(BigDecimal.ZERO, 1L);
				correctPoints.put((new BigDecimal(86400)).stripTrailingZeros(), 0L);

				assertThat(demand + " has correct profile",
						demand.getProfile().getPointMap(),
						equalTo(correctPoints));


			}else{
				fail(demand + " has an invalid name; was expecting one of \"Fort Meade --> Lagos\" or \"Sao Paulo --> London\"");
			}

		}

		// Check that all nodes and subnets have the correct units
		for(Location obj : Stream.concat(tinyNetwork.getAllNodes().stream(), Collections.singleton(tinyNetwork).stream())
		        .collect(Collectors.toList())){
			assertThat("Checking that " + obj + " has valid location", obj.hasLocation(), equalTo(true));
			assertThat("Checking that " + obj + " is in degrees ", obj.inDegrees(), equalTo(true));
		}
	}

	@Test
	public void testGeoXML() throws Exception {
		// Open the network for reading (twice -- for the SAX and DOM parsers)
		Reader geoReaderSAX = new InputStreamReader(getClass().getResourceAsStream("/Geographic Example Network.xml"));
		InputStream geoStreamDOM = getClass().getResourceAsStream("/Geographic Example Network.xml");

		BasicSubnetBuilder geoNetworkBuilder = new BasicSubnetBuilder();

		parser.networkFromXML(geoReaderSAX, geoNetworkBuilder);

		geoReaderSAX.close();

		Subnet geoNetwork = geoNetworkBuilder.build();

		checkSubnetAgainstXML(geoNetwork, geoStreamDOM);

		geoStreamDOM.close();
	}

	@Test
	public void testLargeXML() throws Exception {
		// Open the network for reading (twice -- for the SAX and DOM parsers)
		Reader largeReaderSAX = new InputStreamReader(getClass().getResourceAsStream("/Geographic Example Network.xml"));
		InputStream largeStreamDOM = getClass().getResourceAsStream("/Geographic Example Network.xml");

		BasicSubnetBuilder largeNetworkBuilder = new BasicSubnetBuilder();

		parser.networkFromXML(largeReaderSAX, largeNetworkBuilder);

		largeReaderSAX.close();

		Subnet largeNetwork = largeNetworkBuilder.build();

		checkSubnetAgainstXML(largeNetwork, largeStreamDOM);

		largeStreamDOM.close();
	}

	private void checkSubnetAgainstXML(Subnet subnet, InputStream xml) throws Exception {
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

		dbf.setFeature("http://xml.org/sax/features/namespaces", false);
		dbf.setFeature("http://xml.org/sax/features/validation", false);
		dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false);
		dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

		DocumentBuilder dBuilder = dbf.newDocumentBuilder();
		Document dom = dBuilder.parse(xml);
		dom.normalize();

		checkSubnetAgainstElement(subnet, dom.getDocumentElement());
	}

	private void checkSubnetAgainstElement(Subnet subnet, Element element){
		// Check subnet attributes
		NamedNodeMap attributes = element.getAttributes();
		if(attributes.getNamedItem("name") == null){
			assertThat("Check " + subnet + " name", subnet.getName(), equalTo(null));
		} else {
			assertThat("Check " + subnet + " name", subnet.getName(), equalTo(attributes.getNamedItem("name").getNodeValue()));
		}

		// Check subnet child elements
		NodeList children = element.getChildNodes();

		// Sort elements by tag name
		Map<String, Element> childNodeElements = new HashMap<>();
		Map<String, Element> childLinkElements = new HashMap<>();
		Map<String, Element> childAttrElements = new HashMap<>();
		Map<String, Element> childDemandElements = new HashMap<>();
		Map<String, Element> childSubnetElements = new HashMap<>();
		for(int childIndex = 0; childIndex < children.getLength(); childIndex++){
			org.w3c.dom.Node childNode = children.item(childIndex);
			if(childNode.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE){
				Element child = (Element) childNode;
				if(child.getTagName().equals("node") && NodeNameCheck.nameOk(child.getAttribute("name"))){
					childNodeElements.put(child.getAttribute("name"), child);
				}

				if(child.getTagName().equals("link")){
					childLinkElements.put(child.getAttribute("name"), child);
				}

				if(child.getTagName().equals("attr") || child.getTagName().equals("characteristic")){
					childAttrElements.put(child.getAttribute("name"), child);
				}

				if(child.getTagName().equals("demand")){
					childDemandElements.put(child.getAttribute("name"), child);
				}

				if(child.getTagName().equals("subnet")){
					childSubnetElements.put(child.getAttribute("name"), child);
				}
			}
		}

		assertThat(subnet + " number of child nodes is correct", subnet.getDirectNodes(), hasSize(childNodeElements.size()));
		assertThat(subnet + " number of child demands is correct", subnet.getDirectDemands(), hasSize(childDemandElements.size()));
		assertThat(subnet + " number of child subnets is correct", subnet.getDirectSubnets(), hasSize(childSubnetElements.size()));

		if(childAttrElements.containsKey("x position")){
			assertThat(subnet + " lng", subnet.getLng(), closeTo(Double.parseDouble(childAttrElements.get("x position").getAttribute("value")), 1e-4));
		}

		if(childAttrElements.containsKey("y position")){
			assertThat(subnet + " lat", subnet.getLat(), closeTo(Double.parseDouble(childAttrElements.get("y position").getAttribute("value")), 1e-4));
		}

		if(childAttrElements.containsKey("units")){
			assertThat(subnet + " lat", subnet.inDegrees(), equalTo(childAttrElements.get("units").getAttribute("value").equals("Degrees")));
		}

		for(Node node : subnet.getDirectNodes()){
			assertThat(subnet + " child node " + node + " exists in document", childNodeElements.containsKey(node.getName()), equalTo(true));
			checkNodeAgainstElement(node, childNodeElements.get(node.getName()));
		}

		for(Demand demand : subnet.getDirectDemands()){
			assertThat(subnet + " child demand " + demand + " exists in document", childDemandElements, hasKey(demand.getName()));
			checkDemandAgainstElement(demand, childDemandElements.get(demand.getName()));
		}

		for(Link link : subnet.getDirectLinks()){
			assertThat(subnet + " child link " + link + " exists in document", childLinkElements.containsKey(link.getName()), equalTo(true));
			checkLinkAgainstElement(link, childLinkElements.get(link.getName()));
		}

		for(Subnet childSubnet : subnet.getDirectSubnets()){
			assertThat(subnet + " child subnet " + childSubnet + " exists in document",
					childSubnetElements.containsKey(childSubnet.getName()),
					equalTo(true));
			checkSubnetAgainstElement(childSubnet, childSubnetElements.get(childSubnet.getName()));
		}
	}

	private void checkNodeAgainstElement(Node node, Element element){
		NodeList childNodes = element.getChildNodes();
		Map<String, Element> childElements = new HashMap<>();

		for(int childNodeIndex = 0; childNodeIndex < childNodes.getLength(); childNodeIndex++){
			org.w3c.dom.Node childNode = childNodes.item(childNodeIndex);
			if(childNode.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE){
				Element childElement = (Element) childNode;
				if(childElement.hasAttribute("name")){
					childElements.put(childElement.getAttribute("name"), childElement);
				}
			}
		}

		assertThat("Checking " + node + " name",
				node.getName(),
				equalTo(element.getAttribute("name")));
		assertThat("Checking " + node + " model",
				node.getModel(),
				equalTo(element.getAttribute("model")));

		if(childElements.containsKey("x position")){
			assertThat("Checking " + node + " longitude",
					node.getLng(),
					closeTo(Double.parseDouble(childElements.get("x position").getAttribute("value")), 1e-4));
		}

		if(childElements.containsKey("y position")){
			assertThat("Checking " + node + " latitude",
					node.getLat(),
					closeTo(Double.parseDouble(childElements.get("y position").getAttribute("value")), 1e-4));
		}
	}

	private void checkLinkAgainstElement(Link link, Element element){

		NodeList childNodes = element.getChildNodes();
		Map<String, Element> childElements = new HashMap<>();

		for(int childNodeIndex = 0; childNodeIndex < childNodes.getLength(); childNodeIndex++){
			org.w3c.dom.Node childNode = childNodes.item(childNodeIndex);
			if(childNode.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE){
				Element childElement = (Element) childNode;
				if(childElement.hasAttribute("name")){
					childElements.put(childElement.getAttribute("name"), childElement);
				}
			}
		}

		assertThat("Check " + link + " name",
				link.getName(),
				equalTo(element.getAttribute("name")));

		assertThat("Check " + link + " model",
				link.getModel(),
				equalTo(element.getAttribute("model")));

		// Get fromNode info
		List<String> fromNodePath = new ArrayList<>(Arrays.asList(element.getAttribute("srcNode").split("\\.")));
		Collections.reverse(fromNodePath);
		String fromNodeName = fromNodePath.remove(0);

		// Get toNode info
		List<String> toNodePath = new ArrayList<>(Arrays.asList(element.getAttribute("destNode").split("\\.")));
		Collections.reverse(toNodePath);
		String toNodeName = toNodePath.remove(0);

		// Check if this link is reversed
		if(link.getFromNode().getName().equals(toNodeName) && link.getToNode().getName().equals(fromNodeName)){
			assertThat(link + " is reversed, but is not duplex", element.getAttribute("class"), equalTo("duplex"));
			List<String> pathHolder = fromNodePath;
			String nameHolder = fromNodeName;
			fromNodePath = toNodePath;
			fromNodeName = toNodeName;
			toNodePath = pathHolder;
			toNodeName = nameHolder;
		}

		// Check fromNode name
		assertThat(link + " fromNode name",
				link.getFromNode().getName(),
				equalTo(fromNodeName));

		// Check toNode name
		assertThat(link + " toNode name",
				link.getToNode().getName(),
				equalTo(toNodeName));

		// Check fromNode path
		Subnet currentSubnet = link.getFromNode().getParent();
		for(String subnetName : fromNodePath){
			assertThat(link + " fromNode path contains " + currentSubnet + " with name " + currentSubnet.getName(),
					currentSubnet.getName(),
					equalTo(subnetName));
			currentSubnet = currentSubnet.getParent();
		}

		// Check toNode path
		currentSubnet = link.getToNode().getParent();
		for(String subnetName : toNodePath){
			assertThat(link + " toNode path contains " + currentSubnet + " with name " + currentSubnet.getName(),
					currentSubnet.getName(),
					equalTo(subnetName));
			currentSubnet = currentSubnet.getParent();
		}
	}

	private void checkDemandAgainstElement(Demand demand, Element element){
		NodeList childNodes = element.getChildNodes();
		Map<String, Element> childElements = new HashMap<>();

		for(int childNodeIndex = 0; childNodeIndex < childNodes.getLength(); childNodeIndex++){
			org.w3c.dom.Node childNode = childNodes.item(childNodeIndex);
			if(childNode.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE){
				Element childElement = (Element) childNode;
				if(childElement.hasAttribute("name")){
					childElements.put(childElement.getAttribute("name"), childElement);
				}
			}
		}

		assertThat("Check " + demand + " name",
				demand.getName(),
				equalTo(element.getAttribute("name")));
		assertThat("Check " + demand + " model",
				demand.getModel(),
				equalTo(element.getAttribute("model")));

		// Get fromNode info
		List<String> fromNodePath = new ArrayList<>(Arrays.asList(element.getAttribute("srcNode").split("\\.")));
		Collections.reverse(fromNodePath);
		String fromNodeName = fromNodePath.remove(0);

		// Get toNode info
		List<String> toNodePath = new ArrayList<>(Arrays.asList(element.getAttribute("destNode").split("\\.")));
		Collections.reverse(toNodePath);
		String toNodeName = toNodePath.remove(0);

		// Check fromNode name
		assertThat("Check " + demand + " fromNode name",
				demand.getFromNode().getName(),
				equalTo(fromNodeName));

		// Check toNode name
		assertThat("Check " + demand + " toNode name",
				demand.getToNode().getName(),
				equalTo(toNodeName));

		// Check fromNode path
		Subnet currentSubnet = demand.getFromNode().getParent();
		for(String subnetName : fromNodePath){
			assertThat(demand + " fromNode path contains " + currentSubnet + " with name " + currentSubnet.getName(),
					currentSubnet.getName(),
					equalTo(subnetName));
			currentSubnet = currentSubnet.getParent();
		}

		// Check toNode path
		currentSubnet = demand.getToNode().getParent();
		for(String subnetName : toNodePath){
			assertThat(demand + " toNode path contains " + currentSubnet + " with name " + currentSubnet.getName(),
					currentSubnet.getName(),
					equalTo(subnetName));
			currentSubnet = currentSubnet.getParent();
		}

	}
}
