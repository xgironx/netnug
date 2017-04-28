package com.bah.vane.builders.opnet;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;
import org.xml.sax.Attributes;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.parsers.TrafficProfileLookup;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.StubAttributes;

public class BasicSubnetBuilderTest {

	private BasicSubnetBuilder emptyBuilder;
	private BasicSubnetBuilder testBuilder;

	private Collection<String> testNodeNames = new HashSet<>();
	private Collection<String> testSubnetNames = new HashSet<>();
	private Collection<String> testLinkNames = new HashSet<>();
	private Collection<String> testDemandNames = new HashSet<>();

	private Map<String, String> testLinkConnections = new HashMap<>();
	private Map<String, String> testDemandConnections = new HashMap<>();

	private Attributes mockEmptyAttrs;
	private Attributes mockAttrs;

	@Before
	public void setUp() throws Exception {

		final int nodeCount = 6;
		final int subnetCount = 3;

		for(int i = 0; i < nodeCount; i++){
			testNodeNames.add(String.format("Node %02d", i));
		}

		for(int i = 0; i < subnetCount; i++){
			testSubnetNames.add(String.format("Subnet %02d", i));
		}

		mockEmptyAttrs = new StubAttributes(new String[0], new String[0]);

		mockAttrs = new StubAttributes(new String[]{"name", "units", "x position", "y position"}, new String[]{"testsubnet", "Degrees", "123.456", "-045.000"});

		emptyBuilder = new BasicSubnetBuilder();

		testBuilder = new BasicSubnetBuilder();
		testBuilder.addAttr(mockAttrs);
		for(String nodeName : testNodeNames){
			testBuilder.addChild("node", new StubAttributes("name", nodeName));
		}

		for(String subnetName : testSubnetNames){
			OpnetObject childSubnet = testBuilder.addChild("subnet", new StubAttributes("name", subnetName));

			childSubnet.addChild("node", new StubAttributes("name", "descendantNode"));
		}

		Random r = new Random(1L);
		List<String> nodeNames = new ArrayList<>(testNodeNames);
		Collections.shuffle(nodeNames, r);
		for(int current = 0; current < nodeNames.size(); current++){
			int next = (current + 1) % nodeNames.size();

			testBuilder.addChild("link", new StubAttributes("name", nodeNames.get(current) + " -> " + nodeNames.get(next), "srcNode", nodeNames.get(current), "destNode", nodeNames.get(next)));
			testBuilder.addChild("link", new StubAttributes("name", nodeNames.get(next) + " -> " + nodeNames.get(current), "srcNode", nodeNames.get(next), "destNode", nodeNames.get(current)));

			testLinkNames.add(nodeNames.get(current) + " -> " + nodeNames.get(next));
			testLinkNames.add(nodeNames.get(next) + " -> " + nodeNames.get(current));

			testLinkConnections.put(nodeNames.get(current), nodeNames.get(next));
		}

		Collections.shuffle(nodeNames, r);
		for(int current = 0; current < nodeNames.size(); current++){
			int next = (current + 1) % nodeNames.size();

			testBuilder.addChild("demand", new StubAttributes("name", nodeNames.get(current) + " -> " + nodeNames.get(next), "srcNode", nodeNames.get(current), "destNode", nodeNames.get(next)));
			testBuilder.addChild("demand", new StubAttributes("name", nodeNames.get(next) + " -> " + nodeNames.get(current), "srcNode", nodeNames.get(next), "destNode", nodeNames.get(current)));

			testDemandNames.add(nodeNames.get(current) + " -> " + nodeNames.get(next));
			testDemandNames.add(nodeNames.get(next) + " -> " + nodeNames.get(current));

			testDemandConnections.put(nodeNames.get(current), nodeNames.get(next));
		}

	}

