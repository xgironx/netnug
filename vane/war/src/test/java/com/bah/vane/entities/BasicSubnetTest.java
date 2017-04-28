package com.bah.vane.entities;

import static org.junit.Assert.*;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonValue;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;

import com.bah.vane.interfaces.Analysis;
import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Subnet;

public class BasicSubnetTest {

	final int nodeCount = 10;
	final int linkCount = 10;
	final int demandCount = 10;
	final int subnetCount = 2;

	Subnet mockSubnet;

	Map<BasicNode, JsonValue> mockNodes = new HashMap<>();
	Map<BasicLink, JsonValue> mockLinks = new HashMap<>();
	Map<BasicDemand, JsonValue> mockDemands = new HashMap<>();
	Map<BasicSubnet, JsonValue> mockSubnets = new HashMap<>();
	Set<BasicNode> mockAllNodes = new HashSet<>();
	Set<BasicLink> mockAllLinks = new HashSet<>();
	Set<BasicDemand> mockAllDemands = new HashSet<>();

	BasicSubnet emptySubnet;
	BasicSubnet subnet;
	BasicSubnet subnetNoDeg;
	BasicSubnet subnetNoLoc;

	@Before
	public void setUp() throws Exception {

		mockSubnet = mock(Subnet.class);
		expect(mockSubnet.hasLocation()).andReturn(true);
		replay(mockSubnet);

		for(int i = 0; i < nodeCount; i++){
			JsonValue mockJson = mock(JsonValue.class);
			replay(mockJson);

			BasicNode mockNode = mock(BasicNode.class);
			expect(mockNode.getName()).andStubReturn(String.format("Node %02d", i));
			expect(mockNode.toJson()).andStubReturn(mockJson);
			replay(mockNode);

			mockNodes.put(mockNode, mockJson);
		}
		mockAllNodes.addAll(mockNodes.keySet());

		for(int i = 0; i < linkCount; i++){
			JsonValue mockJson = mock(JsonValue.class);
			replay(mockJson);

			BasicLink mockLink = mock(BasicLink.class);
			expect(mockLink.getName()).andStubReturn(String.format("Link %02d", i));
			expect(mockLink.toJson()).andStubReturn(mockJson);
			replay(mockLink);

			mockLinks.put(mockLink, mockJson);
		}
		mockAllLinks.addAll(mockLinks.keySet());

		for(int i = 0; i < demandCount; i++){
			JsonValue mockJson = mock(JsonValue.class);
			replay(mockJson);

			BasicDemand mockDemand = mock(BasicDemand.class);
			expect(mockDemand.getName()).andStubReturn(String.format("Demands %02d", i));
			expect(mockDemand.toJson()).andStubReturn(mockJson);
			replay(mockDemand);

			mockDemands.put(mockDemand, mockJson);
		}
		mockAllDemands.addAll(mockDemands.keySet());

		for(int i = 0; i < subnetCount; i++){
			JsonValue mockJson = mock(JsonValue.class);
			replay(mockJson);

			BasicSubnet mockChild = mock(BasicSubnet.class);
			expect(mockChild.getName()).andStubReturn(String.format("Subnet %02d", i));
			expect(mockChild.toJson()).andStubReturn(mockJson);

			Set<BasicNode> localNodeChildren = new HashSet<>();
			for(int j = 0; j < nodeCount; j++){
				BasicNode mockChildNode = mock(BasicNode.class);
				expect(mockChildNode.getName()).andStubReturn(String.format("Node %02d-%02d", i, j));
				replay(mockChildNode);
				localNodeChildren.add(mockChildNode);
			}
			mockAllNodes.addAll(localNodeChildren);

			Set<BasicLink> localLinkChildren = new HashSet<>();
			for(int j = 0; j < linkCount; j++){
				BasicLink mockChildLink = mock(BasicLink.class);
				expect(mockChildLink.getName()).andStubReturn(String.format("Link %02d-%02d", i, j));
				replay(mockChildLink);
				localLinkChildren.add(mockChildLink);
			}
			mockAllLinks.addAll(localLinkChildren);

			Set<BasicDemand> localDemandChildren = new HashSet<>();
			for(int j = 0; j < demandCount; j++){
				BasicDemand mockChildDemand = mock(BasicDemand.class);
				expect(mockChildDemand.getName()).andStubReturn(String.format("Demand %02d-%02d", i, j));
				replay(mockChildDemand);
				localDemandChildren.add(mockChildDemand);
			}
			mockAllDemands.addAll(localDemandChildren);

			mockChild.getAllNodes();
			expectLastCall().andStubReturn(localNodeChildren);
			mockChild.getAllLinks();
			expectLastCall().andStubReturn(localLinkChildren);
			mockChild.getAllDemands();
			expectLastCall().andStubReturn(localDemandChildren);

			replay(mockChild);

			mockSubnets.put(mockChild, mockJson);
		}

		emptySubnet = new BasicSubnet();
		subnet = new BasicSubnet(mockSubnet, "subnet", "subnetDesc", true, 123.456, 98.765);
		subnetNoDeg = new BasicSubnet(mockSubnet, "subnetNoDeg", "subnetNoDegDesc", false, 99999d, 99999d);
		subnetNoLoc = new BasicSubnet(mockSubnet, "subnetNoLoc", "subnetNoLocDesc", true, null, null);

		subnet.setNodes(mockNodes.keySet());
		subnet.setLinks(mockLinks.keySet());
		subnet.setDemands(mockDemands.keySet());
		subnet.setSubnets(mockSubnets.keySet());

		Field subnetId = BasicSubnet.class.getDeclaredField("id");
		subnetId.setAccessible(true);
		subnetId.set(subnet, 1);
		subnetId.set(subnetNoDeg, 2);
		subnetId.set(subnetNoLoc, 3);
	}

