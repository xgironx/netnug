package com.bah.vane.parsers.opnet;

import java.util.HashSet;
import java.util.Set;

/**
 * Some node names are valid.
 * Others aren't, and should be skipped.
 * This class is used to determine which is which (using a simple blacklist).
 * <p>
 * This class is abstract, but designed not to be subclassed. Just call NodeNameCheck.nameOk().
 * 
 * @author "Dan Dulaney <dulaney_daniel@bah.com>"
 */
public abstract class NodeNameCheck {

	/**
	 * A set for super-fast lookups.
	 */
	protected static Set<String> blackList = new HashSet<>(); 
	
	/**
	 * Fill the set with the node names that shouldn't be allowed.
	 */
	static {
		blackList.add("Ambiguous Source");
		blackList.add("Ambiguous Destination");
		blackList.add("Unknown Source");
		blackList.add("Unknown Destination");
		blackList.add("flan_config");
		blackList.add("import_information");
	}
	
	/**
	 * Check that a given name is acceptible.
	 * 
	 * @param name the name to be checked
	 * @return true if that name is acceptable, false otherwise
	 */
	public static boolean nameOk(String name){
		return !blackList.contains(name);
	}
	
}