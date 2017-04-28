package com.bah.vane.entities;

import static org.junit.Assert.*;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Set;

import javax.json.JsonObject;
import javax.json.JsonValue;

import static org.easymock.EasyMock.*;
import static org.hamcrest.Matchers.*;

import org.junit.Before;
import org.junit.Test;

import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Subnet;

public class BasicNodeTest {

	Subnet mockSubnet;
	Subnet mockNonDegreeSubnet;
	Subnet mockNonLocatedSubnet;

	Link[] mockLinks;

	BasicNode emptyNode;
	BasicNode testNode;
	BasicNode nonDegreeNode;
	BasicNode noLocationNode;
	BasicNode noParentLocationNode;

	@Before
	public void setUp() throws Exception {

		mockSubnet = mock(Subnet.class);
		expect(mockSubnet.inDegrees()).andStubReturn(true);
		expect(mockSubnet.hasLocation()).andStubReturn(true);
		replay(mockSubnet);

		mockNonDegreeSubnet = mock(Subnet.class);
		expect(mockNonDegreeSubnet.inDegrees()).andStubReturn(false);
		expect(mockNonDegreeSubnet.hasLocation()).andStubReturn(true);
		replay(mockNonDegreeSubnet);

		mockNonLocatedSubnet = mock(Subnet.class);
		expect(mockNonLocatedSubnet.hasLocation()).andStubReturn(false);
		replay(mockNonLocatedSubnet);

		int linkCount = 20;
		mockLinks = new Link[20];
		for(int i = 0; i < linkCount; i++){
			mockLinks[i] = mock(Link.class);
			replay(mockLinks[i]);
		}

		emptyNode = new BasicNode();
		testNode = new BasicNode(mockSubnet, "testNode", "test type", 123.456, 98.765);
		nonDegreeNode = new BasicNode(mockNonDegreeSubnet, "nonDegreeNode", "test type", 99999d, 99999d);
		noLocationNode = new BasicNode(mockSubnet, "noLocationNode", "test type", null, null);
		noParentLocationNode = new BasicNode(mockNonLocatedSubnet, "noParentLocationNode", "test type", 123.456, 98.765);

		Field basicNodeIdField = BasicNode.class.getDeclaredField("id");
		basicNodeIdField.setAccessible(true);
		basicNodeIdField.set(testNode, 1);
		basicNodeIdField.set(nonDegreeNode, 2);
		basicNodeIdField.set(noLocationNode, 3);
		basicNodeIdField.set(noParentLocationNode, 4);
	}

	@Test
	public void testBasicNode() {
		assertThat("Default constructor has no parent",
				emptyNode.getParent(),
				equalTo(null));

		assertThat("Default constructor has no location",
				emptyNode.hasLocation(),
				equalTo(false));

		assertThat("Default constructor has no name",
				emptyNode.getName(),
				equalTo(null));

		assertThat("Default constructor has no outgoing links",
				emptyNode.getOutgoingLinks().size(),
				equalTo(0));

		assertThat("Default constructor has no incoming links",
				emptyNode.getIncomingLinks().size(),
				equalTo(0));
	}

	@Test
	public void testGetId() {
		assertThat("emptyNode has no id",
				emptyNode.getId(),
				equalTo(null));

		assertThat("testNode has no id",
				testNode.getId(),
				equalTo(1));

		assertThat("nonDegreeNode has no id",
				nonDegreeNode.getId(),
				equalTo(2));

		assertThat("noLocationNode has no id",
				noLocationNode.getId(),
				equalTo(3));

		assertThat("noParentLocationNode has no id",
				noParentLocationNode.getId(),
				equalTo(4));
	}

	@Test
	public void testGetName() {
		assertThat("emptyNode has correct name",
				emptyNode.getName(),
				equalTo(null));

		assertThat("testNode has correct name",
				testNode.getName(),
				equalTo("testNode"));

		assertThat("nonDegreeNode has correct name",
				nonDegreeNode.getName(),
				equalTo("nonDegreeNode"));

		assertThat("noLocationNode has correct name",
				noLocationNode.getName(),
				equalTo("noLocationNode"));

		assertThat("noParentLocationNode has correct name",
				noParentLocationNode.getName(),
				equalTo("noParentLocationNode"));

	}

	@Test
	public void testGetParent() {
		assertThat("emptyNode has no parent",
				emptyNode.getParent(),
				equalTo(null));

		assertThat("testNode has correct parent",
				testNode.getParent(),
				equalTo(mockSubnet));

		assertThat("nonDegreeNode has correct parent",
				nonDegreeNode.getParent(),
				equalTo(mockNonDegreeSubnet));

		assertThat("noLocationNode has correct parent",
				noLocationNode.getParent(),
				equalTo(mockSubnet));

		assertThat("noParentLocationNode has correct parent",
				noParentLocationNode.getParent(),
				equalTo(mockNonLocatedSubnet));
	}