	@Test
	public void testGetId() {
		assertThat("emptySubnet has no id",
				emptySubnet.getId(),
				equalTo(null));
		assertThat("subnet has correct id",
				subnet.getId(),
				equalTo(1));
		assertThat("subnetNoDeg has correct id",
				subnetNoDeg.getId(),
				equalTo(2));
		assertThat("subnetNoLoc has correct id",
				subnetNoLoc.getId(),
				equalTo(3));
	}

	@Test
	public void testGetName() {
		assertThat("emptySubnet has no name",
				emptySubnet.getName(),
				equalTo(null));
		assertThat("subnet has correct name",
				subnet.getName(),
				equalTo("subnet"));
		assertThat("subnetNoDeg has correct name",
				subnetNoDeg.getName(),
				equalTo("subnetNoDeg"));
		assertThat("subnetNoLoc has correct name",
				subnetNoLoc.getName(),
				equalTo("subnetNoLoc"));
	}

	@Test
	public void testGetParent() {
		assertThat("emptySubnet has no parent",
				emptySubnet.getParent(),
				equalTo(null));
		assertThat("subnet has correct parent",
				subnet.getParent(),
				equalTo(mockSubnet));
		assertThat("subnetNoDeg has correct parent",
				subnetNoDeg.getParent(),
				equalTo(mockSubnet));
		assertThat("subnetNoLoc has correct parent",
				subnetNoLoc.getParent(),
				equalTo(mockSubnet));
	}

	@Test
	public void testHasLocation() {
		assertThat("emptySubnet has no location",
				emptySubnet.hasLocation(),
				equalTo(false));
		assertThat("subnet has a location",
				subnet.hasLocation(),
				equalTo(true));
		assertThat("subnetNoDeg has a location",
				subnetNoDeg.hasLocation(),
				equalTo(true));
		assertThat("subnetNoLoc has no location",
				subnetNoLoc.hasLocation(),
				equalTo(false));
	}

	@Test
	public void testInDegrees() {
		assertThat("emptySubnet is not in degrees",
				emptySubnet.inDegrees(),
				equalTo(false));
		assertThat("subnet has is in degrees",
				subnet.inDegrees(),
				equalTo(true));
		assertThat("subnetNoDeg is not in degrees",
				subnetNoDeg.inDegrees(),
				equalTo(false));
		assertThat("subnetNoLoc is not in degrees",
				subnetNoLoc.inDegrees(),
				equalTo(false));
	}

	@Test
	public void testGetLat() {
		assertThat("emptySubnet has no latitude",
				emptySubnet.getLat(),
				equalTo(null));
		assertThat("subnet has correct latitude",
				subnet.getLat(),
				equalTo(123.456));
		assertThat("subnetNoDeg has correct latitude",
				subnetNoDeg.getLat(),
				equalTo(99999d));
		assertThat("subnetNoLoc has correct latitude",
				subnetNoLoc.getLat(),
				equalTo(null));
	}

	@Test
	public void testGetLng() {
		assertThat("emptySubnet has no longitude",
				emptySubnet.getLng(),
				equalTo(null));
		assertThat("subnet has correct longitude",
				subnet.getLng(),
				equalTo(98.765));
		assertThat("subnetNoDeg has correct longitude",
				subnetNoDeg.getLng(),
				equalTo(99999d));
		assertThat("subnetNoLoc has correct longitude",
				subnetNoLoc.getLng(),
				equalTo(null));
	}

