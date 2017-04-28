package com.bah.vane.parsers.opnet;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

public class UnknownOpnetObject implements OpnetObject {
	
	private String tag = "";
	
	public UnknownOpnetObject(){}
	
	public UnknownOpnetObject(String tag){
		this.tag = tag;
	}

	@Override
	public void addAttr(String name, String value) {
		// Do nothing (we don't recognize this object, so we can safely ignore its attributes)
	}

	@Override
	public void addAttr(Attributes attr) throws SAXException {
		// Do nothing (we don't recognize this object, so we can safely ignore its attributes)
	}
	
	@Override
	public OpnetObject addChild(String tag, Attributes attr) throws SAXException {
		// We don't recognize this object, so let's not try to understand its children, either
		return new UnknownOpnetObject(tag);
	}

	@Override
	public String getName() {
		return "?" + tag + "?";
	}
	
	@Override
	public String toString() {
		return "UnknownOpnetObject(<" + tag + ">)";
	}

}
