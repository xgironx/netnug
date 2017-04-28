package com.bah.vane.builders.opnet;

import java.util.ArrayList;
import java.util.Collection;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.bah.vane.entities.BasicNode;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.builders.Builder;
import com.bah.vane.parsers.opnet.NodeNameCheck;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicNodeBuilder implements OpnetObject, Builder<BasicNode> {

	private String name;
	private String model;
	private String icon;

	private Double lat = null;
	private Double lng = null;

	@Override
	public void addAttr(String name, String value) throws SAXException {
		if(name.equals("name")){
			this.name = value;
		}else if(name.equals("x position")){
			this.lng = Double.parseDouble(value.replaceAll(",", ""));
			// System.out.println("Node " + this.name + " x position: " + Double.toString(this.lng));
		}else if(name.equals("y position")){
			this.lat = Double.parseDouble(value.replaceAll(",", ""));
			// System.out.println("Node " + this.name + " y position: " + Double.toString(this.lat));
		}else if(name.equals("model")){
			this.model = value;
		} else if (name.equals("icon name")) {
			this.icon = value;
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
		// Nodes shouldn't have children
		// Ignore attempts to add children
		return new UnknownOpnetObject(tag);
	}

	@Override
	public BasicNode build(Subnet parent) {
		if(NodeNameCheck.nameOk(name)){
			return new BasicNode(parent, name, model, lat, lng, icon);
		}else{
			return null;
		}
	}

	@Override
	public Collection<BasicNode> buildAll(Subnet parent) {
		BasicNode node = build(parent);
		if(node == null){
			return new ArrayList<>();
		}else{
			Collection<BasicNode> nodes = new ArrayList<>(1);
			nodes.add(node);
			return nodes;
		}
	}

	@Override
	public String getName() {
		return name;
	}

}
