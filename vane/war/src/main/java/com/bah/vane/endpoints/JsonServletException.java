package com.bah.vane.endpoints;

import javax.servlet.ServletException;

@SuppressWarnings("serial")
public class JsonServletException extends ServletException {
	
	private int status;

	public JsonServletException(int status) {
		this.status = status;
	}

	public JsonServletException(int status, String message) {
		super(message);
		this.status = status;
	}

	public JsonServletException(int status, Throwable rootCause) {
		super(rootCause);
		this.status = status;
	}

	public JsonServletException(int status, String message, Throwable rootCause) {
		super(message, rootCause);
		this.status = status;
	}
	
	public int getStatus(){
		return this.status;
	}
}