	@Test
	public void testHasLocation() {
		assertThat("emptyNode has no location",
				emptyNode.hasLocation(),
				equalTo(false));

		assertThat("noLocationNode has no location",
				noLocationNode.hasLocation(),
				equalTo(false));

		assertThat("noParentLocationNode has no location",
				noParentLocationNode.hasLocation(),
				equalTo(false));

		assertThat("testNode has a location",
				testNode.hasLocation(),
				equalTo(true));

		assertThat("nonDegreeNode has a location",
				nonDegreeNode.hasLocation(),
				equalTo(true));
	}

	@Test
	public void testInDegrees() {
		assertThat("emptyNode is not in degrees",
				emptyNode.inDegrees(),
				equalTo(false));

		assertThat("noLocationNode is not in degrees",
				noLocationNode.inDegrees(),
				equalTo(false));

		assertThat("noParentLocationNode is not in degrees",
				noParentLocationNode.inDegrees(),
				equalTo(false));

		assertThat("testNode is in degrees",
				testNode.inDegrees(),
				equalTo(true));

		assertThat("nonDegreeNode is not in degrees",
				nonDegreeNode.inDegrees(),
				equalTo(false));
	}

	@Test
	public void testGetLat() {
		assertThat("emptyNode latitude is correct",
				emptyNode.getLat(),
				equalTo(null));

		assertThat("noLocationNode latitude is correct",
				noLocationNode.getLat(),
				equalTo(null));

		assertThat("noParentLocationNode latitude is correct",
				noParentLocationNode.getLat(),
				equalTo(null));

		assertThat("testNode latitude is correct",
				testNode.getLat(),
				closeTo(123.456, 1e-6));

		assertThat("nonDegreeNode latitude is correct",
				nonDegreeNode.getLat(),
				closeTo(99999d, 1e-6));

	}

	@Test
	public void testGetLng() {
		assertThat("emptyNode longitude is correct",
				emptyNode.getLng(),
				equalTo(null));

		assertThat("noLocationNode longitude is correct",
				noLocationNode.getLng(),
				equalTo(null));

		assertThat("noParentLocationNode longitude is correct",
				noParentLocationNode.getLng(),
				equalTo(null));

		assertThat("testNode longitude is correct",
				testNode.getLng(),
				closeTo(98.765, 1e-6));

		assertThat("nonDegreeNode longitude is correct",
				nonDegreeNode.getLng(),
				closeTo(99999d, 1e-6));
	}

