package com.bah.vane.builders.opnet;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.bah.vane.entities.BasicProfile;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.builders.Builder;
import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicProfileBuilder implements Builder<BasicProfile>, OpnetObject {

	private Map<BigDecimal, Long> points = new HashMap<>();
	@SuppressWarnings("unused")
	private String name, xUnits, yUnits;

	@Override
	public void addAttr(String name, String value) throws SAXException {
		if(name.equals("name")){
			this.name = value;
		}else if(name.equals("x_units")){
			this.xUnits = value;
		}else if(name.equals("y_units")){
			this.yUnits = value;
		}
	}

	@Override
	public void addAttr(Attributes attr) throws SAXException {
		for(int i = 0; i < attr.getLength(); i++){
			addAttr(attr.getLocalName(i), attr.getValue(i));
		}
	}

	@Override
	public OpnetObject addChild(String tag, Attributes attr) throws SAXException {
		if(tag.equals("point")){
			BigDecimal x;
			long y;

			DecimalFormat bigDecParser = new DecimalFormat();
			bigDecParser.setParseBigDecimal(true);

			DecimalFormat longParser = new DecimalFormat();

			try {
				if(attr.getValue("x").equals("undefined")) {
					x = BigDecimal.ZERO;
				} else {
					x = (BigDecimal) bigDecParser.parse(attr.getValue("x"));
				}
			} catch (ParseException e) {
				throw new SAXException("Could not parse x value of <point> tag");
			}

			try {
				if(attr.getValue("y").equals("undefined")){
					y = 0L;
				} else {
					y = longParser.parse(attr.getValue("y")).longValue();
				}
			} catch (ParseException e){
				e.printStackTrace();
				throw new SAXException("Could not parse y value of <point> tag");
			}

			points.put(x, y);

			return new UnknownOpnetObject("point");
		}else{
			return new UnknownOpnetObject(tag);
		}
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public BasicProfile build(Subnet parent) {
		BasicProfile profile = new BasicProfile();

		for(Map.Entry<BigDecimal, Long> entry : points.entrySet()){
			profile.addPoint(entry.getKey(), entry.getValue());
		}

		return profile;
	}

	@Override
	public Collection<BasicProfile> buildAll(Subnet parent) {
		Collection<BasicProfile> output = new ArrayList<>();
		output.add(build(parent));
		return output;
	}

}
