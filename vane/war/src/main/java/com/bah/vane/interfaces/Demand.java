package com.bah.vane.interfaces;

public interface Demand extends Edge, GraphObject, JsonSerializable {
	Profile getProfile();
}
