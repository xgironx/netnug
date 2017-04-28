package com.bah.vane.parsers;

import java.util.HashMap;
import java.util.Map;

import com.bah.vane.interfaces.Profile;

public abstract class TrafficProfileLookup {

	private static Map<String, Profile> profiles = new HashMap<>();

	public static void addProfile(String name, Profile profile){
		profiles.put(name, profile);
	}

	public static Profile getProfile(String name){
		return profiles.get(name);
	}

	public static Profile getProfileStrict(String name) throws NoSuchFieldException{
		Profile result = getProfile(name);

		if(result == null) throw new NoSuchFieldException("Could not find profile with name \"" + name + "\"");

		return result;
	}
}
