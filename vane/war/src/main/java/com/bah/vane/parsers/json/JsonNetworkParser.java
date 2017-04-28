package com.bah.vane.parsers.json;

import java.math.BigDecimal;

// import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

/**
 * A JsonNetworkParser returns a JsonObject representation of a Subnet object.
 *
 * @author "Andrew Merrill <merrill_andrew@bah.com>"
 */
public class JsonNetworkParser {

    private Subnet network;
    private JsonValue jsonNetwork;

    public JsonNetworkParser() {}

    public JsonNetworkParser(Subnet network) {
        this.network = network;
        this.jsonNetwork = JsonNetworkParser.toJson(network);
    }

    public Subnet getNetwork() {
        return this.network;
    }

    public JsonValue getJsonNetwork() {
        return this.jsonNetwork;
    }

    public void writeJsonNetwork(String filePath) {
        JsonParser.writeJson(filePath, this.jsonNetwork);
    }

    public JsonValue getDemandById(int id) {
        Demand demand = this.network.getDemandById(id);
        if (demand == null) {
            return JsonValue.NULL;
        }
        return demand.toJson();
    }

    public JsonArray getDemandsByIds(JsonArray demandIds) {
        JsonArrayBuilder demands = Json.createArrayBuilder();
        for (int i = 0; i < demandIds.size(); i++) {
            demands.add(getDemandById(demandIds.getInt(i)));
        }
        return demands.build();
    }

    // public static JsonArrayBuilder getJsonArrayBuilder(Profile profile) {
    //     return getJsonArrayBuilder(profile, null);
    // }

    public static JsonArrayBuilder getJsonArrayBuilder(Profile profile, JsonArray updatedProfile){
        if(profile == null) return Json.createArrayBuilder();

        JsonArrayBuilder profileArray = Json.createArrayBuilder();

        if (updatedProfile != null) {
            for (int i=0; i < updatedProfile.size(); i++) {
                JsonObject point = updatedProfile.getJsonObject(i);
                profileArray.add(Json.createObjectBuilder()
                    .add("time", point.getJsonNumber("time").bigDecimalValue())
                    .add("amount", point.getJsonNumber("amount").longValue()));
            }
        } else {
            for (Map.Entry<BigDecimal, Long> point : profile.getPointMap().entrySet()){
                profileArray.add(Json.createObjectBuilder()
                        .add("time", point.getKey())
                        .add("amount", point.getValue()));
            }
        }

        return profileArray;

    }

    public static JsonObjectBuilder getJsonObjectBuilder(Node node, JsonArray updatedNodes) {
        JsonObjectBuilder nodeOutput = Json.createObjectBuilder();

        nodeOutput.add("id", node.getId());
        nodeOutput.add("name", node.getName());
        nodeOutput.add("model", node.getModel());
        // nodeOutput.add("parentid", node.getParent().getId());

        if (node.hasLocation()) {
            nodeOutput.add("lat", node.getLat());
            nodeOutput.add("lng", node.getLng());
            nodeOutput.add("inDegrees", node.inDegrees());
        }

        nodeOutput.add("icon", node.getIcon());

        if (updatedNodes != null) {
            for (int i = 0; i < updatedNodes.size(); i++) {
                JsonObject jsonNode = updatedNodes.getJsonObject(i);
                if (node.getId() == jsonNode.getInt("id")) {
                    if ((jsonNode.containsKey("disabled") && jsonNode.getBoolean("disabled")) ||
                        (jsonNode.containsKey("flagged4Deletion") && jsonNode.getBoolean("flagged4Deletion"))) {
                        return Json.createObjectBuilder();
                    } else {
                        nodeOutput.add("name", jsonNode.getString("name"));
                        nodeOutput.add("lat", jsonNode.getJsonNumber("lat").doubleValue());
                        nodeOutput.add("lng", jsonNode.getJsonNumber("lng").doubleValue());
                        nodeOutput.add("model", jsonNode.getString("model"));
                        break;
                    }
                }
            }
        }
        return nodeOutput;
    }

    // public static JsonObjectBuilder getJsonObjectBuilder(Node node, JsonObject jsonNode) {
    //     JsonObjectBuilder nodeOutput = Json.createObjectBuilder();

    //     nodeOutput.add("id", node.getId());
    //     nodeOutput.add("name", node.getName());
    //     nodeOutput.add("model", node.getModel());
    //     // nodeOutput.add("parentid", node.getParent().getId());

    //     if (node.hasLocation()) {
    //         nodeOutput.add("lat", node.getLat());
    //         nodeOutput.add("lng", node.getLng());
    //         nodeOutput.add("inDegrees", node.inDegrees());
    //     }

    //     nodeOutput.add("icon", node.getIcon());