	@Test
	public void testGetDirectNodes() {
		Set<? extends Node> emptyNodes = emptySubnet.getDirectNodes();
		assertThat("emptySubnet.getDirectNodes is empty",
				emptyNodes,
				hasSize(0));

		Set<? extends Node> nodes = subnet.getDirectNodes();
		assertThat("subnet.getDirectNodes has the correct items",
				nodes,
				equalTo(mockNodes.keySet()));

		checkImmutable(nodes);
	}

	@Test
	public void testGetDirectLinks() {
		Set<? extends Link> emptyLinks = emptySubnet.getDirectLinks();
		assertThat("emptySubnet.getDirectLinks is empty",
				emptyLinks,
				hasSize(0));

		Set<? extends Link> links = subnet.getDirectLinks();
		assertThat("subnet.getDirectLinks has the correct items",
				links,
				equalTo(mockLinks.keySet()));

		checkImmutable(links);
	}

	@Test
	public void testGetDirectDemands() {
		Set<? extends Demand> emptyDemands = emptySubnet.getDirectDemands();
		assertThat("emptySubnet.getDirectDemands is empty",
				emptyDemands,
				hasSize(0));

		Set<? extends Demand> demands = subnet.getDirectDemands();
		assertThat("subnet.getDirectDemands has the correct items",
				demands,
				equalTo(mockDemands.keySet()));

		checkImmutable(demands);
	}

	@Test
	public void testGetSubnets() {
		Set<? extends Subnet> emptySubnets = emptySubnet.getDirectSubnets();
		assertThat("emptySubnet.getDirectSubnets is empty",
				emptySubnets,
				hasSize(0));

		Set<? extends Subnet> subnets = subnet.getDirectSubnets();
		assertThat("subnet.getDirectSubnets has the correct items",
				subnets,
				equalTo(mockSubnets.keySet()));

		checkImmutable(subnets);
	}

	@Test
	public void testGetAllNodes() {
		assertThat("emptySubnet.getAllNodes() returns empty",
				emptySubnet.getAllNodes(),
				hasSize(0));

		Set<? extends Node> allNodes = subnet.getAllNodes();
		assertThat("subnet.getAllNodes() returns correctly",
				allNodes,
				equalTo(mockAllNodes));

		checkImmutable(allNodes);
	}

	@Test
	public void testGetAllLinks() {
		assertThat("emptySubnet.getAllLinks() returns empty",
				emptySubnet.getAllLinks(),
				hasSize(0));

		Set<? extends Link> allLinks = subnet.getAllLinks();
		assertThat("subnet.getAllLinks() returns correctly",
				allLinks,
				equalTo(mockAllLinks));

		checkImmutable(allLinks);
	}

	@Test
	public void testGetAllDemands() {
		assertThat("emptySubnet.getAllDemands() returns empty",
				emptySubnet.getAllDemands(),
				hasSize(0));

		Set<? extends Demand> allDemands = subnet.getAllDemands();
		assertThat("subnet.getAllDemands() returns correctly",
				allDemands,
				equalTo(mockAllDemands));

		checkImmutable(allDemands);
	}

	@Test
	public void testSetSubnets() {
		Set<BasicSubnet> newSubnets = new HashSet<>();
		for(int i = 0; i < subnetCount; i++){
			BasicSubnet sub = mock(BasicSubnet.class);
			replay(sub);
			newSubnets.add(sub);
		}

		emptySubnet.setSubnets(newSubnets);

		checkImmutable(emptySubnet.getDirectSubnets());

		assertThat("emptySubnet had its children set correctly",
				emptySubnet.getDirectSubnets(),
				equalTo(newSubnets));

		subnet.setSubnets(newSubnets);

		checkImmutable(subnet.getDirectSubnets());

		assertThat("subnet has its child subnets set correctly",
				subnet.getDirectSubnets(),
				equalTo(newSubnets));
	}

	@Test
	public void testSetNodes() {
		Set<BasicNode> newNodes = new HashSet<>();
		for(int i = 0; i < subnetCount; i++){
			BasicNode sub = mock(BasicNode.class);
			replay(sub);
			newNodes.add(sub);
		}

		emptySubnet.setNodes(newNodes);

		checkImmutable(emptySubnet.getDirectNodes());

		assertThat("emptyNode had its children set correctly",
				emptySubnet.getDirectNodes(),
				equalTo(newNodes));

		subnet.setNodes(newNodes);

		checkImmutable(subnet.getDirectNodes());

		assertThat("subnet has its children set correctly",
				subnet.getDirectNodes(),
				equalTo(newNodes));
	}