	@Test
	public void testAddAttrStrings() throws Exception {
		emptyBuilder.addAttr("name", "testsubnet");
		emptyBuilder.addAttr("units", "Degrees");
		emptyBuilder.addAttr("x position", "123.456");
		emptyBuilder.addAttr("y position", "-045.000");

		Subnet testSubnet = emptyBuilder.build();

		assertThat("Check testSubnet name", testSubnet.getName(), equalTo("testsubnet"));
		assertThat("Check testSubnet location OK", testSubnet.hasLocation(), equalTo(true));
		assertThat("Check testSubnet units", testSubnet.inDegrees(), equalTo(true));
		assertThat("Check testSubnet lng", testSubnet.getLng(), equalTo(123.456));
		assertThat("Check testSubnet lat", testSubnet.getLat(), closeTo(-45, 1e-6));
	}

	@Test
	public void testAddAttrAttributes() throws Exception {
		emptyBuilder.addAttr(mockAttrs);

		Subnet testSubnet = emptyBuilder.build();
		assertThat("Check testSubnet name", testSubnet.getName(), equalTo("testsubnet"));
		assertThat("Check testSubnet location OK", testSubnet.hasLocation(), equalTo(true));
		assertThat("Check testSubnet units", testSubnet.inDegrees(), equalTo(true));
		assertThat("Check testSubnet lng", testSubnet.getLng(), equalTo(123.456));
		assertThat("Check testSubnet lat", testSubnet.getLat(), closeTo(-45, 1e-6));
	}

	@Test
	public void testAddChild() throws Exception {
		emptyBuilder.addChild("node", mockEmptyAttrs);
		emptyBuilder.addChild("node", mockEmptyAttrs);

		emptyBuilder.addChild("link", mockEmptyAttrs);
		emptyBuilder.addChild("link", mockEmptyAttrs);

		emptyBuilder.addChild("subnet", mockEmptyAttrs);
		emptyBuilder.addChild("subnet", mockEmptyAttrs);

		emptyBuilder.addChild("demand", mockEmptyAttrs);
		emptyBuilder.addChild("demand", mockEmptyAttrs);

		emptyBuilder.addChild("profile", new StubAttributes("name", "Test profile 1"));
		emptyBuilder.addChild("profile", new StubAttributes("name", "Test profile 2"));

		Subnet testSubnet = emptyBuilder.build();

		assertThat("testSubnet has 2 nodes",
				testSubnet.getDirectNodes(),
				hasSize(2));

		assertThat("testSubnet has 2 links",
				testSubnet.getDirectLinks(),
				hasSize(2));

		assertThat("testSubnet has 2 subnets",
				testSubnet.getDirectSubnets(),
				hasSize(2));

		assertThat("testSubnet has 2 demands",
				testSubnet.getDirectDemands(),
				hasSize(2));

		assertThat("Test profile 1 was added to TrafficProfileLookup",
				TrafficProfileLookup.getProfile("Test profile 1"),
				not(equalTo(null)));

		assertThat("Test profile 2 was added to TrafficProfileLookup",
				TrafficProfileLookup.getProfile("Test profile 2"),
				not(equalTo(null)));
	}

	@Test
	public void testBuild() {
		Subnet testSubnet = testBuilder.build();

		checkStandardSubnet(testSubnet, null);
	}

	@Test
	public void testBuildAll() {
		Subnet mockSubnet = mock(Subnet.class);
		replay(mockSubnet);

		Collection<? extends Subnet> testSubnets = testBuilder.buildAll(mockSubnet);

		assertThat("buildAll returns size 1",
				testSubnets.size(),
				equalTo(1));

		Subnet testSubnet = testSubnets.toArray(new Subnet[1])[0];

		checkStandardSubnet(testSubnet, mockSubnet);
	}

	@Test
	public void testBuildSubnet() {
		Subnet mockSubnet = mock(Subnet.class);
		replay(mockSubnet);

		Subnet testSubnet = testBuilder.build(mockSubnet);

		checkStandardSubnet(testSubnet, mockSubnet);
	}

