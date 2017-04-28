package com.bah.vane.entities;

import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonValue;

import org.junit.Before;
import org.junit.Test;

public class BasicProfileTest {
	
	BasicProfile empty;
	BasicProfile oneValue;
	BasicProfile twoValue;
	BasicProfile threeValue;
	
	final BigDecimal past = (new BigDecimal(-3600)).stripTrailingZeros();
	final BigDecimal zero = (BigDecimal.ZERO).stripTrailingZeros();
	final BigDecimal halfhour = (new BigDecimal(1800)).stripTrailingZeros();
	final BigDecimal hour = (new BigDecimal(3600)).stripTrailingZeros();
	final BigDecimal hourandhalf = (new BigDecimal(5400)).stripTrailingZeros();
	final BigDecimal twohour = (new BigDecimal(7200)).stripTrailingZeros();
	final BigDecimal twohourandhalf = (new BigDecimal(9000)).stripTrailingZeros();

	@Before
	public void setUp() throws Exception {
		
		empty = new BasicProfile();
		
		oneValue = new BasicProfile();
		oneValue.addPoint(zero, 1000);
		
		twoValue = new BasicProfile();
		twoValue.addPoint(zero, 1000);
		twoValue.addPoint(hour, 10_000);
		
		threeValue = new BasicProfile();
		threeValue.addPoint(zero, 1000);
		threeValue.addPoint(hour, 10_000);
		threeValue.addPoint(twohour, 100_000);
		
	}

	@Test
	public void testToJson() {
		Map<BigDecimal, Long> correctElements = threeValue.getPointMap();
		
		JsonValue jsonVal = threeValue.toJson();
		
		assertThat("toJson() returns an array",
				jsonVal,
				instanceOf(JsonArray.class));
		
		JsonArray json = (JsonArray)jsonVal;
		
		assertThat("toJson() has the correct size",
				json,
				hasSize(correctElements.size()));
		
		for(JsonValue elementVal : json){
			assertThat("Element of toJson() is an object",
					elementVal,
					instanceOf(JsonObject.class));
			
			JsonObject element = (JsonObject)elementVal;
			
			assertThat("Element of toJson() has a time",
					element,
					hasKey("time"));
			assertThat("Element of toJson() has an amount",
					element,
					hasKey("amount"));
			assertThat("Element of toJson() doesn't have any extra fields",
					element.keySet(),
					hasSize(2));
			
			BigDecimal elementTime = element.getJsonNumber("time").bigDecimalValue();
			long elementAmount = element.getJsonNumber("amount").longValue();
			
			assertThat("time-amount pair is one of the correct elements",
					correctElements,
					hasEntry(elementTime, elementAmount));
		}
	}

	@Test
	public void testAddPoint() {
		empty.addPoint(new BigDecimal(0), 1000L);
		
		assertThat("Adding a point changes trafficAt(that point)",
				empty.trafficAt(zero),
				equalTo(1000L));
		assertThat("Adding a point changes trafficAt(future point)",
				empty.trafficAt(halfhour),
				equalTo(1000L));
		
		empty.addPoint(zero, 10_000L);
		
		assertThat("Adding over an existing point changes trafficAt(that point)",
				empty.trafficAt(new BigDecimal(0)),
				equalTo(10_000L));
		
		assertThat("Adding over an existing point changes trafficAt(future points)",
				empty.trafficAt(new BigDecimal(0)),
				equalTo(10_000L));
	}

	@Test
	public void testRemovePoint() {
		assertThat("Removing non-existant point returns false",
				empty.removePoint(zero),
				equalTo(false));
		
		assertThat("Removing an existant point returns true",
				oneValue.removePoint(new BigDecimal(0)),
				equalTo(true));
		
		assertThat("Removing a point changes getPoints()",
				oneValue.getPointMap().size(),
				equalTo(0));
		
		assertThat("Removing a point changes trafficAt(former point)",
				oneValue.trafficAt(zero),
				equalTo(0L));
		
		assertThat("Removing a point changes trafficAt(future point)",
				oneValue.trafficAt(halfhour),
				equalTo(0L));
	}

	@Test
	public void testGetPoints() {
		assertThat("empty has no points",
				empty.getPointMap().size(),
				equalTo(0));
		
		Map<BigDecimal, Long> correctValues = new HashMap<>();
		correctValues.put(zero, 1000L);
		
		assertThat("oneValue has correct points",
				oneValue.getPointMap(),
				equalTo(correctValues));
		
		correctValues.put(hour, 10_000L);
		
		assertThat("twoValue has correct points",
				twoValue.getPointMap(),
				equalTo(correctValues));
		
		correctValues.put(twohour, 100_000L);

		assertThat("threeValue has correct points",
				threeValue.getPointMap(),
				equalTo(correctValues));
	}

