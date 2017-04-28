package com.bah.vane.parsers.opnet;

@SuppressWarnings("serial")
public class OpnetXMLException extends Exception {

	public OpnetXMLException(Throwable e){
		super(e);
	}

	public OpnetXMLException(String msg) {
		super(msg);
	}
}
