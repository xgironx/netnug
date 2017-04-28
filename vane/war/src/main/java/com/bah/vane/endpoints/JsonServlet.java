package com.bah.vane.endpoints;

import java.io.IOException;

import javax.json.Json;
import javax.json.JsonValue;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public abstract class JsonServlet extends HttpServlet {
		
	@Override
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		try{
			writeJson(response, doJsonDelete(request, response));
		}catch(JsonServletException e){
			handleJsonException(response, e);
		}catch(Exception e){
			handleException(response, e);
		}
	}
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		try{
			writeJson(response, doJsonGet(request, response));
		}catch(JsonServletException e){
			handleJsonException(response, e);
		}catch(Exception e){
			handleException(response, e);
		}
	}
	
	@Override
	protected void doHead(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		try{
			writeJson(response, doJsonHead(request, response));
		}catch(JsonServletException e){
			handleJsonException(response, e);
		}catch(Exception e){
			handleException(response, e);
		}
	}
	
	@Override
	protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		try{
			writeJson(response, doJsonOptions(request, response));
		}catch(JsonServletException e){
			handleJsonException(response, e);
		}catch(Exception e){
			handleException(response, e);
		}
	}
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		try{
			writeJson(response, doJsonPost(request, response));
		}catch(JsonServletException e){
			handleJsonException(response, e);
		}catch(Exception e){
			handleException(response, e);
		}
	}
	
	@Override
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		try{
			writeJson(response, doJsonPut(request, response));
		}catch(JsonServletException e){
			handleJsonException(response, e);
		}catch(Exception e){
			handleException(response, e);
		}
	}
	
	private void handleJsonException(HttpServletResponse response, JsonServletException e) throws IOException{
		e.printStackTrace();
		handleException(response, e.getMessage(), e.getStatus());
	}
	
	private void handleException(HttpServletResponse response, Exception e) throws IOException{
		e.printStackTrace();
		handleException(response, e.getMessage(), 500);
	}
	
	private void handleException(HttpServletResponse response, String message, int status) throws IOException{
		response.setStatus(status);
		response.getWriter().write(Json.createObjectBuilder()
				.add("status", status)
				.add("message", message)
				.add("error", true)
				.build().toString());
	}
	
	private void writeJson(HttpServletResponse response, JsonValue json) throws IOException{
		String jsonString = json.toString();
		
		response.addIntHeader("Content-Length", jsonString.length());
		response.addHeader("Content-Type", "application/json");
		
		response.getWriter().write(jsonString);
	}
	
	protected JsonValue doJsonDelete(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "DELETE is not implemented");
	}
	
	protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "GET is not implemented");
	}
	
	protected JsonValue doJsonHead(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "HEAD is not implemented");
	}
	
	protected JsonValue doJsonOptions(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "OPTIONS is not implemented");
	}
	
	protected JsonValue doJsonPost(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "POST is not implemented");
	}

	protected JsonValue doJsonPut(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "PUT is not implemented");
	}
		
}
