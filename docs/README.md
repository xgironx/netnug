# VANE Documentation

The VANE webapp consists of several components.

At the high level, there are:

- Webapp (HTML with AngularJS)
- RESTful API (JavaEE)
- Relational database (PostgreSQL)
- Backend processing (Java)

## Implementation Choices and Justifications

### Webapp

The goal is for the client to access VANE through their web browser. The client can direct their web browser to a URL, which serves the necessary files.

The entire webapp is served using static files (i.e. not JSP). It is written in HTML/CSS/JavaScript. Several JS libraries are used:

- AngularJS provides the framework. It is an industry-standard and extremely mature JS library, with a wide community of users and excellent 3rd-party support.
- Leaflet provides the map frontend. It is open source, with a stable, well-documented api.
- The ui-leaflet project library is used to connect Leaflet with AngularJS. It is open-source and has been widely used, though the documentation can be spotty.
- Bootstrap CSS libraries are used to style the webapp. Bootstrap is a simple, drop-in style library that is easy to extend as necessary.
  
The final component in the webapp is the mapping technology. The data used is from OpenStreetMap, but the tile server used is provided by MapBox. While MapBox is suitable for testing, it is an external server. However, Leaflet can be configured to use any tile server, so it would be possible to run a local tile server in the future if necessary.

### RESTful API

The webapp will get network data from the server through a RESTful HTTP API. The API has several endpoints that allow the webapp to request any piece of data, from entire networks to individual links.

The advantage of using the RESTful paradigm is twofold. First, it is already widely supported by both client and server frameworks, making it fast and easy to build. Second, it allows us the flexibility to define the API, then change the client or server as necessary.

The server is implemented in Java. It consists of several components.

- **Data model** Networks are represented on the server side using several JPA-compatible classes that represent Subnets, Links, Nodes, and Demands. By keeping the data model simple and small, we are able to easily serve and store the necessary network data.
- **Data storage** The Java Persistence API (JPA) allows for data storage and retrieval. Because JPA is a JavaEE standard, we can easily change implementations as necessary. Currently, we are using Hibernate. 
- **XML parsing** The Java SAX parser lets us quickly parse OPNET XML files. The parser is an interface that can accept and XML file stream and returns a top-level Subnet, so the parsing implementation is completely independent of the client-server structure.
- **API Endpoints** We have not yet chosen a structure to use for the API endpoints. At the moment, our test endpoints are simply implemented as Java servlets. However, we plan on using a JAX-RS implementation in the final development software.

### Data Store

The data is stored as an SQL-compatible relational database. Because the server uses JPA to interact with the database, the database's implementation details can be decided on independently of the server.

We chose PostgreSQL as the database implementation because it is free, fast, and scalable. It is available natively on Amazon RDS, so we can quickly get started using it. Additionally, RDS is highly scalable, so as our database needs grow, we can continue using PostgreSQL for the foreseeable future.

### Backend

Mel Sobotka is currently writing the backend libraries. They will accept network data as described in the data model section above, and run simulations that determine how data flows on the network.


## Usage workflow

### Step 1: Load the network

A network consists of subnets, nodes, links, and demands. It can be loaded as an OPNET XML file, which will be parsed by the server. The network data is stored in the database.

### Step 2: Review the network visualization

The client uses the RESTful API to request network data from the server, displaying it visually on a map.

### Step 3: Run a model

The client makes an API request, asking for a model to be run. The backend processing occurs on the server, and the results are provided to the client as an HTTP response to its request. The client will display those results on a map.

