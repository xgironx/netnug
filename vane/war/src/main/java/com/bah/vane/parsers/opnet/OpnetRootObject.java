package com.bah.vane.parsers.opnet;

import com.bah.vane.interfaces.Subnet;

public interface OpnetRootObject extends OpnetObject {
	
	Subnet build();
	
}
