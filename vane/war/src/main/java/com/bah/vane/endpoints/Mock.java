package com.bah.vane.endpoints;

import javax.json.JsonValue;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bah.vane.entities.BasicSubnet;

@SuppressWarnings("serial")
@WebServlet("/mock/*")
public class Mock extends JsonServlet {
    
	@Override
	protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
		EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();
		
		String idString = request.getParameter("id");
		
		if(idString == null) throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "Must include URL parameter \"id\"");
		
		Integer id = Integer.parseInt(idString);
		
		BasicSubnet network = (BasicSubnet)em.find(BasicSubnet.class, id);
		
		if(network == null) throw new JsonServletException(HttpServletResponse.SC_NOT_FOUND, "No network was found with ID " + id);

		em.close();

		return network.toJson();		
	}
}
