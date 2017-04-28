package com.bah.vane.builders.opnet;

import static org.junit.Assert.*;

import java.util.Collection;

import static org.hamcrest.Matchers.*;

import org.easymock.EasyMock;
import org.junit.Before;
import org.junit.Test;
import org.xml.sax.Attributes;

import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.StubAttributes;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicNodeBuilderTest {

	private BasicNodeBuilder emptyBuilder;
	private BasicNodeBuilder validBuilder;
	private BasicNodeBuilder invalidBuilder;
	private Subnet mockSubnet;
	private Attributes mockBlankAttr;
	private Attributes mockFilledAttr;

	@Before
	public void setUp() throws Exception {
		emptyBuilder = new BasicNodeBuilder();

		validBuilder = new BasicNodeBuilder();

		invalidBuilder = new BasicNodeBuilder();
		invalidBuilder.addAttr("name", "flan_config");

		mockSubnet = EasyMock.mock(Subnet.class);
		EasyMock.expect(mockSubnet.hasLocation()).andStubReturn(true);
		EasyMock.replay(mockSubnet);

		mockBlankAttr = new StubAttributes();

		mockFilledAttr = new StubAttributes(
				"name", "testName",
				"x position", "123",
				"y position", "456.7890",
				"foo", "bar",
				"model", "test model");

		validBuilder.addAttr(mockFilledAttr);
	}

	@Test
	public void testAddAttrStringString() throws Exception{
		emptyBuilder.addAttr("name", "exampleName");
		emptyBuilder.addAttr("x position", "123");
		emptyBuilder.addAttr("y position", "456.7890");
		emptyBuilder.addAttr("model", "test model");

		Node emptyBuiltNode = emptyBuilder.build(mockSubnet);
		assertThat("Attribute name overwrites no name",
				emptyBuiltNode.getName(),
				equalTo("exampleName"));
		assertThat("Attribute model overwrites no model",
				emptyBuiltNode.getModel(),
				equalTo("test model"));
		assertThat("Attribute x position overwrites no lng",
				emptyBuiltNode.getLng(),
				closeTo(123, 1e-6));
		assertThat("Attribute y position overwrites no lat",
				emptyBuiltNode.getLat(),
				closeTo(456.789, 1e-6));

		validBuilder.addAttr("name", "new name");
		validBuilder.addAttr("x position", "24.68");
		validBuilder.addAttr("y position", "-97.53");
		validBuilder.addAttr("model", "new model");

		Node builtNode = validBuilder.build(mockSubnet);
		assertThat("Attribute name overwrites previous name",
				builtNode.getName(),
				equalTo("new name"));
		assertThat("Attribute model overwrites previous model",
				builtNode.getModel(),
				equalTo("new model"));
		assertThat("Attribute x position overwrites previous lng",
				builtNode.getLng(),
				closeTo(24.68, 1e-6));
		assertThat("Attribute y position overwrites previous lat",
				builtNode.getLat(),
				closeTo(-97.53, 1e-6));

	}

	@Test
	public void testAddAttrFilledAttributes() throws Exception{
		emptyBuilder.addAttr(mockFilledAttr);

		Node testNode = emptyBuilder.build(mockSubnet);
		assertThat("testNode name", testNode.getName(), equalTo("testName"));
		assertThat("testNode lng", testNode.getLng(), closeTo(123, 1e-6));
		assertThat("testNode lat", testNode.getLat(), closeTo(456.789, 1e-6));
	}

	@Test
	public void testAddChild() throws Exception{
		OpnetObject child = emptyBuilder.addChild("childtag", mockBlankAttr);
		assertThat("Child is UnknownOpnetObject", child, instanceOf(UnknownOpnetObject.class));
		assertThat("Child has correct name", child.getName(), equalTo("?childtag?"));
	}

	@Test
	public void testBuildValid() throws Exception{
		Node testNode = validBuilder.build(mockSubnet);

		assertThat("Node has correct name",
				testNode.getName(),
				equalTo("testName"));
		assertThat("Node has correct model",
				testNode.getModel(),
				equalTo("test model"));
		assertThat("Node has correct lat",
				testNode.getLat(),
				closeTo(456.789, 1e-6));
		assertThat("Node has correct lng",
				testNode.getLng(),
				closeTo(123, 1e-6));
	}

	@Test
	public void testBuildInvalid() throws Exception{
		Node testNode = invalidBuilder.build(mockSubnet);

		assertThat("Invalid node name causes a null build", testNode, equalTo(null));
	}

	@Test
	public void testBuildAllValid() {
		Collection<? extends Node> testNodes = validBuilder.buildAll(mockSubnet);

		assertThat("Valid buildAll has size 1",
				testNodes.size(),
				equalTo(1));

		for(Node node : testNodes){
			assertThat("Valid buildAll gives correct node name",
					node.getName(),
					equalTo("testName"));
			assertThat("Valid buildAll gives correct node model",
					node.getModel(),
					equalTo("test model"));
			assertThat("Valid buildAll gives correct node lat",
					node.getLat(),
					closeTo(456.789, 1e-6));
			assertThat("Valid buildAll gives correct node lng",
					node.getLng(),
					closeTo(123, 1e-6));
		}
	}

	@Test
	public void testBuildAllInvalid() {
		Collection<? extends Node> testNodes = invalidBuilder.buildAll(mockSubnet);

		assertThat("Invalid buildAll has size 0",
				testNodes.size(),
				equalTo(0));
	}

	@Test
	public void testGetName() throws Exception{
		emptyBuilder.addAttr("name", "foo");
		assertThat("Builder name is correct", emptyBuilder.getName(), equalTo("foo"));
	}

}
