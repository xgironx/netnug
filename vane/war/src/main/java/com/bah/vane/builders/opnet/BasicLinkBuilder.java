package com.bah.vane.builders.opnet;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.bah.vane.entities.BasicLink;
import com.bah.vane.entities.BasicNode;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.builders.Builder;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicLinkBuilder implements OpnetObject, Builder<BasicLink> {

	private String name;
	private List<String> fromNodeName;
	private List<String> toNodeName;
	private String type;

	private BasicSubnetBuilder parentBuilder;

	private boolean duplex = false;

	public BasicLinkBuilder(BasicSubnetBuilder parent){
		this.parentBuilder = parent;
	}

	@Override
	public void addAttr(String name, String value) throws SAXException {
		if(name.equals("name")){
			// Just get the name attribute
			this.name = value;
		}else if(name.equals("model")){
			this.type = value;
		}else if(name.equals("class")){
			this.duplex = value.equals("duplex");
		}else if(name.equals("srcNode")){
			// srcNode and destNode are in the format subnet.subnet.node
			// Need a backslash because String#split expects a regex
			// Double backslash for Java string escape
			fromNodeName = Arrays.asList(value.split("\\."));
		}else if(name.equals("destNode")){
			// See comments for srcNode above
			toNodeName = Arrays.asList(value.split("\\."));
		}
	}

	@Override
	public void addAttr(Attributes attr) throws SAXException {
		// Loop through every attribute and send it to the normal addAttr function
		for(int i = 0; i < attr.getLength(); i++){
			this.addAttr(attr.getLocalName(i), attr.getValue(i));
		}
	}

	@Override
	public OpnetObject addChild(String tag, Attributes attr) throws SAXException {
		return new UnknownOpnetObject(tag);
	}

	@Override
	public BasicLink build(Subnet parent){
		Collection<BasicLink> buildResults = buildAll(parent);

		if(buildResults.size() == 1){
			return buildResults.toArray(new BasicLink[1])[0];
		}else{
			return null;
		}
	}

	@Override
	public Collection<BasicLink> buildAll(Subnet parent){
		BasicNode fromNode = this.parentBuilder.findChildNode(fromNodeName);
		BasicNode toNode = this.parentBuilder.findChildNode(toNodeName);

		Boolean isDuplex = duplex ? true : false;

		BasicLink forwardLink = new BasicLink(parent, name, type, fromNode, toNode, isDuplex);
		if(fromNode != null) fromNode.addOutgoing(forwardLink);
		if(toNode != null) toNode.addIncoming(forwardLink);

		if (isDuplex) {
			BasicLink reverseLink = (BasicLink)forwardLink.getReverseLink();
			if(fromNode != null) fromNode.addIncoming(reverseLink);
			if(toNode != null) toNode.addOutgoing(reverseLink);
			return Arrays.asList(new BasicLink[]{forwardLink, reverseLink});
		} else {
			return Arrays.asList(new BasicLink[]{forwardLink});
		}
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String toString() {
		if(name != null){
			return "BasicLinkBuilder(" + name + ")";
		}else{
			return "BasicLinkBuilder(<unknown name>)";
		}
	}
}