    //     if (jsonNode != null) {
    //         if (jsonNode.containsKey("disabled") && jsonNode.getBoolean("disabled")) {
    //             return Json.createObjectBuilder();
    //         } else {
    //             // TODO: Update nodeOutput with updates from jsonNode.
    //             break;
    //         }
    //     }
    //     return nodeOutput;
    // }

    // public static JsonObjectBuilder getJsonObjectBuilder(Link link){
    //     return getJsonObjectBuilder(link, null);
    // }

    public static JsonObjectBuilder getJsonObjectBuilder(Link link, JsonArray updatedLinks) {
        JsonObjectBuilder linkOutput = Json.createObjectBuilder();

        linkOutput.add("id", link.getId());
        linkOutput.add("fromNode", link.getFromNode().getId());
        linkOutput.add("fromNodeName", link.getFromNode().getName());
        linkOutput.add("toNode", link.getToNode().getId());
        linkOutput.add("toNodeName", link.getToNode().getName());
        linkOutput.add("name", link.getName());
        if (link.getModel() != null) {
            linkOutput.add("model", link.getModel());
        }
        if (link.getCapacity() != null) {
            linkOutput.add("capacity", link.getCapacity());
        }
        linkOutput.add("duplex", link.isDuplex());
        linkOutput.add("direction", link.getDirection());
        if (link.isDuplex()) {
            linkOutput.add("reverseLink", link.getReverseLink().getId());
        }

        if (updatedLinks != null) {
            for (int i=0; i < updatedLinks.size(); i++) {
                JsonObject jsonLink = updatedLinks.getJsonObject(i);
                if (link.getId() == jsonLink.getInt("id")) {
                    if ((jsonLink.containsKey("disabled") && jsonLink.getBoolean("disabled")) ||
                        (jsonLink.containsKey("flagged4Deletion") && jsonLink.getBoolean("flagged4Deletion"))) {
                        return Json.createObjectBuilder();
                    } else {
                        linkOutput.add("fromNodeName", jsonLink.getString("fromNodeName"));
                        linkOutput.add("toNodeName", jsonLink.getString("toNodeName"));
                        linkOutput.add("model", jsonLink.getString("model"));
                        linkOutput.add("capacity", jsonLink.getJsonNumber("capacity").longValue());
                        break;
                    }
                }
            }
        }

        return linkOutput;
    }

    // public static JsonObjectBuilder getJsonObjectBuilder(Demand demand){
    //     return getJsonObjectBuilder(demand, null);
    // }

    public static JsonObjectBuilder getJsonObjectBuilder(Demand demand, JsonArray updatedDemands) {
        JsonObjectBuilder demandOutput = Json.createObjectBuilder();

        demandOutput.add("id", demand.getId());
        demandOutput.add("fromNode", demand.getFromNode().getId());
        demandOutput.add("fromNodeName", demand.getFromNode().getName());
        demandOutput.add("toNode", demand.getToNode().getId());
        demandOutput.add("toNodeName", demand.getToNode().getName());
        if (demand.getName() != null) {
            demandOutput.add("name", demand.getName());
        }
        if (demand.getModel() != null) {
            demandOutput.add("model", demand.getModel());
        }
        demandOutput.add("profile", toJson(demand.getProfile()));

        if (updatedDemands != null) {
            for (int i=0; i < updatedDemands.size(); i++) {
                JsonObject jsonDemand = updatedDemands.getJsonObject(i);
                if (demand.getId() == jsonDemand.getInt("id")) {
                    if ((jsonDemand.containsKey("disabled") && jsonDemand.getBoolean("disabled")) ||
                        (jsonDemand.containsKey("flagged4Deletion") && jsonDemand.getBoolean("flagged4Deletion"))) {
                        return Json.createObjectBuilder();
                    } else {
                        // demandOutput.add("fromNodeName", jsonDemand.getString("fromNodeName"));
                        // demandOutput.add("toNodeName", jsonDemand.getString("toNodeName"));
                        demandOutput.add("profile", toJson(demand.getProfile(), jsonDemand.getJsonArray("profile")));
                        break;
                    }
                }
            }
        }

        return demandOutput;
    }

    public static JsonObjectBuilder getJsonObjectBuilder(Subnet network){
        return getJsonObjectBuilder(network, null);
    }

