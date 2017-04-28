package com.bah.vane.parsers.opnet;

import java.io.Reader;

/**
 * An OpnetParser takes in an XML file and uses it to populate an OpnetRootObject.
 * 
 * @author "Dan Dulaney <dulaney_daniel@bah.com>"
 */
public interface OpnetParser {
	
	/**
	 * Given a Reader that points to an XML file, and an empty OpnetRootObject, populate the OpnetRootObject with the
	 * contents of the XML file.
	 * 
	 * @param reader The XML file of interest
	 * @param emptyNetwork An empty (preferably newly-created) OpnetRootObject
	 * @return A pointer to the emptyNetwork that was originally passed in
	 * @throws OpnetXMLException
	 */
	public abstract OpnetRootObject networkFromXML(Reader reader, OpnetRootObject emptyNetwork) throws OpnetXMLException;
	
}
