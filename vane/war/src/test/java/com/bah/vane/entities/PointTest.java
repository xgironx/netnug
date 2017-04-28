package com.bah.vane.entities;

import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;

import java.math.BigDecimal;

import org.junit.Before;
import org.junit.Test;

public class PointTest {

	@Before
	public void setUp() throws Exception {
	}

	@Test
	public void testPointBigDecimalLong() {
		Point p1 = new Point(new BigDecimal(1000), 1L);
		
		assertThat("First point has correct time",
				p1.getTime(),
				equalTo((new BigDecimal(1000)).stripTrailingZeros()));
		assertThat("First point has correct amount",
				p1.getAmount(),
				equalTo(1L));
		
		try{
			Point p2 = new Point(null, 2L);
			fail("Two-parameter construction should throw a NullPointerException on null input, but produced " + p2 + " instead");
		}catch(NullPointerException e){}
	}

	@Test
	public void testPointBigDecimal() {
		Point p1 = new Point(new BigDecimal(1000));
		
		assertThat("Single-item constructor has correct time",
				p1.getTime(),
				equalTo((new BigDecimal(1000)).stripTrailingZeros()));
		
		try{
			long amount = p1.getAmount();
			fail("Single constructor point should throw a NullPointerException when geting the amount, but it produced " + amount + " instead");
		}catch(NullPointerException e){}
		
		try{
			Point p2 = new Point(null);
			fail("Single constructor should throw a NullPointerException on a null argument, but it produced " + p2 + " instead");
		}catch(NullPointerException e){}
	}

	@Test
	public void testPoint() {
		Point p1 = new Point();
		
		assertThat("Empty constructor has null time",
				p1.getTime(),
				equalTo(null));
		
		try{
			long amount = p1.getAmount();
			fail("Single constructor point should throw a NullPointerException when geting the amount, but it produced " + amount + " instead");
		}catch(NullPointerException e){}
	}

	@Test
	public void testCompareTo() {
		Point[] p0 = new Point[]{
				new Point(BigDecimal.ZERO, 1L),
				new Point(BigDecimal.ZERO),
				new Point(BigDecimal.ZERO, 2L)
		};
		
		Point[] p1 = new Point[]{
				new Point(new BigDecimal(1000), 3L),
				new Point(new BigDecimal(1000).stripTrailingZeros()),
				new Point(new BigDecimal(1000).stripTrailingZeros(), 4L)
		};
		
		Point[] p2 = new Point[]{
				new Point(new BigDecimal(2000), 5L),
				new Point(new BigDecimal(2000).stripTrailingZeros()),
				new Point(new BigDecimal(2000).stripTrailingZeros(), 6L)
		};
		
		for(Point p : p0){
			for(Point o : p0){
				assertThat(p + " should be equal to " + o,
						p,
						comparesEqualTo(o));
			}
			for(Point o : p1){
				assertThat(p + " should be less than " + o,
						p,
						lessThan(o));
			}
			for(Point o : p2){
				assertThat(p + " should be less than " + o,
						p,
						lessThan(o));
			}
		}

		for(Point p : p1){
			for(Point o : p0){
				assertThat(p + " should be greater than " + o,
						p,
						greaterThan(o));
			}
			for(Point o : p1){
				assertThat(p + " should be equal to " + o,
						p,
						comparesEqualTo(o));
			}
			for(Point o : p2){
				assertThat(p + " should be less than " + o,
						p,
						lessThan(o));
			}
		}

		for(Point p : p2){
			for(Point o : p0){
				assertThat(p + " should be greater than " + o,
						p,
						greaterThan(o));
			}
			for(Point o : p1){
				assertThat(p + " should be greater than " + o,
						p,
						greaterThan(o));
			}
			for(Point o : p2){
				assertThat(p + " should be equal to " + o,
						p,
						comparesEqualTo(o));
			}
		}

	}

	@Test
	public void testGetTime() {
		Point p1 = new Point(new BigDecimal(1000));
		
		assertThat("First point has correct time",
				p1.getTime(),
				equalTo(new BigDecimal(1000).stripTrailingZeros()));
		assertThat("First point correctly normalized time",
				p1.getTime(),
				not(equalTo(new BigDecimal(1000))));
		
		Point p2 = new Point();
		
		assertThat("Second point has no time",
				p2.getTime(),
				equalTo(null));
	}

	@Test
	public void testGetAmount() {
		Point p1 = new Point(BigDecimal.ZERO, 1L);
		Point p2 = new Point(BigDecimal.ZERO, 1000L);
		Point p3 = new Point(BigDecimal.ZERO);
		Point p4 = new Point();
		
		assertThat("First point has correct amount",
				p1.getAmount(),
				equalTo(1L));
		assertThat("Second point has correct amount",
				p2.getAmount(),
				equalTo(1000L));
		
		try{
			long amount = p3.getAmount();
			fail("Third point should throw a NullPointerException on getAmount(), but instead returned " + amount);
		}catch(NullPointerException e){}
		try{
			long amount = p4.getAmount();
			fail("Fourth point should throw a NullPointerException on getAmount(), but instead returned " + amount);
		}catch(NullPointerException e){}
		
	}

}