	@Test
	public void testTrafficAtBigDecimal() {
		assertThat("empty has correct traffic in the past",
				empty.trafficAt(past),
				equalTo(0L));
		assertThat("empty has correct traffic at 0",
				empty.trafficAt(zero),
				equalTo(0L));
		assertThat("empty has correct traffic at half an hour",
				empty.trafficAt(halfhour),
				equalTo(0L));
		
		assertThat("oneValue has correct traffic in the past",
				oneValue.trafficAt(past),
				equalTo(0L));
		assertThat("oneValue has correct traffic at 0",
				oneValue.trafficAt(zero),
				equalTo(1000L));
		assertThat("oneValue has correct traffic at half an hour",
				oneValue.trafficAt(halfhour),
				equalTo(1000L));
		
		assertThat("twoValue has correct traffic in the past",
				twoValue.trafficAt(past),
				equalTo(0L));
		assertThat("twoValue has correct traffic at 0",
				twoValue.trafficAt(zero),
				equalTo(1000L));
		assertThat("twoValue has correct traffic at half an hour",
				twoValue.trafficAt(halfhour),
				equalTo(1000L));
		assertThat("twoValue has correct traffic at 1 hour",
				twoValue.trafficAt(hour),
				equalTo(10_000L));
		assertThat("twoValue has correct traffic at 1.5 hour",
				twoValue.trafficAt(hourandhalf),
				equalTo(10_000L));

		assertThat("threeValue has correct traffic in the past",
				threeValue.trafficAt(past),
				equalTo(0L));
		assertThat("threeValue has correct traffic at 0",
				threeValue.trafficAt(zero),
				equalTo(1000L));
		assertThat("threeValue has correct traffic at half an hour",
				threeValue.trafficAt(halfhour),
				equalTo(1000L));
		assertThat("threeValue has correct traffic at 1 hour",
				threeValue.trafficAt(hour),
				equalTo(10_000L));
		assertThat("threeValue has correct traffic at 1.5 hour",
				threeValue.trafficAt(hourandhalf),
				equalTo(10_000L));
		assertThat("threeValue has correct traffic at 2 hour",
				threeValue.trafficAt(twohour),
				equalTo(100_000L));
		assertThat("threeValue has correct traffic at 2.5 hour",
				threeValue.trafficAt(twohourandhalf),
				equalTo(100_000L));
	}

	@Test
	public void testTrafficAtInt() {
		assertThat("empty has correct traffic in the past",
				empty.trafficAt(-1800),
				equalTo(0L));
		assertThat("empty has correct traffic at 0",
				empty.trafficAt(0),
				equalTo(0L));
		assertThat("empty has correct traffic at half an hour",
				empty.trafficAt(1800),
				equalTo(0L));
		
		assertThat("oneValue has correct traffic in the past",
				oneValue.trafficAt(-1800),
				equalTo(0L));
		assertThat("oneValue has correct traffic at 0",
				oneValue.trafficAt(0),
				equalTo(1000L));
		assertThat("oneValue has correct traffic at half an hour",
				oneValue.trafficAt(1800),
				equalTo(1000L));
		
		assertThat("twoValue has correct traffic in the past",
				twoValue.trafficAt(-1800),
				equalTo(0L));
		assertThat("twoValue has correct traffic at 0",
				twoValue.trafficAt(0),
				equalTo(1000L));
		assertThat("twoValue has correct traffic at half an hour",
				twoValue.trafficAt(1800),
				equalTo(1000L));
		assertThat("twoValue has correct traffic at 1 hour",
				twoValue.trafficAt(3600),
				equalTo(10_000L));
		assertThat("twoValue has correct traffic at 1.5 hour",
				twoValue.trafficAt(5400),
				equalTo(10_000L));

		assertThat("threeValue has correct traffic in the past",
				threeValue.trafficAt(-1800),
				equalTo(0L));
		assertThat("threeValue has correct traffic at 0",
				threeValue.trafficAt(0),
				equalTo(1000L));
		assertThat("threeValue has correct traffic at half an hour",
				threeValue.trafficAt(1800),
				equalTo(1000L));
		assertThat("threeValue has correct traffic at 1 hour",
				threeValue.trafficAt(3600),
				equalTo(10_000L));
		assertThat("threeValue has correct traffic at 1.5 hour",
				threeValue.trafficAt(5400),
				equalTo(10_000L));
		assertThat("threeValue has correct traffic at 2 hour",
				threeValue.trafficAt(7200),
				equalTo(100_000L));
		assertThat("threeValue has correct traffic at 2.5 hour",
				threeValue.trafficAt(9000),
				equalTo(100_000L));
	}
}
