package com.bah.vane.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.json.JsonObject;
import javax.json.JsonValue;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.CollectionTable;
import javax.persistence.ElementCollection;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Path;
import com.bah.vane.interfaces.Subnet;

@Entity
@Table(name="subnets")
public class BasicSubnet implements Subnet {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="id")
	private Integer id;

	@Column(name="name")
	private String name;

	@Column(name="description")
	private String description;

	@Column(name="units")
	private String units;

	@Column(name="degrees")
	private Boolean inDegrees = null;

	@Column(name="lat")
	private Double lat = null;

	@Column(name="lng")
	private Double lng = null;

	@Column(name="queued")
	private Boolean queued = false;

	// @Column(name="analyzed")
	// private Boolean analyzed = false;

	@Column(name="analysisCount")
	private Integer analysisCount = 0;

	@Column(name="icon")
	private String icon = null;

	@ElementCollection
	@CollectionTable(
		name="PROJECT_SCENARIOS",
		joinColumns=@JoinColumn(name="SUBNET_ID")
	)
	@Column(name="SCENARIO_ID")
	private List<Integer> scenarios = new ArrayList<Integer>();

	@ManyToOne(targetEntity=BasicSubnet.class)
	@JoinColumn(name="parent")
	private Subnet parent = null;

	@OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, targetEntity=BasicNode.class)
	@JoinColumn(name="parent")
	private Set<BasicNode> nodes = new HashSet<>();

	@OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, targetEntity=BasicLink.class)
	@JoinColumn(name="parent")
	private Set<BasicLink> links = new HashSet<>();

	@OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, targetEntity=BasicDemand.class)
	@JoinColumn(name="parent")
	private Set<BasicDemand> demands = new HashSet<>();

	@OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, targetEntity=BasicPath.class)
	@JoinColumn(name="parent")
	private Set<BasicPath> paths = new HashSet<>();

	@OneToMany(orphanRemoval=true, cascade=CascadeType.ALL, targetEntity=BasicSubnet.class)
	@JoinColumn(name="parent")
	private Set<BasicSubnet> subnets = new HashSet<>();

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
		return null;
	}

	@Override
	public Subnet getParent() {
		return parent;
	}

	@Override
	public String getUnits() {
		return units;
	}

	@Override
	public boolean hasLocation() {
		return lat != null && lng != null;
	}

	@Override
	public boolean inDegrees() {
		return hasLocation() && inDegrees;
	}

	@Override
	public Double getLat() {
		return lat;
	}

	@Override
	public Double getLng() {
		return lng;
	}

	@Override
	public String getDescription() {
		return description;
	}

	@Override
	public Integer getAnalysisCount() {
		return analysisCount;
	}

	@Override
	public Boolean isQueued() {
		return queued;
	}

	@Override
	public String getIcon() {
		return icon;
	}

	@Override
	public Set<? extends Node> getDirectNodes() {
		return Collections.unmodifiableSet(nodes);
	}

	@Override
	public Set<? extends Link> getDirectLinks() {
		return Collections.unmodifiableSet(links);
	}

	@Override
	public Set<? extends Demand> getDirectDemands() {
		return Collections.unmodifiableSet(demands);
	}

	@Override
	public Set<? extends Path> getDirectPaths() {
		return Collections.unmodifiableSet(paths);
	}

	@Override
	public Set<? extends Subnet> getDirectSubnets() {
		return Collections.unmodifiableSet(subnets);
	}

	@Override
	public Set<? extends Node> getAllNodes() {
		Set<Node> outputSet = new HashSet<>();

		outputSet.addAll(getDirectNodes());

		for (Subnet subnet : getDirectSubnets()) {
			outputSet.addAll(subnet.getAllNodes());
		}

		return Collections.unmodifiableSet(outputSet);
	}

	@Override
	public Set<? extends Link> getAllLinks() {
		Set<Link> outputSet = new HashSet<>();

		outputSet.addAll(getDirectLinks());

		for (Subnet subnet : getDirectSubnets()) {
			outputSet.addAll(subnet.getAllLinks());
		}

		return Collections.unmodifiableSet(outputSet);
	}

	@Override
	public Set<? extends Demand> getAllDemands() {
		Set<Demand> outputSet = new HashSet<>();

		outputSet.addAll(getDirectDemands());

		for (Subnet subnet : getDirectSubnets()) {
			outputSet.addAll(subnet.getAllDemands());
		}

		return Collections.unmodifiableSet(outputSet);
	}

	@Override
	public Set<? extends Path> getAllPaths() {
		Set<Path> outputSet = new HashSet<>();

		outputSet.addAll(getDirectPaths());

		for (Subnet subnet : getDirectSubnets()) {
			outputSet.addAll(subnet.getAllPaths());
		}

		return Collections.unmodifiableSet(outputSet);
	}

	@Override
	public Node getNodeById(int id) {
		for (Node node : nodes) {
			if (node.getId().equals(id)) {
				return node;
			}
		}

		for (Subnet subnet : subnets) {
			Node childSubnetResult = subnet.getNodeById(id);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}

		return null;
	}

	@Override
	public Node getNodeByName(String name) {
		for (Node node : nodes) {
			if (node.getName().equals(name)) {
				return node;
			}
		}

		for (Subnet subnet : subnets) {
			Node childSubnetResult = subnet.getNodeByName(name);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}

		return null;
	}

	@Override
	public Link getLinkById(int id) {
		for (Link link : links) {
			if (link.getId().equals(id)) {
				return link;
			}
		}

		for (Subnet subnet : subnets) {
			Link childSubnetResult = subnet.getLinkById(id);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}

		return null;
	}

	@Override
	public Link getLinkByName(String name) {
		for (Link link : links) {
			if (link.getName().equals(name)) {
				return link;
			}
		}

		for (Subnet subnet : subnets) {
			Link childSubnetResult = subnet.getLinkByName(name);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}

		return null;
	}

	@Override
	public Link getDuplexLinkByNameAndDirection(String name, String direction) {
		for (Link link : links) {
			if (link.isDuplex() && link.getName().equals(name) && link.getDirection().equals(direction)) {
				return link;
			}
		}

		for (Subnet subnet : subnets) {
			Link childSubnetResult = subnet.getDuplexLinkByNameAndDirection(name, direction);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}
		return null;
	}

	@Override
	public Demand getDemandById(int id) {
		for (Demand demand : demands) {
			if (demand.getId().equals(id)) {
				return demand;
			}
		}

		for (Subnet subnet : subnets) {
			Demand childSubnetResult = subnet.getDemandById(id);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}

		return null;
	}

	@Override
	public Path getPathById(int id) {
		for (Path path : paths) {
			if (path.getId().equals(id)) {
				return path;
			}
		}

		for (Subnet subnet : subnets) {
			Path childSubnetResult = subnet.getPathById(id);
			if (childSubnetResult != null) {
				return childSubnetResult;
			}
		}

		return null;
	}

	@Override
	public Subnet getSubnetById(int id) {

		for (Subnet subnet : subnets) {
			if (subnet.getId().equals(id)) {
				return subnet;
			}

			Subnet childSubnet = subnet.getSubnetById(id);
			if (childSubnet != null) {
				return childSubnet;
			}
		}

		return null;
	}

	@Override
	public JsonValue toJson() {

		JsonObjectBuilder output = Json.createObjectBuilder();

		try{
			output.add("id", getId());
		}catch(NullPointerException e) {
			throw new NullPointerException("Subnet \"" + getName() + "\" does not have an ID field");
		}
		if (getName() != null) {
			output.add("name", getName());
		}

		if (hasLocation()) {
			output.add("lat", getLat());
			output.add("lng", getLng());
			output.add("inDegrees", inDegrees());
		}

		if (getIcon() != null) output.add("icon", getIcon());

		JsonArrayBuilder nodeArray = Json.createArrayBuilder();
		JsonArrayBuilder linkArray = Json.createArrayBuilder();
		JsonArrayBuilder demandArray = Json.createArrayBuilder();
		JsonArrayBuilder pathArray = Json.createArrayBuilder();
		JsonArrayBuilder subnetArray = Json.createArrayBuilder();

		for (Node node : getDirectNodes()) {
			nodeArray.add(node.toJson());
		}

		for (Link link : getDirectLinks()) {
			linkArray.add(link.toJson());
		}

		for (Demand demand : getDirectDemands()) {
			demandArray.add(demand.toJson());
		}

		for (Path path : getDirectPaths()) {
			pathArray.add(path.toJson());
		}

		for (Subnet subnet : getDirectSubnets()) {
			if (!scenarios.contains(subnet.getId())) {
				subnetArray.add(subnet.toJson());
			}
		}

		output.add("nodes", nodeArray);
		output.add("links", linkArray);
		output.add("demands", demandArray);
		output.add("paths", pathArray);
		output.add("subnets", subnetArray);

		return output.build();

	}

	public BasicSubnet() {}

	public BasicSubnet(String name, String description) {
		this(null, name, description, true, 0.0, 0.0);
	}

	public BasicSubnet(Subnet parent, String name, String description, Boolean inDegrees,
					   Double lat, Double lng) {
		this(parent, name, description, inDegrees, lat, lng, "", "");
	}

	public BasicSubnet(Subnet parent, String name, String description, Boolean inDegrees,
					   Double lat, Double lng, String icon, String units) {
		this.parent = parent;
		this.name = name;
		this.description = description;
		this.inDegrees = inDegrees;
		this.lat = lat;
		this.lng = lng;
		this.queued = false;
		this.analysisCount = 0;
		this.icon = icon;
		this.units = units;
	}

	public BasicSubnet(Subnet parent, JsonObject jsonSubnet) {
		this.parent = parent;
		this.name = jsonSubnet.getString("name");
		this.description = jsonSubnet.getString("description");
	}

	public void setSubnets(Collection<BasicSubnet> subnets) {
		this.subnets = new HashSet<>(subnets);
	}

	public void setNodes(Collection<BasicNode> nodes) {
		this.nodes = new HashSet<>(nodes);
	}

	public void setLinks(Collection<BasicLink> links) {
		this.links = new HashSet<>(links);
	}

	public void setDemands(Collection<BasicDemand> demands) {
		this.demands = new HashSet<>(demands);
	}

	public void setPaths(Collection<BasicPath> paths) {
		this.paths = new HashSet<>(paths);
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public void setAnalysisCount(Integer count) {
		this.analysisCount = count;
	}

	public void setQueued(Boolean queued) {
		this.queued = queued;
	}

	public void incrementAnalysisCount() {
		this.analysisCount++;
	}

	public List<Integer> getScenarios() {
		return scenarios;
	}

	public void addScenario(Integer id) {
		scenarios.add(id);
	}

	public void resolveReferences() {
		for (BasicLink link : links) {
			if (link.isDuplex() && link.getDirection().equals("Forward") && link.getReverseLink() == null) {
				BasicLink reverseLink = (BasicLink) this.getDuplexLinkByNameAndDirection(link.getName(), "Reverse");

				if (reverseLink != null) {
					link.setReverseLink(reverseLink);
					reverseLink.setReverseLink(link);
				}
			}
		}
	}
}
