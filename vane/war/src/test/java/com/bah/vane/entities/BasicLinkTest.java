package com.bah.vane.entities;

import static org.junit.Assert.*;

import java.lang.reflect.Field;

import javax.json.JsonObject;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;

import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Subnet;

public class BasicLinkTest {

	Subnet mockSubnet;

	Node mockNodeA;
	Node mockNodeB;

	BasicLink emptyLink;
	BasicLink testLink;

	@Before
	public void setUp() throws Exception {

		mockSubnet = mock(Subnet.class);
		replay(mockSubnet);

		mockNodeA = mock(Node.class);
		expect(mockNodeA.getId()).andStubReturn(1234);
		expect(mockNodeA.getName()).andStubReturn("mockNodeA");
		replay(mockNodeA);

		mockNodeB = mock(Node.class);
		expect(mockNodeB.getId()).andStubReturn(5678);
		expect(mockNodeB.getName()).andStubReturn("mockNodeB");
		replay(mockNodeB);

		emptyLink = new BasicLink();
		testLink = new BasicLink(mockSubnet, "testLink", "test model", mockNodeA, mockNodeB, false);

		Field linkId = BasicLink.class.getDeclaredField("id");
		linkId.setAccessible(true);
		linkId.set(testLink, 1);
	}

	@Test
	public void testGetId() {
		assertThat("emptyLink has no id",
				emptyLink.getId(),
				equalTo(null));
		assertThat("testLink has correct id",
				testLink.getId(),
				equalTo(1));
	}

	@Test
	public void testGetName() {
		assertThat("emptyLink has no name",
				emptyLink.getName(),
				equalTo(null));
		assertThat("testLink has correct name",
				testLink.getName(),
				equalTo("testLink"));
	}

	@Test
	public void testGetModel() {
		assertThat("empty link has no model",
				emptyLink.getModel(),
				equalTo(null));
		assertThat("test link has correct model",
				testLink.getModel(),
				equalTo("test model"));
	}

	@Test
	public void testGetParent() {
		assertThat("emptyLink has no parent",
				emptyLink.getParent(),
				equalTo(null));
		assertThat("testLink has correct parent",
				testLink.getParent(),
				equalTo(mockSubnet));
	}

	@Test
	public void testGetToNode() {
		assertThat("emptyLink has no to node",
				emptyLink.getToNode(),
				equalTo(null));
		assertThat("testLink has correct to node",
				testLink.getToNode(),
				equalTo(mockNodeB));
	}

	@Test
	public void testGetFromNode() {
		assertThat("emptyLink has no from node",
				emptyLink.getFromNode(),
				equalTo(null));
		assertThat("testLink has correct from node",
				testLink.getFromNode(),
				equalTo(mockNodeA));
	}

	@Test
	public void testToJson() {
		try{
			emptyLink.toJson();
			fail("emptyLink.toJson() should throw NullPointerException");
		}catch(NullPointerException e){}
		try{
			(new BasicLink(mockSubnet, "foo", "test model", null, mockNodeB, false)).toJson();
			fail("Link with no from node should throw NullPointerException");
		}catch(NullPointerException e){}
		try{
			(new BasicLink(mockSubnet, "foo", "test model", mockNodeA, null, false)).toJson();
			fail("Link with no to node should throw NullPointerException");
		}catch(NullPointerException e){}

		JsonObject linkJson = (JsonObject) testLink.toJson();

		assertThat("Json has correct ID",
				linkJson.getInt("id"),
				equalTo(testLink.getId()));
		assertThat("Json has correct from node",
				linkJson.getInt("fromNode"),
				equalTo(testLink.getFromNode().getId()));
		assertThat("Json has correct to node",
				linkJson.getInt("toNode"),
				equalTo(testLink.getToNode().getId()));
		assertThat("Json has correct name",
				linkJson.getString("name"),
				equalTo(testLink.getName()));
		assertThat("Json has correct model",
				linkJson.getString("model"),
				equalTo(testLink.getModel()));
	}

}
