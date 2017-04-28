package com.bah.vane.parsers.opnet;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

/**
 * @author "Dan Dulaney <dulaney_daniel@bah.com>"
 *
 * AttrObject is a placeholder in the parser that holds the position of an attr tag (or a few other tags).
 * 
 * It doesn't hold children, and only has a name for testing purposes.
 */
public class AttrObject implements OpnetObject {
	
	String name = "";
	
	/**
	 * Create a new attribute object.
	 */
	public AttrObject(){}
	/**
	 * Create a new named attribute object.
	 * 
	 * @param name The name of the object
	 */
	public AttrObject(String name) {
		this.name = name;
	}

	/* (non-Javadoc)
	 * @see com.bah.vane.parsers.opnet.OpnetObject#addAttr(java.lang.String, java.lang.String)
	 */
	@Override
	public void addAttr(String name, String value) throws SAXException {
		throw new SAXException("Cannot add attribute (name: " + name + ", value: " + value + ") to " + this);
	}

	/* (non-Javadoc)
	 * @see com.bah.vane.parsers.opnet.OpnetObject#addChild(java.lang.String, org.xml.sax.Attributes)
	 */
	@Override
	public OpnetObject addChild(String tag, Attributes attr) throws SAXException {
		throw new SAXException("Cannot add child <" + tag + "> to " + this);
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "AttrObject(\"" + getName() + "\")";
	}
	
	/* (non-Javadoc)
	 * @see com.bah.vane.parsers.opnet.OpnetObject#getName()
	 */
	@Override
	public String getName() {
		return name;
	}
	
	/* (non-Javadoc)
	 * @see com.bah.vane.parsers.opnet.OpnetObject#addAttr(org.xml.sax.Attributes)
	 */
	@Override
	public void addAttr(Attributes attr) throws SAXException {
		throw new SAXException("Cannot add attributes object to " + this);
	}
}
