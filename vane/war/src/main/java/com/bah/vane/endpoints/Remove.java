package com.bah.vane.endpoints;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.FileWriter;

import java.net.HttpURLConnection;
import java.net.URL;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bah.vane.builders.opnet.BasicSubnetBuilder;
import com.bah.vane.entities.BasicSubnet;
import com.bah.vane.parsers.json.JsonParser;

/**
 * Servlet implementation class Remove
 */
@SuppressWarnings("serial")
@WebServlet("/remove")
public class Remove extends JsonServlet {
    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    @Override
    protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException {
        throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED,
            "Only POST is allowed at the /remove endpoint.");
    }

    @Override
    protected JsonValue doJsonPost(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
        // Open database entity
        EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();

        // Grab and parse the ID string
        String idString = request.getParameter("id");

        if (idString == null) {
            throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "Must include URL parameter \"id\"");
        }

        Integer id;
        try {
            id = Integer.parseInt(idString);
        } catch (NumberFormatException e) {
            throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "Could not parse URL parameter \"id\"");
        }

        // Get the stored network state from the DB
        BasicSubnet network = (BasicSubnet) em.find(BasicSubnet.class, id);

        if (network == null) {
            throw new JsonServletException(HttpServletResponse.SC_NOT_FOUND, "No network was found with ID " + id);
        }

        System.out.println("Removing network " + network.getId());

        em.getTransaction().begin();
        em.remove(network);
        em.getTransaction().commit();

        em.close();

        return JsonParser.jsonFromString("{}");

    }

}
