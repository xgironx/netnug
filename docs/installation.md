# Full List of VANE Dependencies

## Webapp Front End

- [AngularJS](https://angularjs.org/) (1.5.8)
- [Angular Route](https://docs.angularjs.org/api/ngRoute) (1.5.8)
- [Angular Upload](https://github.com/leon/angular-upload) (1.0.13)
- [Leaflet](http://leafletjs.com/) (1.0.1)
- [TinyColor](https://github.com/bgrins/TinyColor) (1.4.1)

## Server WAR

- Java 8
- Hibernate Core
    - Group: `org.hibernate`
    - Artifact: `hibernate-core`
    - Version: `5.2.2.Final`
    - Could be replaced with any JPA 2.1 implementation
- PostgreSQL Driver
    - Group: `org.postgresql`
    - Artifact: `postgresql`
    - Version: `9.4.1211`
    - Could be replaced with any other JDBC driver compatible with the database
- Servlet API
    - Group: `javax.servlet`
    - Artifact: `javax.servlet-api`
    - Version: `3.1.0`
- JSONP API
    - Group: `javax.json`
    - Artifact: `javax.json-api`
    - Version: `1.0`
- JSONP Reference Implementation
    - Group: `org.glassfish`
    - Artifact: `javax.json`
    - Version: `1.0.4`
    - Could be replaced with any other JSONP implementation

## Architecture

- PostgreSQL (9.4)
	- Could be replaced with any database, as long as there is a compatible JDBC driver
- Tomcat (8.0.37)
    - Could be replaced with any other servlet implementor