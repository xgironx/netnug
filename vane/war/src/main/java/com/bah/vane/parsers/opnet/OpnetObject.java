package com.bah.vane.parsers.opnet;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

/**
 * @author "Dan Dulaney <dulaney_daniel@bah.com>"
 *
 */
public interface OpnetObject {
	
	/**
	 * Adds an attribute to this object.
	 * 
	 * Attributes are name-value pairs. Unknown attributes are ignored silently.
	 * 
	 * @param name The name of the attribute
	 * @param value The value of the attribute
	 * @throws SAXException
	 */
	void addAttr(String name, String value) throws SAXException;
	/**
	 * Add all of the attributes in an org.xml.sax.Attributes object.
	 * 
	 * This behaves equivalently to multiple calls to addAttr(name, value).
	 * 
	 * @param attr The Attributes object to be added
	 * @throws SAXException
	 */
	void addAttr(Attributes attr) throws SAXException;
	
	/**
	 * Add a child object to this node.
	 * 
	 * @param tag The tag name of the child object.
	 * @param attr The attributes attached to the element.
	 * @return The produced child object. It should never be null.
	 * @throws SAXException
	 */
	OpnetObject addChild(String tag, Attributes attr) throws SAXException;
	
	/**
	 * Get the name of this object.
	 * 
	 * This is here to allow lookups by name.
	 * 
	 * @return The name of this object.
	 */
	String getName();

}
