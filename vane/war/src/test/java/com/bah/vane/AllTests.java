package com.bah.vane;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({com.bah.vane.builders.opnet.AllTests.class,
               com.bah.vane.entities.AllTests.class,
               com.bah.vane.parsers.AllTests.class,
               com.bah.vane.parsers.opnet.AllTests.class})
public class AllTests {

}
