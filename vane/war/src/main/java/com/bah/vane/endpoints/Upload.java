package com.bah.vane.endpoints;

import java.nio.file.Path;
import java.nio.file.Paths;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.FileWriter;
import java.io.Reader;

import javax.json.JsonValue;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import com.bah.vane.builders.opnet.BasicSubnetBuilder;
import com.bah.vane.parsers.opnet.OpnetParser;
import com.bah.vane.parsers.opnet.OpnetSAXParser;
import com.bah.vane.parsers.opnet.OpnetXMLException;

/**
 * Servlet implementation class Upload
 */
@SuppressWarnings("serial")
@WebServlet("/upload")
@MultipartConfig
public class Upload extends JsonServlet {

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

		String name = request.getParameter("name");
		String description = request.getParameter("description");

		Part filePart = null;
		try{
			filePart = request.getPart("file");
		}catch(ServletException|IOException e){
			throw new JsonServletException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
										   "Error opening file", e);
		}

		if (filePart == null) throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "No file was attached to the request");

		Reader fileContent = null;
		try{
			fileContent = new InputStreamReader(filePart.getInputStream());
		}catch(IOException e){
			throw new JsonServletException(HttpServletResponse.SC_BAD_REQUEST, "Could not open file for reading", e);
		}

		OpnetParser parser = null;
		BasicSubnetBuilder rootNetworkBuilder = new BasicSubnetBuilder();

		try{
			parser = new OpnetSAXParser();
			parser.networkFromXML(fileContent, rootNetworkBuilder);
		} catch (OpnetXMLException e) {
			throw new JsonServletException(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An error occurred parsing the file", e);
		}

		rootNetworkBuilder.setName(name);
		rootNetworkBuilder.setDescription(description);
		com.bah.vane.interfaces.Subnet rootNetwork = rootNetworkBuilder.build();

		// Start a new session and attach this network to it
		HttpSession session = request.getSession(true);
		System.out.println("Started session " + session.getId());
		session.setAttribute("network", rootNetwork);

		EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();

		em.getTransaction().begin();
		em.persist(rootNetwork);
		em.getTransaction().commit();

		System.out.println("Created new network from upload: ");
		System.out.println(rootNetwork + " with ID " + rootNetwork.getId());

		JsonValue data = rootNetwork.toJson();

		// System.out.println("Writing json output...");
		// Path fPath = Paths.get("OPNET_XML.json");
		// try (FileWriter writer = new FileWriter(fPath.toString())) {
		// 	writer.write(data.toString());
		// } catch (IOException e) {
		// 	e.printStackTrace();
		// }

		em.close();

		return data;
	}
}
