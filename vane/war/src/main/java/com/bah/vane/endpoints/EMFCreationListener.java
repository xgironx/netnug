package com.bah.vane.endpoints;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

/**
 * Application Lifecycle Listener implementation class EMFCreationListener
 *
 */
@WebListener
public class EMFCreationListener implements ServletContextListener {

    /**
     * Default constructor. 
     */
    public EMFCreationListener() {
        // TODO Auto-generated constructor stub
    }

	/**
     * @see ServletContextListener#contextDestroyed(ServletContextEvent)
     */
    public void contextDestroyed(ServletContextEvent sce)  { 
         EntityManagerFactory emf = (EntityManagerFactory) sce.getServletContext().getAttribute("emf");
         emf.close();
    }

	/**
     * @see ServletContextListener#contextInitialized(ServletContextEvent)
     */
    public void contextInitialized(ServletContextEvent sce)  { 
         EntityManagerFactory emf = Persistence.createEntityManagerFactory("local-db");
         sce.getServletContext().setAttribute("emf", emf);
    }
	
}
