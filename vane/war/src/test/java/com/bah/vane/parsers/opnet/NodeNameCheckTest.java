package com.bah.vane.parsers.opnet;

import static org.hamcrest.Matchers.*;

import static org.junit.Assert.*;

import java.util.HashSet;
import java.util.Set;

import org.junit.Before;
import org.junit.Test;

public class NodeNameCheckTest {

	Set<String> blackList;
	Set<String> okStrings;
	
	@Before
	public void setUp() throws Exception {
		blackList = new HashSet<>();
		
		blackList.add("Ambiguous Source");
		blackList.add("Ambiguous Destination");
		blackList.add("Unknown Source");
		blackList.add("Unknown Destination");
		blackList.add("flan_config");
		blackList.add("import_information");
		
		okStrings = new HashSet<>();
		
		okStrings.add("");
		okStrings.add("this is a node");
		okStrings.add("ASPONPEOSCINPORIF");
		okStrings.add(null);
		okStrings.add("");
	}

	@Test
	public void testNameOkFalse() {
		for(String name : blackList){
			assertThat(NodeNameCheck.nameOk(name), equalTo(false));
		}
	}
	
	@Test
	public void testNameOkTrue() {
		for(String name : okStrings){
			assertThat(NodeNameCheck.nameOk(name), equalTo(true));
		}
	}

}
