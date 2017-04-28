package com.bah.vane.interfaces;

import java.util.Set;

public interface Subnet extends GraphObject, Location, JsonSerializable, Analysis {

	Set<? extends Node> getDirectNodes();
	Set<? extends Link> getDirectLinks();
	Set<? extends Demand> getDirectDemands();
	Set<? extends Path> getDirectPaths();
	Set<? extends Subnet> getDirectSubnets();

	Set<? extends Node> getAllNodes();
	Set<? extends Link> getAllLinks();
	Set<? extends Demand> getAllDemands();
	Set<? extends Path> getAllPaths();

	Node getNodeById(int id);
	Node getNodeByName(String name);
	Link getLinkById(int id);
	Link getLinkByName(String name);
	Link getDuplexLinkByNameAndDirection(String name, String direction);
	Demand getDemandById(int id);
	Path getPathById(int id);
	Subnet getSubnetById(int id);

	String getDescription();
	String getIcon();
	String getUnits();
}
