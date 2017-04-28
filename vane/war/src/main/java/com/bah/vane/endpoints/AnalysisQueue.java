package com.bah.vane.endpoints;

import java.io.IOException;

import java.net.HttpURLConnection;

import javax.json.JsonObject;
import javax.json.JsonValue;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bah.vane.entities.BasicSubnet;

/**
 * Servlet implementation class AnalysisQueue
 */
@SuppressWarnings("serial")
@WebServlet("/queue")
public class AnalysisQueue extends JsonServlet {
	
	private static String MODELER_URL = "http://localhost:5000/";

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException {
		throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, 
			"Only POST is allowed at the /queue endpoint.");
	}


	@Override
	protected JsonValue doJsonPost(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		// Open database entity
		EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();
		
		// Grab and parse the ID string
		String idString = request.getParameter("id");
		
		if (idString == null) throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "Must include URL parameter \"id\"");
		
		Integer id;
		try {
			id = Integer.parseInt(idString);
		} catch (NumberFormatException e) {
			throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "Could not parse URL parameter \"id\"");
		}
		
		// Grab the network from the DB
		BasicSubnet network = (BasicSubnet)em.find(BasicSubnet.class, id);
		
		if (network == null) throw new JsonServletException(HttpServletResponse.SC_NOT_FOUND, "No network was found with ID " + id);
		
		em.close();
		
		return network.toJson();

	}

}
