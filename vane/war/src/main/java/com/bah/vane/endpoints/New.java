package com.bah.vane.endpoints;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonValue;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

// import com.bah.vane.builders.BasicSubnetBuilder;
import com.bah.vane.entities.BasicSubnet;
import com.bah.vane.parsers.json.JsonParser;

/**
 * Servlet implementation class New
 */
@SuppressWarnings("serial")
@WebServlet("/new")
public class New extends JsonServlet {

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    @Override
    protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException {
        throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "Only POST is allowed at the /upload endpoint.");
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    @Override
    protected JsonValue doJsonPost(HttpServletRequest request, HttpServletResponse response) throws JsonServletException {
        // End the current session
        // Note: session variable scoped to this block
        {
            HttpSession session = request.getSession(false);
            if(session != null){
                System.out.println("Ending session " + session.getId());
                session.invalidate();
            }else{
                System.out.println("No session");
            }
        }

        StringBuilder contentString = new StringBuilder();
        String s;
        try {
            while ((s = request.getReader().readLine()) != null) {
                contentString.append(s);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        JsonObject content = (JsonObject) JsonParser.jsonFromString(contentString.toString());

        String name = content.getString("name");
        String description = content.getString("description");

        BasicSubnet rootNetwork = new BasicSubnet(name, description);
        System.out.println("(lat, lng): " + "(" + rootNetwork.getLat() + ", " + rootNetwork.getLng() + ")");

        // Start a new session and attach this network to it
        HttpSession session = request.getSession(true);
        System.out.println("Started session " + session.getId());
        session.setAttribute("network", rootNetwork);

        EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();

        em.getTransaction().begin();
        em.persist(rootNetwork);
        em.getTransaction().commit();

        System.out.println("Committed new network to database: ");
        System.out.println(rootNetwork + " with ID " + rootNetwork.getId());

        JsonValue data = rootNetwork.toJson();

        em.close();

        return data;
    }
}
