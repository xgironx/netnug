package com.bah.vane.interfaces;

import java.util.List;
import java.util.Set;

public interface Node extends GraphObject, Location, JsonSerializable {
	Set<? extends Link> getOutgoingLinks();
	Set<? extends Link> getIncomingLinks();
    List<? extends Path> getPaths();
    String getIcon();
}
