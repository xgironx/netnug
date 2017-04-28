package com.bah.vane.parsers.opnet;

import static org.junit.Assert.*;

import org.easymock.EasyMock;

import static org.hamcrest.Matchers.*;

import org.junit.Before;
import org.junit.Test;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

public class AttrObjectTest {

	OpnetObject noName;
	OpnetObject named;
	
	@Before
	public void setUp() throws Exception {
		noName = new AttrObject();
		named = new AttrObject("test");
	}

	@Test
	public void testAttrObject() {
		OpnetObject testNoName = new AttrObject();
		
		assertThat(testNoName.getName(), equalTo(""));
		assertThat(testNoName.toString(), equalTo("AttrObject(\"\")"));
	}

	@Test
	public void testAttrObjectString() {
		OpnetObject testNamed = new AttrObject("name");
		
		assertThat(testNamed.getName(), equalTo("name"));
		assertThat(testNamed.toString(), equalTo("AttrObject(\"name\")"));
	}

	@Test
	public void testAddAttrStringString() {
		try{
			named.addAttr("ab", "cd");
			fail("addAttr should throw an exception, but didn't");
		}catch(SAXException e){}

		try{
			named.addAttr(null, "cd");
			fail("addAttr should throw an exception, but didn't");
		}catch(SAXException e){}

		try{
			named.addAttr("ab", null);
			fail("addAttr should throw an exception, but didn't");
		}catch(SAXException e){}

		try{
			named.addAttr(null, null);
			fail("addAttr should throw an SAXException, but didn't");
		}catch(SAXException e){}

	}

	@Test
	public void testAddChild() {
		Attributes mockAttr = EasyMock.mock(Attributes.class);
		EasyMock.replay(mockAttr);
		
		try{
			named.addChild("ab", mockAttr);
			fail("addChild should throw a SAXException, but didn't");
		}catch(SAXException e){}
		
		try{
			named.addChild(null, mockAttr);
			fail("addChild should throw a SAXException, but didn't");
		}catch(SAXException e){}
		
		try{
			named.addChild("ab", null);
			fail("addChild should throw a SAXException, but didn't");
		}catch(SAXException e){}
		
		try{
			named.addChild(null, null);
			fail("addChild should throw a SAXException, but didn't");
		}catch(SAXException e){}
		
	}

	@Test
	public void testToString() {
		assertThat(named.toString(), equalTo("AttrObject(\"test\")"));
		assertThat(noName.toString(), equalTo("AttrObject(\"\")"));
	}

	@Test
	public void testGetName() {
		assertThat(named.getName(), equalTo("test"));
		assertThat(noName.getName(), equalTo(""));
	}

	@Test
	public void testAddAttrAttributes() {
		Attributes mockAttr = EasyMock.mock(Attributes.class);
		EasyMock.replay(mockAttr);
		
		try {
			named.addAttr(mockAttr);
			fail("addAttr should throw a SAXException, but didn't");
		}catch(SAXException e){}

		try {
			named.addAttr(null);
			fail("addAttr should throw a SAXException, but didn't");
		}catch(SAXException e){}
	}
}
