package com.bah.vane.interfaces;

import java.math.BigDecimal;
import java.util.Map;

public interface Profile extends JsonSerializable {
	Map<BigDecimal, Long> getPointMap();
	long trafficAt(BigDecimal time);
	long trafficAt(int time);
}
