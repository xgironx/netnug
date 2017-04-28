package com.bah.vane.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import javax.json.Json;
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
import javax.persistence.OneToMany;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Path;
import com.bah.vane.interfaces.Subnet;

@Entity
@Table(name="nodes")
public class BasicNode implements Node {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id")
	private Integer id = null;

	@Column(name="name")
	private String name;

	@Column(name="model")
	private String model;

	@Column(name="lat")
	private Double lat = null;

	@Column(name="lng")
	private Double lng = null;

	@Column(name="icon")
	private String icon = null;

	@ManyToOne(targetEntity=BasicSubnet.class)
	@JoinColumn(name="parent")
	private Subnet parent;

	@OneToMany(orphanRemoval=true, targetEntity=BasicLink.class)
	@JoinColumn(name="toNode")
	private Set<Link> incomingLinks = new HashSet<>();

	@OneToMany(orphanRemoval=true, targetEntity=BasicLink.class)
	@JoinColumn(name="fromNode")
	private Set<Link> outgoingLinks = new HashSet<>();

	@ManyToMany(mappedBy="pathNodes")
	private List<BasicPath> paths = new ArrayList<>();

	public BasicNode(){}

	public BasicNode(Subnet parent, String name, String model, Double lat, Double lng) {
		this(parent, name, model, lat, lng, "");
	}
	public BasicNode(Subnet parent, String name, String model, Double lat, Double lng, String icon) {
		this.parent = parent;
		this.name = name;
		this.model = model;
		this.lat = lat;
		this.lng = lng;
		this.icon = icon;

		// if (parent.getLat() != null) {
		// 	this.lat += parent.getLat();
		// }

		// if (parent.getLng() != null) {
		// 	this.lng += parent.getLng();
		// }
	}

	public BasicNode(Subnet parent, JsonObject jsonNode) {
		this.parent = parent;
		this.name = jsonNode.getString("name");
		this.model = jsonNode.getString("model");
		this.lat = jsonNode.getJsonNumber("lat").doubleValue();
		this.lng = jsonNode.getJsonNumber("lng").doubleValue();
		this.icon = jsonNode.getString("icon");
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
	public Subnet getParent() {
		return parent;
	}

	@Override
	public boolean hasLocation() {
		return lat != null && lng != null && parent.hasLocation();
	}

	@Override
	public boolean inDegrees() {
		return this.hasLocation() && parent.inDegrees();
	}

	@Override
	public Double getLat() {
		return hasLocation() ? lat : null;
	}

	@Override
	public Double getLng() {
		return hasLocation() ? lng : null;
	}

	@Override
	public Set<Link> getOutgoingLinks() {
		return Collections.unmodifiableSet(outgoingLinks);
	}

	@Override
	public Set<Link> getIncomingLinks() {
		return Collections.unmodifiableSet(incomingLinks);
	}

	@Override
	public List<BasicPath> getPaths() {
		// return Collections.unmodifiableSet(paths);
		return paths;
	}

	public void addOutgoing(Link outgoing){
		outgoingLinks.add(outgoing);
	}

	public void addIncoming(Link incoming){
		incomingLinks.add(incoming);
	}

	public void addPath(BasicPath path) {
		paths.add(path);
	}

	@Override
	public String getIcon() {
		return icon;
	}

	@Override
	public String toString(){
		return "BasicNode(" + name + ")";
	}

	@Override
	public JsonValue toJson(){
		JsonObjectBuilder output = Json.createObjectBuilder();

		try {
			output.add("id", getId());
		} catch (NullPointerException e) {
			throw new NullPointerException("Cannot build JSON when ID is not set");
		}

		if (getName() != null) output.add("name", getName());
		if (getModel() != null) output.add("model", getModel());

		if (hasLocation()) {
			output.add("lat", getLat());
			output.add("lng", getLng());
			output.add("inDegrees", inDegrees());
		}

		if (getIcon() != null) {
			output.add("icon", getIcon());
		} else {
			output.add("icon", "");
		}

		return output.build();
	}
}