    public static JsonObjectBuilder getJsonObjectBuilder(Subnet network, JsonObject jsonUpdates) {
        Set<? extends Node> nodes = network.getAllNodes();
        Set<? extends Link> links = network.getAllLinks();
        Set<? extends Demand> demands = network.getAllDemands();

        // Set<? extends Node> nodes = network.getDirectNodes();
        // Set<? extends Link> links = network.getDirectLinks();
        // Set<? extends Demand> demands = network.getDirectDemands();
        // Set<? extends Subnet> subnets = network.getDirectSubnets();

        JsonArrayBuilder nodeArray = Json.createArrayBuilder();
        JsonArrayBuilder linkArray = Json.createArrayBuilder();
        JsonArrayBuilder demandArray = Json.createArrayBuilder();
        // JsonArrayBuilder subnetArray = Json.createArrayBuilder();

        if (jsonUpdates == null || jsonUpdates.isEmpty()) {
            for (Node node : nodes) {
                nodeArray.add(toJson(node));
            }

            for (Link link : links) {
                linkArray.add(toJson(link));
            }

            for (Demand demand : demands) {
                demandArray.add(toJson(demand));
            }

            // for (Subnet subnet : subnets){
            //     subnetArray.add(toJson(subnet));
            // }

            // for (Node node : nodes){
            //     nodeArray.add(node.toJson());
            // }

            // for (Link link : links){
            //     linkArray.add(link.toJson());
            // }

            // for (Demand demand : demands) {
            //     demandArray.add(demand.toJson());
            // }

            // for (Subnet subnet : subnets){
            //     subnetArray.add(subnet.toJson());
            // }

        } else {

            JsonArray updatedNodes = jsonUpdates.getJsonArray("nodes");
            JsonArray updatedLinks = jsonUpdates.getJsonArray("links");
            JsonArray updatedDemands = jsonUpdates.getJsonArray("demands");

            for (Node node : nodes) {
                JsonObject jsonNode = (JsonObject) toJson(node, updatedNodes);
                if (!jsonNode.isEmpty()) {
                    nodeArray.add(jsonNode);
                }
            }

            for (int i = 0; i < updatedNodes.size(); i++) {
                JsonObject jsonNode = updatedNodes.getJsonObject(i);
                Node node = network.getNodeById(jsonNode.getInt("id"));
                if (node == null) {
                    nodeArray.add(jsonNode);
                }
            }

            for (Link link : links){
                JsonObject jsonLink = (JsonObject) toJson(link, updatedLinks);
                if (!jsonLink.isEmpty()) {
                    linkArray.add(jsonLink);
                }
            }

            for (int i=0; i < updatedLinks.size(); i++) {
                JsonObject jsonLink = updatedLinks.getJsonObject(i);
                Link link = network.getLinkById(jsonLink.getInt("id"));
                if (link == null) {
                    linkArray.add(jsonLink);
                }
            }


            for (Demand demand : demands){
                JsonObject jsonDemand = (JsonObject) toJson(demand, updatedDemands);
                if (!jsonDemand.isEmpty()) {
                    demandArray.add(jsonDemand);
                }
            }

            for (int i = 0; i < updatedDemands.size(); i++) {
                JsonObject jsonDemand = updatedDemands.getJsonObject(i);
                Demand demand = network.getDemandById(jsonDemand.getInt("id"));
                if (demand == null) {
                    demandArray.add(jsonDemand);
                }
            }

            // for (Subnet subnet : subnets) {
            //     subnetArray.add(toJson(subnet, jsonUpdates));
            // }

        }

        JsonObjectBuilder builder = Json.createObjectBuilder();

        builder.add("nodes", nodeArray);
        builder.add("links", linkArray);
        builder.add("demands", demandArray);
        // builder.add("subnets", subnetArray);

        return builder;
    }

    public static JsonValue toJson(Profile profile){
        return profile.toJson();
    }

    public static JsonValue toJson(Profile profile, JsonArray updatedProfiles) {
        return getJsonArrayBuilder(profile, updatedProfiles).build();
    }

    public static JsonValue toJson(Node node){
        return node.toJson();
    }

    public static JsonValue toJson(Node node, JsonArray updatedNodes){
        return getJsonObjectBuilder(node, updatedNodes).build();
    }

    public static JsonValue toJson(Link link) {
        return link.toJson();
    }

    public static JsonValue toJson(Link link, JsonArray updatedLinks) {
        return getJsonObjectBuilder(link, updatedLinks).build();
    }

    public static JsonValue toJson(Demand demand) {
        return demand.toJson();
    }

    public static JsonValue toJson(Demand demand, JsonArray updatedDemands) {
        return getJsonObjectBuilder(demand, updatedDemands).build();
    }

    protected JsonValue toJson() {
        return getJsonObjectBuilder(this.network).build();
    }

    public static JsonValue toJson(Subnet subnet){
        return getJsonObjectBuilder(subnet).build();
    }

    public static JsonValue toJson(Subnet subnet, JsonObject jsonUpdates){
        return getJsonObjectBuilder(subnet, jsonUpdates).build();
    }

    public void updateFromJson(JsonValue jsonUpdates) {
        this.jsonNetwork = toJson(this.network, (JsonObject) jsonUpdates);
    }
}
