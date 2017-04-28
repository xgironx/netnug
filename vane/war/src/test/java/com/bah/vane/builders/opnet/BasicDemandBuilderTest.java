package com.bah.vane.builders.opnet;

import static org.junit.Assert.*;

import java.util.Arrays;
import java.util.Collection;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;
import org.xml.sax.Attributes;

import com.bah.vane.entities.BasicDemand;
import com.bah.vane.entities.BasicNode;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.parsers.TrafficProfileLookup;
import com.bah.vane.parsers.opnet.StubAttributes;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicDemandBuilderTest {

	BasicNode stubNodeA, stubNodeB;
	Subnet stubSubnet;
	BasicSubnetBuilder stubSubnetBuilder;
	Profile stubProfileTest1, stubProfileTest2;

	BasicDemandBuilder empty, builder;

	@Before
	public void setUp() throws Exception {

		stubNodeA = mock(BasicNode.class);
		replay(stubNodeA);
		stubNodeB = mock(BasicNode.class);
		replay(stubNodeB);

		stubSubnet = mock(Subnet.class);
		replay(stubSubnet);

		stubSubnetBuilder = mock(BasicSubnetBuilder.class);
		expect(stubSubnetBuilder.findChildNode(Arrays.asList(new String[]{"subnet", "node a"}))).andStubReturn(stubNodeA);
		expect(stubSubnetBuilder.findChildNode(Arrays.asList(new String[]{"node b"}))).andStubReturn(stubNodeB);
		expect(stubSubnetBuilder.findChildNode(null)).andStubReturn(null);
		replay(stubSubnetBuilder);

		stubProfileTest1 = mock(Profile.class);
		replay(stubProfileTest1);
		TrafficProfileLookup.addProfile("test 1", stubProfileTest1);

		stubProfileTest2 = mock(Profile.class);
		replay(stubProfileTest2);
		TrafficProfileLookup.addProfile("test 2", stubProfileTest2);

		empty = new BasicDemandBuilder(stubSubnetBuilder);
		builder = new BasicDemandBuilder(stubSubnetBuilder);

		builder.addAttr("name", "builder");
		builder.addAttr("model", "test model");
		builder.addAttr("srcNode", "subnet.node a");
		builder.addAttr("destNode", "node b");
		builder.addAttr("Traffic (bits/second)", "test 1");

	}

	@Test
	public void testAddAttrStringString() throws Exception {
		// Testing attribute "name"
		empty.addAttr("name", "foo");
		assertThat("Attribute name overwrites no name",
				empty.getName(),
				equalTo("foo"));
		builder.addAttr("name", "bar");
		assertThat("Attribute name overwrites existing name",
				builder.getName(),
				equalTo("bar"));

		empty.addAttr("model", "foo model");
		assertThat("Attribute model overwrites no model",
				empty.build(stubSubnet).getModel(),
				equalTo("foo model"));
		builder.addAttr("model", "bar model");
		assertThat("Attribute model overwrites no model",
				builder.build(stubSubnet).getModel(),
				equalTo("bar model"));

		// Testing attribute "Traffic (bits/second)"
		empty.addAttr("Traffic (bits/second)", "test 1");
		assertThat("Attribute Traffic (bits/second) overwrites no profile",
				empty.build(stubSubnet).getProfile(),
				equalTo(stubProfileTest1));
		builder.addAttr("Traffic (bits/second)", "test 2");
		assertThat("Attribute Traffic (bits/second) overwrites existing profile",
				builder.build(stubSubnet).getProfile(),
				equalTo(stubProfileTest2));

		// Testing attribute "srcNode"
		empty.addAttr("srcNode", "subnet.node a");
		assertThat("Attribute srcNode overwrites no source node",
				empty.build(stubSubnet).getFromNode(),
				equalTo(stubNodeA));
		builder.addAttr("srcNode", "node b");
		assertThat("Attribute srcNode overwrites existing source node",
				builder.build(stubSubnet).getFromNode(),
				equalTo(stubNodeB));

		// Testing attribute "destNode"
		empty.addAttr("destNode", "node b");
		assertThat("Attribute destNode overwrites no source node",
				empty.build(stubSubnet).getToNode(),
				equalTo(stubNodeB));
		builder.addAttr("destNode", "subnet.node a");
		assertThat("Attribute srcNode overwrites existing source node",
				builder.build(stubSubnet).getToNode(),
				equalTo(stubNodeA));
	}

	@Test
	public void testAddAttrAttributes() throws Exception {
		Attributes attr1 = new StubAttributes(new String[]{"name", "model", "srcNode", "destNode", "Traffic (bits/second)"},
				new String[]{"foo", "foo model", "subnet.node a", "node b", "test 1"});

		Attributes attr2 = new StubAttributes(new String[]{"name", "model", "srcNode", "destNode", "Traffic (bits/second)"},
				new String[]{"bar", "bar model", "node b", "subnet.node a", "test 2"});

		empty.addAttr(attr1);
		builder.addAttr(attr2);

		// Testing attribute "name"
		assertThat("Attribute name overwrites no name",
				empty.getName(),
				equalTo("foo"));
		assertThat("Attribute name overwrites existing name",
				builder.getName(),
				equalTo("bar"));

		// Testing attribute "model"
		assertThat("Attribute model overwrites no model",
				empty.build(stubSubnet).getModel(),
				equalTo("foo model"));
		assertThat("Attribute model overwrites existing model",
				builder.build(stubSubnet).getModel(),
				equalTo("bar model"));

		// Testing attribute "Traffic (bits/second)"
		assertThat("Attribute Traffic (bits/second) overwrites no profile",
				empty.build(stubSubnet).getProfile(),
				equalTo(stubProfileTest1));
		assertThat("Attribute Traffic (bits/second) overwrites existing profile",
				builder.build(stubSubnet).getProfile(),
				equalTo(stubProfileTest2));

		// Testing attribute "srcNode"
		assertThat("Attribute srcNode overwrites no source node",
				empty.build(stubSubnet).getFromNode(),
				equalTo(stubNodeA));
		assertThat("Attribute srcNode overwrites existing source node",
				builder.build(stubSubnet).getFromNode(),
				equalTo(stubNodeB));

		// Testing attribute "destNode"
		assertThat("Attribute destNode overwrites no source node",
				empty.build(stubSubnet).getToNode(),
				equalTo(stubNodeB));
		assertThat("Attribute srcNode overwrites existing source node",
				builder.build(stubSubnet).getToNode(),
				equalTo(stubNodeA));
	}

	@Test
	public void testAddChild() throws Exception {
		assertThat("Adding child to empty returns UnknownOpnetObject",
				empty.addChild("whatever", null),
				instanceOf(UnknownOpnetObject.class));
		assertThat("Adding child to prepped builder returns UnknownOpnetObject",
				builder.addChild("whatever", null),
				instanceOf(UnknownOpnetObject.class));
	}

	@Test
	public void testGetName() {
		assertThat("Empty builder has no name",
				empty.getName(),
				equalTo(null));
		assertThat("Prepped builder has correct name",
				builder.getName(),
				equalTo("builder"));
	}

	@Test
	public void testBuild() {
		BasicDemand emptyDemand = empty.build(stubSubnet);

		assertThat("Empty demand has no name",
				emptyDemand.getName(),
				equalTo(null));
		assertThat("Empty demand has no model",
				emptyDemand.getModel(),
				equalTo(null));
		assertThat("Empty demand has no from node",
				emptyDemand.getFromNode(),
				equalTo(null));
		assertThat("Empty demand has no to node",
				emptyDemand.getToNode(),
				equalTo(null));
		assertThat("Empty demand has no profile",
				emptyDemand.getProfile(),
				equalTo(null));

		BasicDemand demand = builder.build(stubSubnet);

		assertThat("Demand has correct name",
				demand.getName(),
				equalTo("builder"));
		assertThat("Demand has correct model",
				demand.getModel(),
				equalTo("test model"));
		assertThat("Demand has correct from node",
				demand.getFromNode(),
				equalTo(stubNodeA));
		assertThat("Demand has correct to node",
				demand.getToNode(),
				equalTo(stubNodeB));
		assertThat("Demand has correct profile",
				demand.getProfile(),
				equalTo(stubProfileTest1));

	}

	@Test
	public void testBuildAll() {
		Collection<BasicDemand> emptyDemands = empty.buildAll(stubSubnet);

		assertThat("Empty builder returns correct demand count",
				emptyDemands,
				hasSize(1));

		for(BasicDemand emptyDemand : emptyDemands){
			assertThat("Empty demand has no name",
					emptyDemand.getName(),
					equalTo(null));
			assertThat("Empty demand has no model",
					emptyDemand.getModel(),
					equalTo(null));
			assertThat("Empty demand has no from node",
					emptyDemand.getFromNode(),
					equalTo(null));
			assertThat("Empty demand has no to node",
					emptyDemand.getToNode(),
					equalTo(null));
			assertThat("Empty demand has no profile",
					emptyDemand.getProfile(),
					equalTo(null));
		}

		Collection<BasicDemand> demands = builder.buildAll(stubSubnet);

		assertThat("Prepped builder returns correct demand count",
				demands,
				hasSize(1));

		for(BasicDemand demand : demands){
			assertThat("Demand has correct name",
					demand.getName(),
					equalTo("builder"));
			assertThat("Demand has correct model",
					demand.getModel(),
					equalTo("test model"));
			assertThat("Demand has correct from node",
					demand.getFromNode(),
					equalTo(stubNodeA));
			assertThat("Demand has correct to node",
					demand.getToNode(),
					equalTo(stubNodeB));
			assertThat("Demand has correct profile",
					demand.getProfile(),
					equalTo(stubProfileTest1));
		}

	}

}
