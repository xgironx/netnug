package com.bah.vane.builders.opnet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.bah.vane.entities.BasicDemand;
import com.bah.vane.entities.BasicNode;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.builders.Builder;

import com.bah.vane.parsers.TrafficProfileLookup;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicDemandBuilder implements Builder<BasicDemand>, OpnetObject {

	String name;
	private List<String> fromNodeName;
	private List<String> toNodeName;
	private String profileName;
	private String model;

	private BasicSubnetBuilder parentBuilder;

	public BasicDemandBuilder(BasicSubnetBuilder parent){
		this.parentBuilder = parent;
	}


	@Override
	public void addAttr(String name, String value) throws SAXException {
		if(name.equals("name")){
			// Just get the name attribute
			this.name = value;
		}else if(name.equals("srcNode")){
			// srcNode and destNode are in the format subnet.subnet.node
			// Need a backslash because String#split expects a regex
			// Double backslash for Java string escape
			fromNodeName = Arrays.asList(value.split("\\."));
		}else if(name.equals("destNode")){
			// See comments for srcNode above
			toNodeName = Arrays.asList(value.split("\\."));
		}else if(name.equals("Traffic (bits/second)")){
			// Just grab the profile name
			profileName = value;
		}else if(name.equals("model")){
			model = value;
		}
	}

	@Override
	public void addAttr(Attributes attr) throws SAXException {
		for(int i = 0; i < attr.getLength(); i++){
			addAttr(attr.getLocalName(i), attr.getValue(i));
		}
	}

	@Override
	public OpnetObject addChild(String tag, Attributes attr) throws SAXException {
		return new UnknownOpnetObject(tag);
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public BasicDemand build(Subnet parent) {
		BasicNode fromNode = this.parentBuilder.findChildNode(fromNodeName);
		BasicNode toNode = this.parentBuilder.findChildNode(toNodeName);

		return new BasicDemand(parent, name, model, fromNode, toNode, TrafficProfileLookup.getProfile(profileName));
	}

	@Override
	public Collection<BasicDemand> buildAll(Subnet parent) {
		BasicDemand builtDemand = this.build(parent);
		if(builtDemand == null){
			return new ArrayList<>();
		}

		return Arrays.asList(new BasicDemand[]{builtDemand});
	}

}