	@Test
	public void testFindChildNode() throws Exception {

		emptyBuilder.build();

		assertThat("Empty sequence gives null",
				emptyBuilder.findChildNode(Arrays.asList(new String[]{})),
				equalTo(null));

		assertThat("Unknown name gives null",
				emptyBuilder.findChildNode(Arrays.asList(new String[]{"asdf"})),
				equalTo(null));

		testBuilder.build();

		for(String nodeName : testNodeNames){
			assertThat(nodeName + " can be found",
					testBuilder.findChildNode(Arrays.asList(new String[]{nodeName})).getName(),
					equalTo(nodeName));
		}

		for(String subnetName : testSubnetNames){
			assertThat(subnetName + ".descendantNode can be found",
					testBuilder.findChildNode(Arrays.asList(new String[]{subnetName, "descendantNode"})).getName(),
					equalTo("descendantNode"));
		}
	}

	@Test
	public void testGetName() {
		assertThat("Testbuilder has a name",
				testBuilder.getName(),
				equalTo("testsubnet"));
	}

	@Test
	public void testSetName() {
		emptyBuilder.setName("foo");
		assertThat("emptyBuilder's name was set correctly to foo",
				emptyBuilder.getName(),
				equalTo("foo"));

		emptyBuilder.setName("bar");
		assertThat("emptyBuilder's name was reset correctly to bar",
				emptyBuilder.getName(),
				equalTo("bar"));
	}

	@Test
	public void testSetDescription() {
		emptyBuilder.setDescription("foo");
		Subnet testSubnet1 = emptyBuilder.build();
		assertThat("emptyBuilder's description was set correctly",
				testSubnet1.getDescription(),
				equalTo("foo"));

		emptyBuilder.setDescription("bar");
		Subnet testSubnet2 = emptyBuilder.build();
		assertThat("emptyBuilder's description was reset correctly",
				testSubnet2.getDescription(),
				equalTo("bar"));
	}

	private void checkStandardSubnet(Subnet testSubnet, Subnet correctParent){
		assertThat("Correct parent",
				testSubnet.getParent(),
				equalTo(correctParent));

		Set<String> actualNodeNames = new HashSet<>();
		for(Node node : testSubnet.getDirectNodes()) actualNodeNames.add(node.getName());

		Set<String> actualSubnetNames = new HashSet<>();
		for(Subnet sub : testSubnet.getDirectSubnets()) actualSubnetNames.add(sub.getName());

		Set<String> actualLinkNames = new HashSet<>();
		for(Link link : testSubnet.getDirectLinks()) actualLinkNames.add(link.getName());

		Set<String> actualDemandNames = new HashSet<>();
		for(Demand demand : testSubnet.getDirectDemands()) actualDemandNames.add(demand.getName());

		assertThat("Node names are correct",
				actualNodeNames,
				equalTo(testNodeNames));

		assertThat("Subnet names are correct",
				actualSubnetNames,
				equalTo(testSubnetNames));

		assertThat("Link names are correct",
				actualLinkNames,
				equalTo(testLinkNames));

		assertThat("Demand names are correct",
				actualDemandNames,
				equalTo(testDemandNames));

		for(Link link : testSubnet.getDirectLinks()) {
			assertThat(link + " node endpoints are correct",
					testLinkConnections.get(link.getFromNode().getName()).equals(link.getToNode().getName()) ||
					testLinkConnections.get(link.getToNode().getName()).equals(link.getFromNode().getName()),
					equalTo(true));
		}

		for(Demand demand : testSubnet.getDirectDemands()) {
			assertThat(demand + " node endpoints are correct",
					testDemandConnections.get(demand.getFromNode().getName()).equals(demand.getToNode().getName()) ||
					testDemandConnections.get(demand.getToNode().getName()).equals(demand.getFromNode().getName()),
					equalTo(true));
		}
	}
}
