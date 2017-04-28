package com.bah.vane.builders.opnet;

import static org.junit.Assert.*;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;
import org.xml.sax.Attributes;

import com.bah.vane.entities.BasicProfile;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.parsers.opnet.OpnetObject;
import com.bah.vane.parsers.opnet.StubAttributes;
import com.bah.vane.parsers.opnet.UnknownOpnetObject;

public class BasicProfileBuilderTest {

	Subnet stubSubnet;
	BasicProfileBuilder empty, builder;

	@Before
	public void setUp() throws Exception {

		stubSubnet = mock(Subnet.class);
		replay(stubSubnet);

		Attributes attr1 = new StubAttributes(new String[]{"x", "y"}, new String[]{"0.0", "50,000.0"});
		Attributes attr2 = new StubAttributes(new String[]{"x", "y"}, new String[]{"3,600", "50,000.0"});

		empty = new BasicProfileBuilder();

		builder = new BasicProfileBuilder();
		builder.addAttr("name", "test profile");
		builder.addChild("point", attr1);
		builder.addChild("point", attr2);
	}

	@Test
	public void testAddAttrStringString() throws Exception {
		empty.addAttr("name", "foo");
		assertThat("Changing name overwrites having no name",
				empty.getName(),
				equalTo("foo"));

		empty.addAttr("name", "bar");
		assertThat("Changing name overwrites the existing name",
				empty.getName(),
				equalTo("bar"));
	}

	@Test
	public void testAddAttrAttributes() throws Exception {
		Attributes attrNameFoo = new StubAttributes(new String[]{"name"}, new String[]{"foo"});
		Attributes attrNameBar = new StubAttributes(new String[]{"name"}, new String[]{"bar"});

		empty.addAttr(attrNameFoo);
		assertThat("Changing name overwrites having no name",
				empty.getName(),
				equalTo("foo"));

		empty.addAttr(attrNameBar);
		assertThat("Changing name overwrites the existing name",
				empty.getName(),
				equalTo("bar"));
	}

	@Test
	public void testAddChild() throws Exception {
		Attributes pointAttrs1 = new StubAttributes(new String[]{"x", "y"}, new String[]{"7900", "1,000,000.0"});
		Attributes pointAttrs2 = new StubAttributes(new String[]{"x", "y"}, new String[]{"3600", "70,000"});

		Map<BigDecimal, Long> correct = new HashMap<>();
		correct.put(BigDecimal.ZERO.stripTrailingZeros(), 50_000L);
		correct.put((new BigDecimal(3600)).stripTrailingZeros(), 50_000L);
		correct.put((new BigDecimal(7900)).stripTrailingZeros(), 1_000_000L);

		assertThat("Unknown child returns an UnknownOpnetObject",
				builder.addChild("not a real tag", null),
				instanceOf(UnknownOpnetObject.class));

		OpnetObject returnValue = builder.addChild("point", pointAttrs1);
		assertThat("Point child returns an UnknownOpnetObject",
				returnValue,
				instanceOf(UnknownOpnetObject.class));
		assertThat("Adding a new point changes the point map",
				builder.build(stubSubnet).getPointMap(),
				equalTo(correct));

		correct.put((new BigDecimal(3600)).stripTrailingZeros(), 70_000L);
		returnValue = builder.addChild("point", pointAttrs2);
		assertThat("Point child returns an UnknownOpnetObject",
				returnValue,
				instanceOf(UnknownOpnetObject.class));
		assertThat("Overriding a point creates a new point map",
				builder.build(stubSubnet).getPointMap(),
				equalTo(correct));
	}

	@Test
	public void testGetName() {
		assertThat("Empty builder has no name",
				empty.getName(),
				equalTo(null));
		assertThat("Builder has correct name",
				builder.getName(),
				equalTo("test profile"));
	}

	@Test
	public void testBuild() {
		BasicProfile result = builder.build(stubSubnet);
		Map<BigDecimal, Long> resultPoints = result.getPointMap();
		Map<BigDecimal, Long> correctPoints = new HashMap<>();

		correctPoints.put(BigDecimal.ZERO, 50_000L);
		correctPoints.put((new BigDecimal(3600)).stripTrailingZeros(), 50_000L);

		assertThat("Build result has the correct point map",
				resultPoints,
				equalTo(correctPoints));

		assertThat("Empty builder has correct point map",
				empty.build(stubSubnet).getPointMap().size(),
				equalTo(0));

	}

	@Test
	public void testBuildAll() {
		Collection<BasicProfile> results = builder.buildAll(stubSubnet);

		Map<BigDecimal, Long> correctPoints = new HashMap<>();
		correctPoints.put(BigDecimal.ZERO.stripTrailingZeros(), 50_000L);
		correctPoints.put((new BigDecimal(3600)).stripTrailingZeros(), 50_000L);

		assertThat("Result collection has correct size",
				results,
				hasSize(1));

		assertThat("Empty results collection has the correct size",
				empty.buildAll(stubSubnet),
				hasSize(1));

		for(BasicProfile result : results){
			assertThat("Result point map is correct",
					result.getPointMap(),
					equalTo(correctPoints));
		}
	}

}
