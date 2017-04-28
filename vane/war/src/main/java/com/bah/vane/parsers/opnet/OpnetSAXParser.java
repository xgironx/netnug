package com.bah.vane.parsers.opnet;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayDeque;
import java.util.Deque;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.Attributes;
import org.xml.sax.EntityResolver;
import org.xml.sax.ErrorHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;

/**
 * This class implements OpnetParser, and is the primary way to parse OPNET XML files.
 * It uses Java SAX. (see https://docs.oracle.com/javase/7/docs/api/org/xml/sax/package-summary.html)
 * <p>
 * The class itself extends DefaultHandler, which allows it to handle all of its own SAX events.
 * It maintains a stack that tracks its current position in the file. New elements are handled by the addChild() or
 * addAttr() methods on the top of the stack, and the returned elements are removed. When elements end, they are simply
 * popped off of the stack.
 *
 * @author "Dan Dulaney <dulaney_daniel@bah.com>"
 *
 */
public class OpnetSAXParser extends DefaultHandler implements OpnetParser {

	/**
	 * The root network passed into networkFromXML.
	 */
	private OpnetRootObject rootNetwork;

	/**
	 * The stack that tracks the location in the file.
	 */
	private Deque<OpnetObject> locationStack = new ArrayDeque<>();

	/**
	 * Called when a new element is encountered.
	 * <p>
	 * There are three options:
	 * If the element is a network element, be sure that the stack is empty. Then, push the root element onto the stack.
	 * If the element is an attribute element (attr, characteristic, or ui_status), call addAttr() on the top of the
	 * stack, then add a new AttrObject to the stack.
	 * If the element is something else, call addChild() on the top of the stack, then push the return value.
	 * <p>
	 * This procedure keeps the stack up-to-date, always pushing <strong>something</strong> to the stack.
	 *
	 * @see org.xml.sax.helpers.DefaultHandler#startElement(java.lang.String, java.lang.String, java.lang.String, org.xml.sax.Attributes)
	 */
	@Override
	public void startElement(String url, String localName, String qName, Attributes attrs) throws SAXException {

		if(qName.endsWith("network")) {
			// network is the root node
			// Push the provided root network on to the stack
			// Error if there is already a parent network

			if(!locationStack.isEmpty()) throw new SAXException("Encountered a <network> when the locationStack is not empty! (networkStack: " + locationStack + ")");

			locationStack.push(rootNetwork);

		}
		else if(qName.endsWith("attr") || qName.endsWith("characteristic") || qName.endsWith("ui_status")) {
			// attr and characteristic define properties of their containing object
			// Add them to the most recent thing on the stack

			locationStack.peek().addAttr(attrs.getValue("name"), attrs.getValue("value"));
			locationStack.push(new AttrObject(attrs.getValue("name")));
		}
		else {
			// subnet defines a new network, underneath the current one
			// Create a new network with the current network as its parent
			// Push the new network onto the stack

			// Create the new network
			OpnetObject newObject = locationStack.peek().addChild(qName, attrs);

			// Push the new network onto the stack
			locationStack.push(newObject);
		}


	}

	/**
	 * Called when an element is ended.
	 * <p>
	 * All this does it pop the most recent thing off the stack.
	 *
	 * @see org.xml.sax.helpers.DefaultHandler#endElement(java.lang.String, java.lang.String, java.lang.String)
	 */
	public void endElement(String uri, String localName, String qName) throws SAXException{
		locationStack.pop();
	}

	/* (non-Javadoc)
	 * @see com.bah.vane.parsers.opnet.OpnetParser#networkFromXML(java.io.Reader, com.bah.vane.parsers.opnet.OpnetRootObject)
	 */
	@Override
	public OpnetRootObject networkFromXML(Reader reader, OpnetRootObject emptyNetwork) throws OpnetXMLException {

		// Set the rootNetwork
		rootNetwork = emptyNetwork;
		XMLReader xmlReader = null;

		// Create a new XML reader
		try{
			SAXParser saxParser = SAXParserFactory.newInstance().newSAXParser();
			xmlReader = saxParser.getXMLReader();
		}catch(ParserConfigurationException|SAXException e){
			throw new OpnetXMLException(e);
		}

		// On the XML reader, make this the content handler
		// This only works because OpnetSAXParser extends DefaultHandler
		// DefaultHandler provides do-nothing methods for OpnetSAXParser to override
		xmlReader.setContentHandler(this);

		// If an XML document has a DTD, EntityResolver is responsible for resolving it
		// OPNET's standard DTDs are not publicly accessible
		// This EntityResolver removes any DTD that starts with file://
		// (SAX requires that systemId be a fully-qualified URL)
		// Yes, I realize this is hacky
		xmlReader.setEntityResolver(new EntityResolver(){
			@Override
			public InputSource resolveEntity(String publicId, String systemId) throws IOException, SAXException{
				if(systemId.startsWith("file://")){
					return new InputSource(new StringReader(""));
				}else{
					return (new DefaultHandler()).resolveEntity(publicId, systemId);
				}
			}
		});

		// On errors, do nothing
		xmlReader.setErrorHandler(new ErrorHandler() {
		    @Override
		    public void warning(SAXParseException e) throws SAXException {
		    }

		    @Override
		    public void fatalError(SAXParseException e) throws SAXException {
		        throw e;
		    }

		    @Override
		    public void error(SAXParseException e) throws SAXException {
		        throw e;
		    }
		});

		// Actually parse the file
		try {
			xmlReader.parse(new InputSource(reader));
		} catch (IOException | SAXException e) {
			throw new OpnetXMLException(e);
		}

		// Return the same thing that was passed in
		return rootNetwork;
	}

}
