package com.bah.vane.builders.opnet;

import static org.junit.Assert.*;

import java.util.Arrays;
import java.util.Collection;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;
import org.xml.sax.Attributes;

import com.bah.vane.entities.BasicNode;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.StubAttributes;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicLinkBuilderTest {

	Subnet mockSubnet;
	Attributes mockEmptyAttrs;
	Attributes mockSimplexAttrs;
	Attributes mockDuplexAttrs;
	BasicSubnetBuilder mockSubnetBuilder;

	BasicLinkBuilder emptyBuilder;

	BasicNode mockFooBarNode;
	BasicNode mockBazNode;

	@Before
	public void setUp() throws Exception {

		mockSubnet = mock(Subnet.class);
		replay(mockSubnet);

		mockEmptyAttrs = new StubAttributes();

		mockSimplexAttrs = mock(Attributes.class);
		expect(mockSimplexAttrs.getLength()).andStubReturn(5);
		expect(mockSimplexAttrs.getLocalName(0)).andStubReturn("class");
		expect(mockSimplexAttrs.getValue(0)).andStubReturn("simplex");
		expect(mockSimplexAttrs.getLocalName(1)).andStubReturn("model");
		expect(mockSimplexAttrs.getValue(1)).andStubReturn("100BaseT");
		expect(mockSimplexAttrs.getLocalName(2)).andStubReturn("srcNode");
		expect(mockSimplexAttrs.getValue(2)).andStubReturn("foo.bar");
		expect(mockSimplexAttrs.getLocalName(3)).andStubReturn("destNode");
		expect(mockSimplexAttrs.getValue(3)).andStubReturn("baz");
		expect(mockSimplexAttrs.getLocalName(4)).andStubReturn("name");
		expect(mockSimplexAttrs.getValue(4)).andStubReturn("testname");
		replay(mockSimplexAttrs);

		mockDuplexAttrs = mock(Attributes.class);
		expect(mockDuplexAttrs.getLength()).andStubReturn(5);
		expect(mockDuplexAttrs.getLocalName(0)).andStubReturn("class");
		expect(mockDuplexAttrs.getValue(0)).andStubReturn("duplex");
		expect(mockDuplexAttrs.getLocalName(1)).andStubReturn("model");
		expect(mockDuplexAttrs.getValue(1)).andStubReturn("100BaseT");
		expect(mockDuplexAttrs.getLocalName(2)).andStubReturn("srcNode");
		expect(mockDuplexAttrs.getValue(2)).andStubReturn("foo.bar");
		expect(mockDuplexAttrs.getLocalName(3)).andStubReturn("destNode");
		expect(mockDuplexAttrs.getValue(3)).andStubReturn("baz");
		expect(mockDuplexAttrs.getLocalName(4)).andStubReturn("name");
		expect(mockDuplexAttrs.getValue(4)).andStubReturn("testname");
		replay(mockDuplexAttrs);

		mockSubnetBuilder = mock(BasicSubnetBuilder.class);
		mockFooBarNode = mock(BasicNode.class);
		mockFooBarNode.addIncoming(anyObject());
		expectLastCall().anyTimes();
		mockFooBarNode.addOutgoing(anyObject());
		expectLastCall().anyTimes();
		replay(mockFooBarNode);
		mockBazNode = mock(BasicNode.class);
		mockBazNode.addIncoming(anyObject());
		expectLastCall().anyTimes();
		mockBazNode.addOutgoing(anyObject());
		expectLastCall().anyTimes();
		replay(mockBazNode);
		expect(mockSubnetBuilder.findChildNode(Arrays.asList(new String[]{"foo", "bar"}))).andStubReturn(mockFooBarNode);
		expect(mockSubnetBuilder.findChildNode(Arrays.asList(new String[]{"baz"}))).andStubReturn(mockBazNode);
		replay(mockSubnetBuilder);

		emptyBuilder = new BasicLinkBuilder(mockSubnetBuilder);
	}

	@Test
	public void testAddAttrStringString() throws Exception{
		emptyBuilder.addAttr("name", "testname");
		assertThat("Name attribute is correct", emptyBuilder.getName(), equalTo("testname"));

		emptyBuilder.addAttr("class", "simplex");
		emptyBuilder.addAttr("model", "100BaseT");
		emptyBuilder.addAttr("srcNode", "foo.bar");
		emptyBuilder.addAttr("destNode", "baz");

		Link testLink = emptyBuilder.build(mockSubnet);
		assertThat("Link name is correct", testLink.getName(), equalTo("testname"));
		assertThat("Source node is correct", testLink.getFromNode(), equalTo(mockFooBarNode));
		assertThat("Dest node is correct", testLink.getToNode(), equalTo(mockBazNode));
		assertThat("Model is correct", testLink.getModel(), equalTo("100BaseT"));
	}

	@Test
	public void testAddAttrAttributesSimplex() throws Exception {
		// All functionality covered in simplex build tests
	}

	@Test
	public void testAddAttrAttributesDuplex() throws Exception {
		// All functionality covered in duplex build tests
	}

	@Test
	public void testAddChild() throws Exception {
		OpnetObject child = emptyBuilder.addChild("childtag", mockEmptyAttrs);
		assertThat("Child is UnknownOpnetObject", child, instanceOf(UnknownOpnetObject.class));
		assertThat("Child has correct name", child.getName(), equalTo("?childtag?"));
	}

	@Test
	public void testBuildSimplex() throws Exception {
		emptyBuilder.addAttr(mockSimplexAttrs);

		Link testLink = emptyBuilder.build(mockSubnet);
		assertThat("Link name is correct", testLink.getName(), equalTo("testname"));
		assertThat("Source node is correct", testLink.getFromNode(), equalTo(mockFooBarNode));
		assertThat("Dest node is correct", testLink.getToNode(), equalTo(mockBazNode));
		assertThat("Model is correct", testLink.getModel(), equalTo("100BaseT"));
	}

	@Test
	public void testBuildDuplex() throws Exception {
		emptyBuilder.addAttr(mockDuplexAttrs);

		Link testLink = emptyBuilder.build(mockSubnet);
		assertThat("Built link is null", testLink, equalTo(null));
	}

	@Test
	public void testBuildAllSimplex() throws Exception {
		emptyBuilder.addAttr(mockSimplexAttrs);

		Collection<? extends Link> testLinks = emptyBuilder.buildAll(mockSubnet);

		assertThat("Simplex builds 1 link", testLinks.size(), equalTo(1));
		for(Link link : testLinks){
			assertThat("Name is correct", link.getName(), equalTo("testname"));
			assertThat("Source node is correct", link.getFromNode(), equalTo(mockFooBarNode));
			assertThat("Dest node is correct", link.getToNode(), equalTo(mockBazNode));
			assertThat("Model is correct", link.getModel(), equalTo("100BaseT"));
		}
	}

	@Test
	public void testBuildAllDuplex() throws Exception {
		emptyBuilder.addAttr(mockDuplexAttrs);

		Collection<? extends Link> testLinks = emptyBuilder.buildAll(mockSubnet);

		assertThat("Duplex builds 2 links", testLinks.size(), equalTo(2));
		for(Link link : testLinks){
			assertThat("Name is correct", link.getName(), equalTo("testname"));
			assertThat("Source node is correct", link.getFromNode(), anyOf(equalTo(mockFooBarNode), equalTo(mockBazNode)));
			assertThat("Dest node is correct", link.getToNode(), anyOf(equalTo(mockBazNode), equalTo(mockFooBarNode)));
			assertThat("Model is correct", link.getModel(), equalTo("100BaseT"));
		}

	}

	@Test
	public void testGetName() throws Exception{
		emptyBuilder.addAttr("name", "foo");
		assertThat("Builder name is correct", emptyBuilder.getName(), equalTo("foo"));
	}
}
