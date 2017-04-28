package com.bah.vane.endpoints;

import java.util.List;

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
 * Servlet implementation class Save
 */
@SuppressWarnings("serial")
@WebServlet("/save")
public class Save extends JsonServlet {
    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    @Override
    protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException {
        throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED,
            "Only POST is allowed at the /save endpoint.");
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
        BasicSubnet network = em.find(BasicSubnet.class, id);

        if (network == null) {
            throw new JsonServletException(HttpServletResponse.SC_NOT_FOUND, "No network was found with ID " + id);
        }

        // Parse the HTTP POST request content
        StringBuilder contentString = new StringBuilder();
        String s;
        try {
            while ((s = request.getReader().readLine()) != null) {
                contentString.append(s);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Convert content string to JSON object.
        JsonValue jsonUpdates = JsonParser.jsonFromString(contentString.toString());

        System.out.println("/save POST content...");
        System.out.println(jsonUpdates);

        // Build new BasicSubnet from the existing BasicSubnet and json updates in the POST content.
        BasicSubnetBuilder networkBuilder = new BasicSubnetBuilder();
        BasicSubnet newNetwork = networkBuilder.build(network, (JsonObject) jsonUpdates);

        BasicSubnet parentNetwork = network;
        while (parentNetwork.getParent() != null) {
            parentNetwork = (BasicSubnet) parentNetwork.getParent();
        }

        List<Integer> scenarios = parentNetwork.getScenarios();

        System.out.println("Before newNetwork commit: ");
        System.out.println(newNetwork + " with ID " + newNetwork.getId());

        newNetwork.setName(parentNetwork.getName() + " - Scenario " + Integer.toString(scenarios.size() + 1));

        em.getTransaction().begin();
        em.persist(newNetwork);
        em.getTransaction().commit();

        System.out.println("After newNetwork commit: ");
        System.out.println(newNetwork + " with ID " + newNetwork.getId());

        parentNetwork.addScenario(newNetwork.getId());

        em.getTransaction().begin();
        em.merge(parentNetwork);
        em.getTransaction().commit();

        JsonValue jsonNetwork = newNetwork.toJson();

        em.close();

        return jsonNetwork;

    }

}
