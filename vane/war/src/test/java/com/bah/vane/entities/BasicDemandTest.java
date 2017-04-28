package com.bah.vane.entities;

import static org.junit.Assert.*;

import java.lang.reflect.Field;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import javax.json.JsonObject;
import javax.json.JsonValue;

import org.junit.Before;
import org.junit.Test;

import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

public class BasicDemandTest {

	BasicDemand empty;
	BasicDemand demand;

	Node stubNodeA;
	Node stubNodeB;

	Profile stubProfile;
	JsonValue stubProfileJson;

	Subnet stubSubnet;

	@Before
	public void setUp() throws Exception {
		stubNodeA = mock(Node.class);
		expect(stubNodeA.getId()).andStubReturn(1);
		expect(stubNodeA.getName()).andStubReturn("stubNodeA");
		replay(stubNodeA);

		stubNodeB = mock(Node.class);
		expect(stubNodeB.getId()).andStubReturn(2);
		expect(stubNodeB.getName()).andStubReturn("stubNodeB");
		replay(stubNodeB);

		stubProfileJson = mock(JsonValue.class);
		replay(stubProfileJson);

		stubProfile = mock(Profile.class);
		expect(stubProfile.toJson()).andStubReturn(stubProfileJson);
		replay(stubProfile);

		stubSubnet = mock(Subnet.class);
		replay(stubSubnet);

		empty = new BasicDemand();
		demand = new BasicDemand(stubSubnet, "test demand", "test model", stubNodeA, stubNodeB, stubProfile);

		Field demandId = demand.getClass().getDeclaredField("id");
		demandId.setAccessible(true);
		demandId.set(demand, 16);
	}

	@Test
	public void testGetToNode() {
		assertThat("Empty demand has no to node",
				empty.getToNode(),
				equalTo(null));
		assertThat("Test demand has correct to node",
				demand.getToNode(),
				equalTo(stubNodeB));
	}

	@Test
	public void testGetFromNode() {
		assertThat("Empty demand has no from node",
				empty.getFromNode(),
				equalTo(null));
		assertThat("Test demand has correct from node",
				demand.getFromNode(),
				equalTo(stubNodeA));
	}

	@Test
	public void testGetId() {
		assertThat("Empty demand has no id",
				empty.getId(),
				equalTo(null));
		assertThat("Test demand has correct id",
				demand.getId(),
				equalTo(16));
	}

	@Test
	public void testGetModel() {
		assertThat("Empty demand has no model",
				empty.getModel(),
				equalTo(null));
		assertThat("Test demand has correct model",
				demand.getModel(),
				equalTo("test model"));
	}

	@Test
	public void testGetName() {
		assertThat("Empty demand has no name",
				empty.getName(),
				equalTo(null));
		assertThat("Test demand has correct name",
				demand.getName(),
				equalTo("test demand"));
	}

	@Test
	public void testGetParent() {
		assertThat("Empty demand has no parent",
				empty.getParent(),
				equalTo(null));
		assertThat("Test demand has correct parent",
				demand.getParent(),
				equalTo(stubSubnet));
	}

	@Test
	public void testToJson() throws Exception {

		JsonValue jsonVal = demand.toJson();

		assertThat("Demands produce a JSON object",
				jsonVal,
				instanceOf(JsonObject.class));

		JsonObject json = (JsonObject)jsonVal;

		assertThat("Demands produce a JSON object of the correct size",
				json.size(),
				equalTo(8));

		assertThat("Demand JSON objects have a name key",
				json,
				hasKey("name"));

		assertThat("Demand JSON objects have a fromNode key",
				json,
				hasKey("fromNode"));

		assertThat("Demand JSON objects have a toNode key",
				json,
				hasKey("toNode"));

		assertThat("Demand JSON objects have a id key",
				json,
				hasKey("id"));

		assertThat("Demand JSON objects have a traffic key",
				json,
				hasKey("traffic"));

		String name = json.getString("name");
		int fromNode = json.getInt("fromNode");
		int toNode = json.getInt("toNode");
		int id = json.getInt("id");
		JsonValue traffic = json.get("traffic");

		assertThat("Demand JSON objects have correct name value",
				name,
				equalTo("test demand"));

		assertThat("Demand JSON objects have correct fromNode value",
				fromNode,
				equalTo(1));

		assertThat("Demand JSON objects have correct toNode value",
				toNode,
				equalTo(2));

		assertThat("Demand JSON objects have correct id value",
				id,
				equalTo(16));

		assertThat("Demand JSON objects have correct traffic value",
				traffic,
				equalTo(stubProfileJson));

		Field demandId = demand.getClass().getDeclaredField("id");

		BasicDemand noId = new BasicDemand(stubSubnet, "test demand", "test model", stubNodeA, stubNodeB, stubProfile);
		BasicDemand noName = new BasicDemand(stubSubnet, null, "test model", stubNodeA, stubNodeB, stubProfile);
		demandId.set(noName, 10);
		BasicDemand noModel = new BasicDemand(stubSubnet, "test demand", null, stubNodeA, stubNodeB, stubProfile);
		demandId.set(noModel, 15);
		BasicDemand noParent = new BasicDemand(null, "test demand", "test model", stubNodeA, stubNodeB, stubProfile);
		demandId.set(noParent, 20);
		BasicDemand noFrom = new BasicDemand(stubSubnet, "test demand", "test model", null, stubNodeB, stubProfile);
		demandId.set(noFrom, 30);
		BasicDemand noTo = new BasicDemand(stubSubnet, "test demand", "test model", stubNodeA, null, stubProfile);
		demandId.set(noTo, 40);
		BasicDemand noProfile = new BasicDemand(stubSubnet, "test demand", "test model", stubNodeA, stubNodeB, null);
		demandId.set(noProfile, 50);

		try{
			empty.toJson();
			fail("toJson() should fail for demands with no ID");
		}catch(NullPointerException e){}

		try{
			noId.toJson();
			fail("toJson() should fail for demands with no ID");
		}catch(NullPointerException e){}

		try{
			noFrom.toJson();
			fail("toJson() should fail for demands with no from node");
		}catch(NullPointerException e){}

		try{
			noTo.toJson();
			fail("toJson() should fail for demands with no to node");
		}catch(NullPointerException e){}

		assertThat("Demands with no parent successfully produce JSON of the correct size",
				((JsonObject) noParent.toJson()).size(),
				equalTo(8));
		assertThat("Demands with no model successfully produce JSON of the correct size",
				((JsonObject) noModel.toJson()).size(),
				equalTo(7));
		assertThat("Demands with no name successfully produce JSON of the correct size",
				((JsonObject) noName.toJson()).size(),
				equalTo(7));
		assertThat("Demands with no profile successfully produce JSON of the correct size",
				((JsonObject) noProfile.toJson()).size(),
				equalTo(7));
	}

	@Test
	public void testGetProfile() {
		assertThat("Empty demand has no profile",
				empty.getProfile(),
				equalTo(null));
		assertThat("Test demand has correct profile",
				demand.getProfile(),
				equalTo(stubProfile));
	}

}
