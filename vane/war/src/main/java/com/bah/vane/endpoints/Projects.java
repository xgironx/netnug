package com.bah.vane.endpoints;

import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.TypedQuery;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bah.vane.entities.BasicSubnet;

/**
 * Servlet implementation class Projects
 */
@SuppressWarnings("serial")
@WebServlet("/projects")
public class Projects extends JsonServlet {

	@Override
	protected JsonValue doJsonGet(HttpServletRequest request, HttpServletResponse response){
		EntityManager em = ((EntityManagerFactory)this.getServletContext().getAttribute("emf")).createEntityManager();

		TypedQuery<BasicSubnet> query = em.createQuery("SELECT network FROM BasicSubnet AS network WHERE network.parent = null", BasicSubnet.class);
		List<BasicSubnet> networks = query.getResultList();

		JsonArrayBuilder outputArray = Json.createArrayBuilder();

		for(BasicSubnet project : networks){
			JsonObjectBuilder projectObject = Json.createObjectBuilder();

			if(project.getName() != null){
				projectObject.add("name", project.getName());
			}else{
				projectObject.add("name", JsonValue.NULL);
			}

			if(project.getDescription() != null){
				projectObject.add("description", project.getDescription());
			}else{
				projectObject.add("description", JsonValue.NULL);
			}

			projectObject.add("id", project.getId());

			projectObject.add("queued", project.isQueued());
			projectObject.add("analysisCount", project.getAnalysisCount());

			// Add project scenarios
			List<Integer> scenarioIds = project.getScenarios();
			System.out.println("Scenario IDs: " + scenarioIds.toString());
			JsonArrayBuilder jsonScenarioArray = Json.createArrayBuilder();

			for (Integer scenarioId : project.getScenarios()) {
				JsonObjectBuilder jsonScenario = Json.createObjectBuilder();

				BasicSubnet scenario = em.find(BasicSubnet.class, scenarioId);
				jsonScenario.add("id", scenario.getId());

				if (scenario.getName() != null) {
					jsonScenario.add("name", scenario.getName());
				} else {
					jsonScenario.add("name", JsonValue.NULL);
				}

				if (scenario.getDescription() != null) {
					jsonScenario.add("description", scenario.getDescription());
				} else {
					jsonScenario.add("description", JsonValue.NULL);
				}

				jsonScenario.add("queued", scenario.isQueued());
				jsonScenario.add("analysisCount", scenario.getAnalysisCount());

				jsonScenarioArray.add(jsonScenario);
			}
			projectObject.add("scenarios", jsonScenarioArray);

			outputArray.add(projectObject);
		}

		em.close();

		return outputArray.build();
	}

}