	@Test
	public void testSetLinks() {
		Set<BasicLink> newLinks = new HashSet<>();
		for(int i = 0; i < subnetCount; i++){
			BasicLink sub = mock(BasicLink.class);
			replay(sub);
			newLinks.add(sub);
		}

		emptySubnet.setLinks(newLinks);

		checkImmutable(emptySubnet.getDirectLinks());

		assertThat("emptyLink had its links set correctly",
				emptySubnet.getDirectLinks(),
				equalTo(newLinks));

		subnet.setLinks(newLinks);

		checkImmutable(subnet.getDirectLinks());

		assertThat("subnet has its links set correctly",
				subnet.getDirectLinks(),
				equalTo(newLinks));
	}

	@Test
	public void testSetDemands() {
		Set<BasicDemand> newDemands = new HashSet<>();
		for(int i = 0; i < subnetCount; i++){
			BasicDemand sub = mock(BasicDemand.class);
			replay(sub);
			newDemands.add(sub);
		}

		emptySubnet.setDemands(newDemands);

		checkImmutable(emptySubnet.getDirectDemands());

		assertThat("emptyLink had its demands set correctly",
				emptySubnet.getDirectDemands(),
				equalTo(newDemands));

		subnet.setDemands(newDemands);

		checkImmutable(subnet.getDirectDemands());

		assertThat("subnet has its demands set correctly",
				subnet.getDirectDemands(),
				equalTo(newDemands));
	}

	@Test
	public void testSetDescription() {
		assertThat("emptySubnet has no description",
				emptySubnet.getDescription(),
				equalTo(null));

		emptySubnet.setDescription("Test empty subnet description");

		assertThat("emptySubnet description was set",
				emptySubnet.getDescription(),
				equalTo("Test empty subnet description"));

		emptySubnet.setDescription("New empty subnet description");

		assertThat("emptySubnet description was updated",
				emptySubnet.getDescription(),
				equalTo("New empty subnet description"));

	}

	@Test
	public void testGetDescription() {
		assertThat("emptySubnet has no description",
				emptySubnet.getDescription(),
				equalTo(null));
		assertThat("subnet has correct description",
				subnet.getDescription(),
				equalTo("subnetDesc"));
		assertThat("subnetNoDeg has correct description",
				subnetNoDeg.getDescription(),
				equalTo("subnetNoDegDesc"));
		assertThat("subnetNoLoc has correct description",
				subnetNoLoc.getDescription(),
				equalTo("subnetNoLocDesc"));
	}

	@Test
	public void testToJson() {
		try{
			emptySubnet.toJson();
			fail("emptySubnet.toJson() should throw a NullPointerException because it has no ID");
		}catch(NullPointerException e){}

		JsonObject json = (JsonObject)subnet.toJson();

		assertThat("subnet json has correct id",
				json.getInt("id"),
				equalTo(1));
		assertThat("subnet json has correct lat",
				json.getJsonNumber("lat").doubleValue(),
				equalTo(subnet.getLat()));
		assertThat("subnet json has correct lng",
				json.getJsonNumber("lng").doubleValue(),
				equalTo(subnet.getLng()));
		assertThat("subnet json has correct degrees flag",
				json.getBoolean("inDegrees"),
				equalTo(subnet.inDegrees()));

		JsonArray nodes = json.getJsonArray("nodes");
		assertThat("nodes array is correct size",
				nodes.size(),
				equalTo(mockNodes.size()));
		for(JsonValue node : nodes){
			assertThat("mockNodes contains each item in json nodes array",
					node,
					isIn(mockNodes.values()));
		}

		JsonArray links = json.getJsonArray("links");
		assertThat("links array is correct size",
				links.size(),
				equalTo(mockLinks.size()));
		for(JsonValue link : links){
			assertThat("mockLinks contains each item in json links array",
					link,
					isIn(mockLinks.values()));
		}

		JsonArray subnets = json.getJsonArray("subnets");
		assertThat("subnets array is correct size",
				subnets.size(),
				equalTo(mockSubnets.size()));
		for(JsonValue subnet : subnets){
			assertThat("mockSubnets contains each item in json subnets array",
					subnet,
					isIn(mockSubnets.values()));
		}
	}

	private void checkImmutable(Collection<?> collection){

		try{
			collection.add(null);
			fail("collection should be immutable, but add() worked");
		} catch(UnsupportedOperationException e){}

		try{
			collection.remove(null);
			fail("collection should be immutable, but remove() worked");
		} catch(UnsupportedOperationException e){}

		try{
			collection.clear();
			fail("collection should be immutable, but clear() worked");
		} catch(UnsupportedOperationException e){}

	}

}
