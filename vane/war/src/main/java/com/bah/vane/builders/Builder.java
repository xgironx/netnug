package com.bah.vane.builders;

import java.util.Collection;

import com.bah.vane.interfaces.Subnet;

/**
 * A Builder stores information about a particular object, then can produce many instances of it.
 * 
 * @author "Dan Dulaney <dulaney_daniel@bah.com>"
 *
 * @param <T> The object to be built
 */
public interface Builder<T> {

	/**
	 * Build an object with a given parent.
	 * <p>
	 * If a build would result in no objects (invalid-name node) or multiple objects (duplex link), build returns null.
	 * 
	 * @param parent The parent of the object.
	 * @return
	 */
	T build(Subnet parent);
	/**
	 * Build one or more objects with a given parent.
	 * <p>
	 * Will not return null, but collection may have any size.
	 * 
	 * @param parent The parent of the object.
	 * @return
	 */
	Collection<T> buildAll(Subnet parent);
	
}
