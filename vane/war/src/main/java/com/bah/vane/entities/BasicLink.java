package com.bah.vane.entities;

// import java.math.BigDecimal;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Subnet;

@Entity
@Table(name="links")
public class BasicLink implements Link {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id")
	Integer id = null;

	@Column(name="name")
	String name;

	// @Column(name="type")
	// String type;

	@Column(name="model")
	String model;

	@Column(name="capacity")
	Long capacity = null;

	@Column(name="duplex")
	Boolean isDuplex;

	@Column(name="direction")
	String direction = null;

	// @Column(name="reverseLink")
	// Link reverseLink;

	@OneToOne(targetEntity=BasicLink.class)
	@JoinColumn(name="reverseLink")
	Link reverseLink = null;

	@ManyToOne(targetEntity=BasicSubnet.class)
	@JoinColumn(name="parent")
	Subnet parent;

	@ManyToOne(targetEntity=BasicNode.class)
	@JoinColumn(name="fromNode")
	Node fromNode;

	@ManyToOne(targetEntity=BasicNode.class)
	@JoinColumn(name="toNode")
	Node toNode;

	public BasicLink() {}

	public BasicLink(Subnet parent, String name, String model, Node fromNode, Node toNode, Boolean isDuplex){
		this.parent = parent;
		this.name = name;
		this.model = model;
		this.fromNode = fromNode;
		this.toNode = toNode;
		this.isDuplex = isDuplex;
		this.direction = "Forward";

		if (isDuplex) {
			this.reverseLink = new BasicLink(parent, name, model, toNode, fromNode, isDuplex, "Reverse", this);
		}

		this.capacity = null;
	}

	public BasicLink(Subnet parent, String name, String model, Node fromNode, Node toNode, Boolean isDuplex, String direction, Link reverseLink){
		this.parent = parent;
		this.name = name;
		this.model = model;
		this.fromNode = fromNode;
		this.toNode = toNode;
		this.isDuplex = isDuplex;
		this.direction = direction;
		this.reverseLink = reverseLink;
		this.capacity = null;
	}

	public BasicLink(Subnet parent, JsonObject jsonLink) {
		this.parent = parent;
		this.name = jsonLink.getString("name");
		this.model = jsonLink.getString("model");
		if (this.parent != null) {
			BasicNode fromNode = (BasicNode) this.parent.getNodeByName(jsonLink.getString("fromNodeName"));
			BasicNode toNode = (BasicNode) this.parent.getNodeByName(jsonLink.getString("toNodeName"));
			// BasicNode fromNode = (BasicNode) this.parent.getNodeById(jsonLink.getInt("fromNode"));
			// BasicNode toNode = (BasicNode) this.parent.getNodeById(jsonLink.getInt("toNode"));
			if (fromNode != null) {
				fromNode.addOutgoing(this);
				this.fromNode = fromNode;
			}
			if(toNode != null) {
				toNode.addIncoming(this);
				this.toNode = toNode;
			}
		}

		this.isDuplex = jsonLink.getBoolean("duplex");

		if (jsonLink.containsKey("direction")) {
			this.direction = jsonLink.getString("direction");
		} else {
			this.direction = "Forward";
		}

		if (jsonLink.containsKey("capacity")) {
			this.capacity = jsonLink.getJsonNumber("capacity").longValue();
			System.out.println("capacity: " + this.capacity);

		} else {
			this.capacity = null;
		}

	}

	@Override
	public Integer getId() {
		return id;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getModel() {
		return model;
	}

	@Override
	public Boolean isDuplex() {
		return isDuplex;
	}

	@Override
	public String getDirection() {
		return direction;
	}

	@Override
	public void setDirection(String direction) {
		this.direction = direction;
	}

	@Override
	public Subnet getParent() {
		return parent;
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
	public Long getCapacity() {
		return capacity;
	}

	@Override
	public void setCapacity(Long capacity) {
		this.capacity = capacity;
	}

	@Override
	public String toString() {
		return "BasicLink(" + name + ")";
	}

	@Override
	public JsonValue toJson() {

		JsonObjectBuilder output = Json.createObjectBuilder();

		try {
			output.add("id", id);
		} catch (NullPointerException e) {
			throw new NullPointerException("Link \"" + getName() + "\" is missing an ID.");
		}

		try {
			output.add("fromNode", fromNode.getId());
			// output.add("fromNodeName", fromNode.getName());
		} catch (NullPointerException e) {
			throw new NullPointerException("Link \"" + getName() + "\" is missing a source node.");
		}

		try {
			output.add("toNode", toNode.getId());
			// output.add("toNodeName", toNode.getName());
		} catch (NullPointerException e) {
			throw new NullPointerException("Link \"" + getName() + "\" is missing a destination node");
		}

		if (name != null) output.add("name", getName());
		if (model != null) output.add("model", getModel());
		if (capacity != null) output.add("capacity", getCapacity());
		if (isDuplex != null) output.add("duplex", isDuplex());
		if (direction != null) output.add("direction", getDirection());
		if (reverseLink != null) output.add("reverseLink", reverseLink.getId());

		return output.build();

	}

	@Override
	public Link getReverseLink() {
		return reverseLink;
	}

	@Override
	public void setReverseLink(Link reverseLink) {
		this.reverseLink = reverseLink;
	}

}
