package com.bah.vane.endpoints;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.FileWriter;

import java.util.Map;

import java.net.HttpURLConnection;
import java.net.URL;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import javax.json.JsonStructure;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bah.vane.entities.BasicSubnet;

import com.bah.vane.interfaces.Demand;
import com.bah.vane.interfaces.Link;
import com.bah.vane.interfaces.Node;
import com.bah.vane.interfaces.Profile;
import com.bah.vane.interfaces.Subnet;

import com.bah.vane.parsers.json.JsonParser;
import com.bah.vane.parsers.json.JsonNetworkParser;

/**
 * Servlet implementation class NetworkStudy
 */
@SuppressWarnings("serial")
@WebServlet("/network-study")
public class NetworkStudy extends JsonServlet {

    private static String MODELER_URL = "http://localhost:5000/network-study";

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    @Override
    protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response) throws JsonServletException {
        throw new JsonServletException(HttpServletResponse.SC_METHOD_NOT_ALLOWED,
            "Only POST is allowed at the /network-study endpoint.");
    }

    @Override
    protected JsonValue doJsonPost(HttpServletRequest request, HttpServletResponse response) throws JsonServletException{
        // Open database entity
        EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();

        // Grab and parse the ID string
        String idString = request.getParameter("id");
        String studyType = request.getParameter("type");

        System.out.println("Project id: " + idString);
        System.out.println("studyType: " + studyType);

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
        JsonObject studyData = (JsonObject) JsonParser.jsonFromString(contentString.toString());
        JsonObjectBuilder builder = Json.createObjectBuilder();

        System.out.println("/network-study POST content...");
        System.out.println(studyData);

        // Create new JsonNetworkParser
        JsonNetworkParser jsonNetworkParser = new JsonNetworkParser(network);

        if (studyData.getString("studyType").equals("Demand Failure")) {
            for (Map.Entry<String, JsonValue> entry : studyData.entrySet()) {

                if (entry.getValue() != JsonValue.NULL) {
                    builder.add(entry.getKey(), entry.getValue());
                }
            }
            // JsonArray demandIds = studyData.getJsonArray("demands");
            builder.add("network", jsonNetworkParser.getJsonNetwork());
            // builder.add("demands", jsonNetworkParser.getDemandsByIds(studyData.getJsonArray("demands")));
        }

        JsonObject jsonData = builder.build();
        // System.out.println(jsonData);

        // Establish connection to Flask server url.
        HttpURLConnection modelerConn;
        try{
            modelerConn = (HttpURLConnection)new URL(MODELER_URL).openConnection();
        }catch(IOException e){
            e.printStackTrace();
            throw new JsonServletException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not connect to the modeler");
        }

        // Send HTTP Post request to Flask modeler server with modeler Json data,
        // get response data and return Json data in HTTP response to original POST request.
        JsonValue modelerResult;
        try {
            modelerConn.setRequestMethod("POST");
            modelerConn.setDoOutput(true);
            modelerConn.setRequestProperty("Content-Type", "application/json");

            System.out.println("Sending POST request...");

            // Json.createWriter(modelerConn.getOutputStream()).write((JsonStructure) jsonNetwork);

            Json.createWriter(modelerConn.getOutputStream()).write((JsonStructure) jsonData);

            System.out.println("Got response from modeler: (Code " +
                modelerConn.getResponseCode() + ", " + modelerConn.getResponseMessage() + ")");

            // Parse response content
            InputStream is = modelerConn.getInputStream();
            // String encoding = modelerConn.getContentEncoding();
            // encoding = encoding == null ? "UTF-8" : encoding;

            modelerResult = JsonParser.jsonFromInputStream(is);

            System.out.println("POST request response content:");
            System.out.println(modelerResult.toString());

            is.close();

        } catch (IOException e) {
            e.printStackTrace();
            throw new JsonServletException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Could not connect to the modeler");
        }

        em.close();

        return modelerResult;

    }

}
