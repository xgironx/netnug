package com.bah.vane.builders.opnet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.bah.vane.entities.BasicDemand;
import com.bah.vane.entities.BasicPath;
import com.bah.vane.entities.BasicLink;
import com.bah.vane.entities.BasicNode;
import com.bah.vane.entities.BasicSubnet;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.builders.Builder;
import com.bah.vane.parsers.TrafficProfileLookup;
import com.bah.vane.parsers.json.JsonNetworkParser;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.OpnetRootObject;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicSubnetBuilder implements OpnetRootObject, Builder<BasicSubnet> {

	private String name;
	private String description;

	private Boolean inDegrees;
	private Double lat;
	private Double lng;

	private String icon;
	private String units;

	// private Boolean modified;
	private Boolean queued;
	// private Boolean analyzed;
	private Integer analysisCount;


	// These are the builders that can be added/removed and changed
	private Set<BasicNodeBuilder> nodes = new HashSet<>();
	private Set<BasicLinkBuilder> links = new HashSet<>();
	private Set<BasicProfileBuilder> profiles = new HashSet<>();
	private Set<BasicDemandBuilder> demands = new HashSet<>();
	private Set<BasicPathBuilder> paths = new HashSet<>();
	private Set<BasicSubnetBuilder> subnets = new HashSet<>();

	// Whenever build() gets called, these are repopulated
	// findChildNode() uses builtNodes
	// They're all kept here for consistency, and so that a findChildLink() or findChildDemand() is fast to write
	private Set<BasicNode> builtNodes = new HashSet<>();
	private Set<BasicLink> builtLinks = new HashSet<>();
	private Set<BasicDemand> builtDemands = new HashSet<>();
	private Set<BasicPath> builtPaths = new HashSet<>();
	private Set<BasicSubnet> builtSubnets = new HashSet<>();

	@Override
	public void addAttr(String name, String value) throws SAXException {
		if(name.equals("name")){
			this.name = value;
		}else if(name.equals("units")){
			this.units = value;
			this.inDegrees = value.equals("Degrees");
		}else if(name.equals("x position")){
			this.lng = Double.parseDouble(value.replaceAll(",", ""));
			// System.out.println("Subnet " + this.name + " x position: " + Double.toString(this.lng));
		}else if(name.equals("y position")){
			this.lat = Double.parseDouble(value.replaceAll(",", ""));
			// System.out.println("Subnet " + this.name + " y position: " + Double.toString(this.lat));
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
		if(tag.equals("subnet")){

			BasicSubnetBuilder subnetBuilder = new BasicSubnetBuilder();
			subnetBuilder.addAttr(attr);

			subnets.add(subnetBuilder);

			return subnetBuilder;

		}else if(tag.equals("node")){

			BasicNodeBuilder nodeBuilder = new BasicNodeBuilder();
			nodeBuilder.addAttr(attr);

			nodes.add(nodeBuilder);

			return nodeBuilder;

		}else if(tag.equals("link")){

			BasicLinkBuilder linkBuilder = new BasicLinkBuilder(this);
			linkBuilder.addAttr(attr);

			links.add(linkBuilder);

			return linkBuilder;

		}else if(tag.equals("profile")){

			BasicProfileBuilder profileBuilder = new BasicProfileBuilder();
			profileBuilder.addAttr(attr);

			profiles.add(profileBuilder);

			return profileBuilder;

		}else if(tag.equals("demand")){

			BasicDemandBuilder demandBuilder = new BasicDemandBuilder(this);
			demandBuilder.addAttr(attr);

			demands.add(demandBuilder);

			return demandBuilder;

		}else if(tag.equals("path")){

			BasicPathBuilder pathBuilder = new BasicPathBuilder(this);
			pathBuilder.addAttr(attr);

			paths.add(pathBuilder);

			return pathBuilder;

		}else{
			return new UnknownOpnetObject();
		}
	}

	@Override
	public Subnet build() {
		return build(null);
	}

	@Override
	public Collection<BasicSubnet> buildAll(Subnet parent) {
		return Arrays.asList(new BasicSubnet[]{build(parent)});
	}

	@Override
	public BasicSubnet build(Subnet parent) {

		BasicSubnet newSubnet = new BasicSubnet(
			parent,
			name,
			description,
			inDegrees == null ? false : inDegrees,
			lat,
			lng,
			icon,
			units);

		for(BasicProfileBuilder profileBuilder : profiles) {
			TrafficProfileLookup.addProfile(profileBuilder.getName(), profileBuilder.build(null));
		}

		for(BasicSubnetBuilder subnetBuilder : subnets){
			builtSubnets.addAll(subnetBuilder.buildAll(newSubnet));
		}

		for(BasicNodeBuilder nodeBuilder : nodes){
			builtNodes.addAll(nodeBuilder.buildAll(newSubnet));
		}

		for(BasicLinkBuilder linkBuilder : links){
			builtLinks.addAll(linkBuilder.buildAll(newSubnet));
		}

		for(BasicDemandBuilder demandBuilder : demands){
			builtDemands.addAll(demandBuilder.buildAll(newSubnet));
		}

		for(BasicPathBuilder pathBuilder : paths){
			builtPaths.addAll(pathBuilder.buildAll(newSubnet));
		}

		newSubnet.setSubnets(builtSubnets);
		newSubnet.setNodes(builtNodes);
		newSubnet.setLinks(builtLinks);
		newSubnet.setDemands(builtDemands);
		newSubnet.setPaths(builtPaths);

		return newSubnet;
	}

	public BasicSubnet build(Subnet network, JsonObject jsonUpdates) {
		BasicSubnet newNetwork = new BasicSubnet(
			network,
			network.getName(),
			network.getDescription(),
			network.inDegrees(),
			network.getLat(),
			network.getLng(),
			network.getIcon(),
			network.getUnits());

        JsonNetworkParser jsonNetworkParser = new JsonNetworkParser(network);
        jsonNetworkParser.updateFromJson(jsonUpdates);

        JsonObject jsonNetwork = (JsonObject) jsonNetworkParser.getJsonNetwork();

		JsonArray jsonNodes = jsonNetwork.getJsonArray("nodes");
		JsonArray jsonLinks = jsonNetwork.getJsonArray("links");
		JsonArray jsonDemands = jsonNetwork.getJsonArray("demands");
		JsonArray jsonPaths = jsonNetwork.getJsonArray("paths");
		// JsonArray jsonSubnets = jsonNetwork.getJsonArray("subnets");

		// for (int i=0; i < jsonSubnets.size(); i++) {
		// 	builtSubnets.add(new BasicSubnet(newNetwork, jsonSubnets.getJsonObject(i)));
		// }
		// newNetwork.setSubnets(builtSubnets);

		for (int i=0; i < jsonNodes.size(); i++) {
			builtNodes.add(new BasicNode(newNetwork, jsonNodes.getJsonObject(i)));
		}
		newNetwork.setNodes(builtNodes);

		for (int i=0; i < jsonLinks.size(); i++) {
			builtLinks.add(new BasicLink(newNetwork, jsonLinks.getJsonObject(i)));
		}
		newNetwork.setLinks(builtLinks);
		newNetwork.resolveReferences();

		for (int i=0; i < jsonDemands.size(); i++) {
			builtDemands.add(new BasicDemand(newNetwork, jsonDemands.getJsonObject(i)));
		}
		newNetwork.setDemands(builtDemands);

		try {
			for (int i=0; i < jsonPaths.size(); i++) {
				System.out.println(jsonPaths.getJsonObject(i).toString());
				builtPaths.add(new BasicPath(newNetwork, jsonPaths.getJsonObject(i)));
			}
			newNetwork.setPaths(builtPaths);
		} catch (NullPointerException e) {

		}

		return newNetwork;

	}

	public BasicNode findChildNode(List<String> nodeNameSequence){
		if(nodeNameSequence == null){
			return null;
		}

		nodeNameSequence = new ArrayList<>(nodeNameSequence);

		if(nodeNameSequence.size() > 1){
			String subnetName = nodeNameSequence.remove(0);
			for(BasicSubnetBuilder childSubnet : subnets){
				if(childSubnet.getName().equals(subnetName)){
					return childSubnet.findChildNode(nodeNameSequence);
				}
			}

			return null;
		}else if(nodeNameSequence.size() == 1){
			String nodeName = nodeNameSequence.remove(0);

			for(BasicNode childNode : builtNodes) {
				if(childNode.getName().equals(nodeName)){
					return childNode;
				}
			}

			return null;
		}else{
			return null;
		}
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Override
	public String toString() {
		return "BasicSubnetBuilder(" + name + ")";
	}

}
