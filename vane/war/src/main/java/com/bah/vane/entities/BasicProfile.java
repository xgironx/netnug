package com.bah.vane.entities;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.NavigableSet;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonValue;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.bah.vane.interfaces.Profile;

@Entity
@Table(name="profiles")
public class BasicProfile implements Profile {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id")
	private Integer id;

	@OneToMany(cascade=CascadeType.ALL)
	@JoinColumn(name="profile")
	Set<Point> points = new TreeSet<>();

	@Override
	public JsonValue toJson() {
		JsonArrayBuilder array = Json.createArrayBuilder();

		for(Point point : points){
			array.add(
				Json.createObjectBuilder()
				.add("time", point.getTime())
				.add("amount", point.getAmount())
				.build()
			);
		}

		return array.build();
	}

	public void addPoint(BigDecimal time, long value) {
		Point newPoint = new Point(time.stripTrailingZeros(), value);

		points.remove(newPoint);
		points.add(newPoint);
	}

	public boolean removePoint(BigDecimal time){
		time = time.stripTrailingZeros();

		Point needle = new Point(time);

		return points.remove(needle);
	}

	@Override
	public Map<BigDecimal, Long> getPointMap() {
		Map<BigDecimal, Long> output = new TreeMap<>();

		for(Point p : points){
			output.put(p.getTime(), p.getAmount());
		}

		return Collections.unmodifiableMap(output);
	}

	@Override
	public long trafficAt(BigDecimal time) {
		time = time.stripTrailingZeros();

		Point needle = new Point(time);

		Point previous = ((NavigableSet<Point>)points).floor(needle);

		if(previous == null){
			return 0L;
		}else{
			return previous.getAmount();
		}
	}

	@Override
	public long trafficAt(int time){
		return trafficAt(new BigDecimal(time));
	}
}
