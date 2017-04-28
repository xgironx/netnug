package com.bah.vane.parsers.opnet;

import java.util.ArrayList;
import java.util.List;
import org.xml.sax.Attributes;

public class StubAttributes implements Attributes {

	private List<String> keys = new ArrayList<>();
	private List<String> values = new ArrayList<>();
	
	public StubAttributes(){}
	
	public StubAttributes(String[] keys, String[] values){
		int length;
		if(keys.length < values.length){
			length = keys.length;
		}else{
			length = values.length;
		}
		
		for(int i = 0; i < length; i++){
			this.keys.add(keys[i]);
			this.values.add(values[i]);
		}
	}
	
	public StubAttributes(String key, String value){
		keys.add(key);
		values.add(value);
	}
	
	public StubAttributes(String key, String value, String... additional){
		this(key, value);
		
		for(int i = 0; i < additional.length - 1; i += 2){
			keys.add(additional[i]);
			values.add(additional[i + 1]);
		}
	}
	
	@Override
	public int getLength() {
		return keys.size();
	}

	@Override
	public String getURI(int index) {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getLocalName(int index) {
		return this.keys.get(index);
	}

	@Override
	public String getQName(int index) {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getType(int index) {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getValue(int index) {
		return this.values.get(index);
	}

	@Override
	public int getIndex(String uri, String localName) {
		throw new UnsupportedOperationException();
	}

	@Override
	public int getIndex(String qName) {
		return this.keys.indexOf(qName);
	}

	@Override
	public String getType(String uri, String localName) {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getType(String qName) {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getValue(String uri, String localName) {
		throw new UnsupportedOperationException();
	}

	@Override
	public String getValue(String qName) {
		return this.values.get(getIndex(qName));
	}
}
