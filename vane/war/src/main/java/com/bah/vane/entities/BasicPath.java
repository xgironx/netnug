package com.bah.vane.entities;

import java.util.ArrayList;
import java.util.List;

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
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.bah.vane.interfaces.Path;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

@Entity
@Table(name="paths")
public class BasicPath implements Path {

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

    @ManyToOne(cascade=CascadeType.ALL, targetEntity=BasicProfile.class)
    @JoinColumn(name="profile")
    Profile profile;

    @ManyToMany
    @JoinTable(
        name="PATH_NODES",
        joinColumns=@JoinColumn(name="path_id", referencedColumnName="id"),
        inverseJoinColumns=@JoinColumn(name="node_id", referencedColumnName="id"))
    private List<BasicNode> pathNodes;

    public BasicPath(){}

    public BasicPath(Subnet parent, String name, String model, ArrayList<BasicNode> pathNodes, Profile profile){
        this.name = name;
        this.model = model;
        this.parent = parent;
        this.pathNodes = pathNodes;
        this.profile = profile;
    }

    public BasicPath(Subnet parent, JsonObject jsonPath) {
        this.name = jsonPath.getString("name");
        this.parent = parent;
        // if (this.parent != null) {
        //     this.fromNode = this.parent.getNodeByName(jsonPath.getString("fromNodeName"));
        //     this.toNode = this.parent.getNodeByName(jsonPath.getString("toNodeName"));
        // }

        BasicProfile profile = new BasicProfile();
        JsonArray jsonProfile = jsonPath.getJsonArray("profile");
        for (int i=0; i < jsonProfile.size(); i++) {
            JsonObject point = jsonProfile.getJsonObject(i);
            profile.addPoint(point.getJsonNumber("time").bigDecimalValue(),
                             point.getJsonNumber("amount").longValueExact());
        }
        this.profile = profile;

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
            throw new NullPointerException("Could not make JSON for path with name \"" + name + "\" because it has no ID");
        }

        if (name != null) json.add("name", name);
        if (model != null) json.add("model", model);

        // try{

        // }catch(NullPointerException e){
        //     throw new NullPointerException("Could not make JSON for path with name \"" + name + "\" because the from node ID could not be retrieved");
        // }

        if (profile != null) json.add("traffic", profile.toJson());

        return json.build();
    }

    @Override
    public Profile getProfile() {
        return profile;
    }

    @Override
    public String toString() {
        return "BasicPath(" + this.getName() + ")";
    }

    public List<BasicNode> getPathNodes() {
        return pathNodes;
    }

}
