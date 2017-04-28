package com.bah.vane.entities;

import java.math.BigDecimal;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

@Entity
@Table(name="demands")
public class BasicDemand implements Demand {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id")
	Integer id;

	@Column(name="name")
	String name;

	@Column(name="model")
	String model;

	@ManyToOne(targetEntity=BasicSubnet.class)
	@JoinColumn(name="parent")
	Subnet parent;

	@ManyToOne(targetEntity=BasicNode.class)
	@JoinColumn(name="fromNode")
	Node fromNode;

	@ManyToOne(targetEntity=BasicNode.class)
	@JoinColumn(name="toNode")
	Node toNode;

	@ManyToOne(cascade=CascadeType.ALL, targetEntity=BasicProfile.class)
	@JoinColumn(name="profile")
	Profile profile;

	public BasicDemand(){}

	public BasicDemand(Subnet parent, String name, String model, Node fromNode, Node toNode, Profile profile){
		this.parent = parent;
		this.name = name;
		this.model = model;
		this.fromNode = fromNode;
		this.toNode = toNode;
		this.profile = profile;
	}

	public BasicDemand(Subnet parent, JsonObject jsonDemand) {
		this.parent = parent;
		this.name = jsonDemand.getString("name");
		if (this.parent != null) {
			this.fromNode = this.parent.getNodeByName(jsonDemand.getString("fromNodeName"));
			this.toNode = this.parent.getNodeByName(jsonDemand.getString("toNodeName"));
		}

		BasicProfile profile = new BasicProfile();
		JsonArray jsonProfile = jsonDemand.getJsonArray("profile");
		for (int i=0; i < jsonProfile.size(); i++) {
			JsonObject point = jsonProfile.getJsonObject(i);
			profile.addPoint(point.getJsonNumber("time").bigDecimalValue(),
							 point.getJsonNumber("amount").longValue());
		}
		this.profile = profile;

	}

	@Override
	public Node getToNode() {
		return toNode;
	}

	@Override
	public Node getFromNode() {
		return fromNode;
	}

	@Override
	public Integer getId() {
		return id;
	}

	@Override
	public String getModel() {
		return model;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public Subnet getParent() {
		return parent;
	}

	// TODO Change error checking to use bool array with sanity checks at beginning
	// Possibly encapsulated in a method call
	@Override
	public JsonValue toJson() {
		JsonObjectBuilder json = Json.createObjectBuilder();

		try{
			json.add("id", id);
		}catch(NullPointerException e){
			throw new NullPointerException("Could not make JSON for demand with name \"" + name + "\" because it has no ID");
		}

		if (name != null) json.add("name", name);
		if (model != null) json.add("model", model);

		try{
			json.add("fromNode", fromNode.getId());
			json.add("fromNodeName", fromNode.getName());
		}catch(NullPointerException e){
			throw new NullPointerException("Could not make JSON for demand with name \"" + name + "\" because the from node ID could not be retrieved");
		}

		try{
			json.add("toNode", toNode.getId());
			json.add("toNodeName", toNode.getName());
		}catch(NullPointerException e){
			throw new NullPointerException("Could not make JSON for demand with name \"" + name + "\" because the to node ID could not be retrieved");
		}

		if (profile != null) json.add("traffic", profile.toJson());

		return json.build();
	}

	@Override
	public Profile getProfile() {
		return profile;
	}

	@Override
	public String toString() {
		return "BasicDemand(" + this.getName() + ")";
	}

}
