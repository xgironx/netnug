package com.bah.vane.parsers.opnet;

import static org.hamcrest.Matchers.*;

import static org.junit.Assert.*;

import org.junit.Test;

public class OpnetXMLExceptionTest {

	@Test
	public void testOpnetXMLExceptionThrowable() {
		Exception base = new Exception("Base exception");
		try{
			OpnetXMLException caused = new OpnetXMLException(base);
			assertThat(caused.getMessage(), equalTo("java.lang.Exception: Base exception"));
			assertThat(caused.getCause(), equalTo(base));
			throw caused;
		}catch(OpnetXMLException e){
			assertThat(e.getMessage(), equalTo("java.lang.Exception: Base exception"));
			assertThat(e.getCause(), equalTo(base));
		}
	}

	@Test
	public void testOpnetXMLExceptionString() {
		try{
			OpnetXMLException messaged = new OpnetXMLException("Has message");
			assertThat(messaged.getMessage(), equalTo("Has message"));
			assertThat(messaged.getCause(), equalTo(null));
			throw messaged;
		}catch(OpnetXMLException e){
			assertThat(e.getMessage(), equalTo("Has message"));
			assertThat(e.getCause(), equalTo(null));
		}
	}

}
