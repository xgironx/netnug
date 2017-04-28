package com.bah.vane.entities;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="points")
public class Point implements Comparable<Point>{
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="id")
	private Integer id;
	
	@Column(name="time")
	private BigDecimal time;
	
	@Column(name="amount")
	private Long amount;

	public Point(BigDecimal time, long amount){
		this.time = time.stripTrailingZeros();
		this.amount = amount;
	}
	
	public Point(BigDecimal time){
		this.time = time.stripTrailingZeros();
		this.amount = null;
	}
	
	Point(){
		this.time = null;
		this.amount = null;
	}
	
	@Override
	public int compareTo(Point o) {
		return this.getTime().compareTo(o.getTime());
	}
	
	public BigDecimal getTime(){
		return time;
	}
	
	public long getAmount(){
		return amount;
	}
}