	@Test
	public void testAddGetOutgoingLinks() {
		Set<Link> emptyNodeLinks = emptyNode.getOutgoingLinks();

		assertThat("emptyNode has no outgoing links",
				emptyNodeLinks.size(),
				equalTo(0));

		try{
			emptyNodeLinks.add(mockLinks[0]);
			fail("outgoingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		try{
			emptyNodeLinks.addAll(new ArrayList<Link>());
			fail("outgoingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		try{
			emptyNodeLinks.remove(mockLinks[0]);
			fail("outgoingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		try{
			emptyNodeLinks.clear();
			fail("outgoingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		for(int i = 0; i < mockLinks.length; i++){
			emptyNode.addOutgoing(mockLinks[i]);
			emptyNodeLinks = emptyNode.getOutgoingLinks();

			assertThat("After adding mockLinks[" + i + "], size of mockLinks should be " + (i + 1),
					emptyNodeLinks.size(),
					equalTo(i + 1));

			for(int j = 0; j < mockLinks.length; j++){
				if(j <= i){
					assertThat("After adding mockLinks[" + i + "] outgoingLinks should contain mockLinks[" + j + "]",
							emptyNodeLinks.contains(mockLinks[j]),
							equalTo(true));
				}else{
					assertThat("After adding mockLinks[" + i + "] outgoingLinks should not contain mockLinks[" + j + "]",
							emptyNodeLinks.contains(mockLinks[j]),
							equalTo(false));
				}
			}
		}
	}

	@Test
	public void testAddGetIncomingLinks() {
		Set<Link> emptyNodeLinks = emptyNode.getIncomingLinks();

		assertThat("emptyNode has no incoming links",
				emptyNodeLinks.size(),
				equalTo(0));

		try{
			emptyNodeLinks.add(mockLinks[0]);
			fail("incomingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		try{
			emptyNodeLinks.addAll(new ArrayList<Link>());
			fail("incomingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		try{
			emptyNodeLinks.remove(mockLinks[0]);
			fail("incomingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		try{
			emptyNodeLinks.clear();
			fail("incomingLinks should return immutable");
		}catch(UnsupportedOperationException e){}

		for(int i = 0; i < mockLinks.length; i++){
			emptyNode.addIncoming(mockLinks[i]);
			emptyNodeLinks = emptyNode.getIncomingLinks();

			assertThat("After adding mockLinks[" + i + "], size of mockLinks should be " + (i + 1),
					emptyNodeLinks.size(),
					equalTo(i + 1));

			for(int j = 0; j < mockLinks.length; j++){
				if(j <= i){
					assertThat("After adding mockLinks[" + i + "] incomingLinks should contain mockLinks[" + j + "]",
							emptyNodeLinks.contains(mockLinks[j]),
							equalTo(true));
				}else{
					assertThat("After adding mockLinks[" + i + "] incomingLinks should not contain mockLinks[" + j + "]",
							emptyNodeLinks.contains(mockLinks[j]),
							equalTo(false));
				}
			}
		}
	}

	@Test
	public void testToJson() {
		try{
			JsonValue result = emptyNode.toJson();
			fail("When ID is not set, toJson() should throw a NullPointerException, but instead returned " + result);
		}catch(NullPointerException e){}

		JsonObject testJson = (JsonObject)testNode.toJson();
		assertThat("testJson id is correct",
				testJson.getInt("id"),
				equalTo(testNode.getId()));
		assertThat("testJson name is correct",
				testJson.getString("name"),
				equalTo(testNode.getName()));
		assertThat("testJson lat is correct",
				testJson.getJsonNumber("lat").doubleValue(),
				closeTo(testNode.getLat(), 1e-6));
		assertThat("testJson lng is correct",
				testJson.getJsonNumber("lng").doubleValue(),
				closeTo(testNode.getLng(), 1e-6));
		assertThat("testJson inDegrees is correct",
				testJson.getBoolean("inDegrees"),
				equalTo(testNode.inDegrees()));

		JsonObject nonDegreeJson = (JsonObject)nonDegreeNode.toJson();
		assertThat("nonDegreeJson id is correct",
				nonDegreeJson.getInt("id"),
				equalTo(nonDegreeNode.getId()));
		assertThat("nonDegreeJson name is correct",
				nonDegreeJson.getString("name"),
				equalTo(nonDegreeNode.getName()));
		assertThat("nonDegreeJson lat is correct",
				nonDegreeJson.getJsonNumber("lat").doubleValue(),
				closeTo(nonDegreeNode.getLat(), 1e-6));
		assertThat("nonDegreeJson lng is correct",
				nonDegreeJson.getJsonNumber("lng").doubleValue(),
				closeTo(nonDegreeNode.getLng(), 1e-6));
		assertThat("nonDegreeJson inDegrees is correct",
				nonDegreeJson.getBoolean("inDegrees"),
				equalTo(nonDegreeNode.inDegrees()));

		JsonObject noLocationJson = (JsonObject)noLocationNode.toJson();
		assertThat("noLocationJson id is correct",
				noLocationJson.getInt("id"),
				equalTo(noLocationNode.getId()));
		assertThat("noLocationJson name is correct",
				noLocationJson.getString("name"),
				equalTo(noLocationNode.getName()));
		assertThat("noLocationJson lat is correct",
				noLocationJson.getJsonNumber("lat"),
				equalTo(noLocationNode.getLat()));
		assertThat("noLocationJson lng is correct",
				noLocationJson.getJsonNumber("lng"),
				equalTo(noLocationNode.getLng()));
		assertThat("noLocationJson inDegrees is correct",
				noLocationJson.get("inDegrees"),
				equalTo(null));

		JsonObject noParentLocationJson = (JsonObject)noParentLocationNode.toJson();
		assertThat("noParentLocationJson id is correct",
				noParentLocationJson.getInt("id"),
				equalTo(noParentLocationNode.getId()));
		assertThat("noParentLocationJson name is correct",
				noParentLocationJson.getString("name"),
				equalTo(noParentLocationNode.getName()));
		assertThat("noParentLocationJson lat is correct",
				noParentLocationJson.getJsonNumber("lat"),
				equalTo(noParentLocationNode.getLat()));
		assertThat("noParentLocationJson lng is correct",
				noParentLocationJson.getJsonNumber("lng"),
				equalTo(noParentLocationNode.getLng()));
		assertThat("noParentLocationJson inDegrees is correct",
				noParentLocationJson.get("inDegrees"),
				equalTo(null));
	}

}
