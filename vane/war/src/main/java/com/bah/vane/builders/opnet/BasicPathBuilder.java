package com.bah.vane.builders.opnet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.bah.vane.entities.BasicPath;
import com.bah.vane.entities.BasicNode;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.builders.Builder;

import com.bah.vane.parsers.TrafficProfileLookup;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicPathBuilder implements Builder<BasicPath>, OpnetObject {

    String name;
    // private List<String> fromNodeName;
    // private List<String> toNodeName;
    // private List<String> pathNodeNames;
    // private Map<String, BasicNode> pathNodes = new HashMap<>();
    private ArrayList<List<String>> pathNodeNames = new ArrayList<List<String>>();
    private ArrayList<BasicNode> pathNodes = new ArrayList<BasicNode>();
    private String profileName;
    private String model;

    private BasicSubnetBuilder parentBuilder;

    public BasicPathBuilder(BasicSubnetBuilder parent){
        this.parentBuilder = parent;
    }


    @Override
    public void addAttr(String name, String value) throws SAXException {
        if(name.equals("name")){
            // Just get the name attribute
            this.name = value;
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
        if (tag.equals("path-element")) {
            String type = attr.getValue("type");
            if (type.equals("node")) {
                List<String> nodeName = Arrays.asList(attr.getValue("name").split("\\."));
                pathNodeNames.add(nodeName);
                return new UnknownOpnetObject("path-element");
            } else {
                // throw new SAXException("Unknown path-element type.");
                return new UnknownOpnetObject("path-element");
            }
        } else {
            return new UnknownOpnetObject(tag);
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public BasicPath build(Subnet parent) {

        for (List<String> nodeName : pathNodeNames) {
            BasicNode node = this.parentBuilder.findChildNode(nodeName);
            pathNodes.add(node);
        }

        BasicPath path = new BasicPath(parent, name, model, pathNodes, TrafficProfileLookup.getProfile(profileName));
        for (BasicNode node : path.getPathNodes()) {
            node.addPath(path);
        }

        return path;
    }

    @Override
    public Collection<BasicPath> buildAll(Subnet parent) {
        BasicPath builtPath = this.build(parent);
        if(builtPath == null){
            return new ArrayList<>();
        }

        return Arrays.asList(new BasicPath[]{builtPath});
    }

}
