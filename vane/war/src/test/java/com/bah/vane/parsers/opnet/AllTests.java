package com.bah.vane.parsers.opnet;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({
	AttrObjectTest.class,
	NodeNameCheckTest.class,
	OpnetSAXParserTest.class,
	OpnetXMLExceptionTest.class,
	UnknownOpnetObjectTest.class})
public class AllTests {

}
