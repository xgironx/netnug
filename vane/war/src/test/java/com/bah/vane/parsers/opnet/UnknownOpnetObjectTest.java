package com.bah.vane.parsers.opnet;

import static org.junit.Assert.*;

import org.xml.sax.Attributes;

import org.easymock.EasyMock;

import static org.hamcrest.Matchers.*;

import org.junit.Before;
import org.junit.Test;
import org.xml.sax.SAXException;

public class UnknownOpnetObjectTest {

	OpnetObject noNameObj;
	OpnetObject emptyStringObj;
	OpnetObject testObj;
	
	@Before
	public void setUp() throws Exception {
		noNameObj = new UnknownOpnetObject();
		emptyStringObj = new UnknownOpnetObject("");
		testObj = new UnknownOpnetObject("test");
	}

	@Test
	public void testUnknownOpnetObject() {
		OpnetObject noName = new UnknownOpnetObject();
		
		assertThat("Construct without name", noName.getName(), equalTo("??"));
	}

	@Test
	public void testUnknownOpnetObjectString() {
		OpnetObject emptyName = new UnknownOpnetObject("");
		assertThat("Construct with empty name", emptyName.getName(), equalTo("??"));		
		
		OpnetObject testName = new UnknownOpnetObject("test");
		assertThat("Construct with test name", testName.getName(), equalTo("?test?"));
	}

	@Test
	public void testAddAttrStringString() throws SAXException {
		OpnetObject strNull = testObj;
		OpnetObject strStr = testObj;
		OpnetObject nullNull = testObj;
		OpnetObject nullStr = testObj;
		
		strNull.addAttr("test", null);
		strStr.addAttr("test", "test");
		nullNull.addAttr(null, null);
		nullStr.addAttr(null, "test");
		
		assertThat("String-null equal to original", strNull, equalTo(testObj));
		assertThat("String-String equal to original", strStr, equalTo(testObj));
		assertThat("null-null equal to original", nullNull, equalTo(testObj));
		assertThat("null-String equal to original", nullStr, equalTo(testObj));
	}

	@Test
	public void testAddAttrAttributes() throws SAXException {
		
		// Create a mock attribute
		Attributes mockAttrs = EasyMock.mock(Attributes.class);
		// Expect no calls when replaying
		EasyMock.replay(mockAttrs);
		
		OpnetObject mockTest = testObj;
		mockTest.addAttr(mockAttrs);
		
		assertThat("After addAttr(), still equal()", mockTest, equalTo(testObj));
		assertThat("After addAttr(), still ==", mockTest == testObj, equalTo(true));
	}

	@Test
	public void testAddChild() throws SAXException {
		// Make sure that the attributes passed in are never actually used
		Attributes mockAttrs = EasyMock.mock(Attributes.class);
		EasyMock.replay(mockAttrs);
		
		OpnetObject testChild = testObj.addChild("testChild", mockAttrs);
		assertThat("testChild is UnknownOpnetObject", testChild, instanceOf(UnknownOpnetObject.class));
		assertThat("testChild has correct name", testChild.getName(), equalTo("?testChild?"));
	}

	@Test
	public void testGetName() {
		assertThat("getName() on none", noNameObj.getName(), equalTo("??"));
		assertThat("getName() on empty", emptyStringObj.getName(), equalTo("??"));
		assertThat("getName() on test", testObj.getName(), equalTo("?test?"));
	}

	@Test
	public void testToString() {
		assertThat("toString() on none", noNameObj.toString(), equalTo("UnknownOpnetObject(<>)"));
		assertThat("toString() on empty", emptyStringObj.toString(), equalTo("UnknownOpnetObject(<>)"));
		assertThat("toString() on test", testObj.toString(), equalTo("UnknownOpnetObject(<test>)"));
	}

}
