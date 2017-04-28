package com.bah.vane.parsers;

import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;
import static org.easymock.EasyMock.*;

import org.junit.Before;
import org.junit.Test;

import com.bah.vane.interfaces.Profile;

public class TrafficProfileLookupTest {

	Profile[] profiles;
	String[] names;

	final int profileCount = 10;

	@Before
	public void setUp() throws Exception {
		profiles = new Profile[profileCount];
		names = new String[profileCount];
		for(int i = 0; i < profileCount; i++){
			profiles[i] = mock(Profile.class);
			replay(profiles[i]);

			names[i] = "Profile #" + i;
		}
	}

	@Test
	public void testAddGetProfile() throws Exception {
		for(int i = 0; i < profiles.length; i++){
			assertThat(names[i] + " is not found",
					TrafficProfileLookup.getProfile(names[i]),
					equalTo(null));

			try{
				TrafficProfileLookup.getProfileStrict(names[i]);
				fail("getProfileStrict(\"" + names[i] + "\") should throw a NoSuchFieldException, but didn't");
			}catch(NoSuchFieldException e){}
		}

		for(int addIndex = 0; addIndex < profiles.length; addIndex++){
			TrafficProfileLookup.addProfile(names[addIndex], profiles[addIndex]);

			for(int getIndex = 0; getIndex < profiles.length; getIndex++){
				if(getIndex > addIndex){
					assertThat("After adding " + names[addIndex] + ", " + names[getIndex] + " was not found (non-strict)",
							TrafficProfileLookup.getProfile(names[getIndex]),
							equalTo(null));
					try{
						TrafficProfileLookup.getProfileStrict(names[getIndex]);
						fail("After adding " + names[addIndex] + ", getProfileStrict(\"" + names[getIndex] + "\") should throw a NoSuchFieldException, but didn't");
					}catch(NoSuchFieldException e){}
				}else{
					assertThat("After adding " + names[addIndex] + ", " + names[getIndex] + " was found (non-strict)",
							TrafficProfileLookup.getProfile(names[getIndex]),
							equalTo(profiles[getIndex]));
					assertThat("After adding " + names[addIndex] + ", " + names[getIndex] + " was found (strict)",
							TrafficProfileLookup.getProfileStrict(names[getIndex]),
							equalTo(profiles[getIndex]));
				}
			}
		}
	}
}
