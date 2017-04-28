# Development Environment Setup Guide (Windows)

Here we detail the steps necessary for setting up a development environment on a Windows OS.

## Downloading Dependencies

The first step is to download the required software dependencies. You will need the following:

* [Eclipse IDE Installer](https://eclipse.org/downloads/)
* [Java 8 SDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
* [Tomcat 8.5 Server](http://tomcat.apache.org/download-80.cgi)
    * You only need the core binary files available in the 64-bit Windows Zip [download](http://mirror.cogentco.com/pub/apache/tomcat/tomcat-8/v8.5.11/bin/apache-tomcat-8.5.11-windows-x64.zip)
* [Anaconda Python](https://www.continuum.io/downloads)
* [PostgreSQL Server](http://www.enterprisedb.com/products/pgdownload.do#windows)
* [Git](https://git-scm.com/downloads)

## Installation

### Eclipse

### Java SDK

### Tomcat Server

### Python

### PostgreSQL

### Git


Git is a source control management system. It connects to a remote repository, which it clones on your computer.

To verify that Git is installed, open a command line and run:

```
git --version
```

It should print version information.

## Configuration


### Maven

Maven is a Java build tool. It looks for a pom.xml file (which is committed to git repo), and uses the information it provides to build the necessary software.

To verify that Maven is installed, open a command line and run:

```
mvn --version
```

It should print version information.

### Tomcat (or any other Servlet container)

Tomcat is a server that allows us to run Java servlets. A collection of Java classes (usually bundled into a .war file) tells the server how to handle web requests.

To verify that Tomcat is installed correctly:

- Open a command line in your Tomcat installation directory
- Run `bin\startup.bat` (Windows) or `bin/startup.sh` (Unix). Startup information should appear in the command line
- Open a browser and navigate to http://localhost:8080/. You should see the Tomcat welcome page

### PostgreSQL

PostgreSQL (or just postgres) is an open-source relational database system, similar to MySQL or SQL Server.

To verify that PostgreSQL was installed correctly:

- Open a command line in your postgres install directory
- Run `bin\postgres` (Windows) or `bin/postgres` (Unix). This will start the database server
- Leave that command line open and open another one
- Run `bin\psql` (Windows) or `bin/psql` (Unix). This will use the command-line client to connect to the database server

## Acquiring and Compiling Source Code

### Step 1: Clone the Git repository

Note: This step only has to be done the first time. After setup is complete, skip to step 2.

`git clone` is a tool that creates a local copy of a Git repo to work with.

Run `git clone https://[username]:[password]@github.com/booz-allen-hamilton/mason-investment.git`, substituting your username and password into the statement. The URL can be found by clicking the "clone or download" box on the GitHub homepage.

This will create a folder called `mason-investment` in the current working directory.

### Step 2: Pull latest changes

`git pull` contacts the remote repository and grabs the latest changes, then merges them into the local repository.

Simply run `git pull` to grab the latest changes.

### Step 3: Checkout the current branch

`git checkout` unpacks an existing branch. It makes your working directory match the state of that branch when it was last committed.

Enter the `mason-investment` folder created in the previous step. In that folder, run `git checkout [branchname]`. The branch name will generally be either `master` or `dev`. `master` should only contain code that is reviewed and ready to be demonstrated. `dev` should contain working drafts of code that *probably* works, but still has some issues.

### Step 4: Build the code

`mvn install` runs the full Maven build cycle, producing the .war file we need for the server.

Simply run `mvn install` in the command line. The first time it is run, it has to download all of the dependencies from the Internet, which can take several minutes. When it finishes, there will be a file called war.war located at `vane\war\target\war.war`. That is the file necessary for the next section. It contains all of the code (both Java server-side code and static files that the client will run).

Note: By default, `mvn install` runs all available tests on the code. If any tests fail, it aborts. To skip running tests, use `mvn install -DskipTests`.

## Deployment and Server Management

### Step 1: Start the server

Go to your Tomcat directory. Run the file `bin\startup.bat` to start your server. By default, it will start using port 8080 to listen for HTTP requests. Go to http://localhost:8080/ and confirm that you see the welcome webpage.

### Step 2: Configure and start the database

The webapp expects to be able to connect to a PostgreSQL server running on localhost:5432. It will use the credentials given in `mason-investment\vane\war\src\main\resources\META-INF\persistence.xml`, so be sure to set the username, password, port, and database name to match that file.

Do the following steps:

- [Download](http://www.enterprisedb.com/products-services-training/pgdownload#windows) the installer. Be sure to pick 32/64 bit appropriately.
- Run the installer. You might need administrator permissions.
- You will be prompted for a username, password, and port. Look in [persistence.xml](/vane/war/src/main/resources/META-INF/persistence.xml) to see the correct values. When this was last updated, the username was `postgres`, the password was `password`, and the port was `5432`, but that could change.
	- You can change a username or password (for example, if there's already an existing postgres installation) with `ALTER USER` (see [here](https://www.postgresql.org/docs/current/static/sql-alteruser.html)).
	- You can create a new user with `CREATE USER` (see [here](https://www.postgresql.org/docs/current/static/app-createuser.html))
- The server is expecting to find a database called `vane`. The first thing to do is to run the `psql` command line utility. Then run `CREATE DATABASE vane` (or [read the docs](https://www.postgresql.org/docs/current/static/sql-createdatabase.html) for more info).
- Finally, the server is expecting several tables to already exist within `vane`. Use `psql` to run [reset.sql](/vane/src/main/sql/reset.sql), which will create those tables. Note that if there is any data in the database, it will be removed. You can either copy-paste the contents of reset.sql into the command line, or use the  `\i` command, as documented [here](https://www.postgresql.org/docs/9.2/static/app-psql.html).

At this point, PostgreSQL should be running. You can check that it's working in the future by running `psql` and trying to connect. You can check that the correct tables exist by running `\dt` in `psql`, which lists all of the current tables.

### Step 3: Add the .war file to the server

.war files can be placed in your Tomcat `webapps` folder, which should be directly in the main Tomcat folder.

Copy the war.war file from the previous section (located at `mason-investment\vane\war\target\war.war`) into the `webapps` folder. This will start up the webapp at http://localhost:8080/war/.

## Optional Configuration

### Using Tomcat's Manager GUI

Instead of modifying the files yourself, you can take advantage of Tomcat's built-in web service manager, located by default at http://localhost:8080/manager/. You have to configure a tomcat user to have to `gui-manager` role.

Follow [these](https://www.mkyong.com/tomcat/tomcat-default-administrator-password/) directions:

- Edit the `[tomcatdirectory]/conf/tomcat-users.xml`
- Add XML code so that the file looks something like:
```xml
<tomcat-users>
	<role rolename="manager-gui"/>
	<user username="[desiredusername]" password="[somethinglongandrandom]" roles="manager-gui"/>
</tomcat-users>
```
- Go to http://localhost:8080/manager/ and enter the username and password you used above when when you are prompted

### Change the Context Path

By default, Tomcat runs the webapp using a context path that is the same as the .war file name (so our war.war file ends up running on http://localhost:8080/war/). You can change that in two ways.

#### Simple: Rename the .war before copying

Rename the war.war file to ROOT.war. ROOT will always correspond to the top-level context.

#### Complex: Configuration file

Follow [these](http://stackoverflow.com/questions/7276989/howto-set-the-context-path-of-a-web-application-in-tomcat-7-0) directions:

- Create a file `[tomcatdirectory]/conf/Catalina/localhost/ROOT.xml`
- In that file, enter the following code:
```xml
<Context
  docBase="[pathtoyourwar]"
  path=""
  reloadable="true"
/>
```

Another advantage of this is that you can put your .war file anywhere as long as you list it here. The following code would automatically republish the .war whenever it changed:
```xml
<Context
  docBase="C:\[whatever]\mason-investment\vane\war\target\war.war"
  path=""
  reloadable="true"
/>
```

## Common Error Messages (and example Tomcat logs)

### Example successful startup

On a successful startup, the Tomcat log will look something like this:

```
Dec 08, 2016 12:14:36 PM org.apache.tomcat.util.digester.SetPropertiesRule begin
WARNING: [SetPropertiesRule]{Server/Service/Engine/Host/Context} Setting property 'source' to 'org.eclipse.jst.jee.server:war' did not find a matching property.
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Server version:        Apache Tomcat/8.0.37
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Server built:          Sep 1 2016 10:01:52 UTC
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Server number:         8.0.37.0
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: OS Name:               Windows 7
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: OS Version:            6.1
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Architecture:          amd64
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Java Home:             C:\Program Files\Java\jdk1.8.0_102\jre
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: JVM Version:           1.8.0_102-b14
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: JVM Vendor:            Oracle Corporation
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: CATALINA_BASE:         C:\Users\583019\git\mason-investment\.metadata\.plugins\org.eclipse.wst.server.core\tmp0
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: CATALINA_HOME:         C:\Users\583019\tomcat\apache-tomcat-8.0.37
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dcatalina.base=C:\Users\583019\git\mason-investment\.metadata\.plugins\org.eclipse.wst.server.core\tmp0
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dcatalina.home=C:\Users\583019\tomcat\apache-tomcat-8.0.37
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dwtp.deploy=C:\Users\583019\git\mason-investment\.metadata\.plugins\org.eclipse.wst.server.core\tmp0\wtpwebapps
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Djava.endorsed.dirs=C:\Users\583019\tomcat\apache-tomcat-8.0.37\endorsed
Dec 08, 2016 12:14:36 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dfile.encoding=Cp1252
Dec 08, 2016 12:14:36 PM org.apache.catalina.core.AprLifecycleListener lifecycleEvent
INFO: The APR based Apache Tomcat Native library which allows optimal performance in production environments was not found on the java.library.path: C:\Program Files\Java\jdk1.8.0_102\bin;C:\Windows\Sun\Java\bin;C:\Windows\system32;C:\Windows;C:/Program Files/Java/jre1.8.0_112/bin/server;C:/Program Files/Java/jre1.8.0_112/bin;C:/Program Files/Java/jre1.8.0_112/lib/amd64;C:\ProgramData\Oracle\Java\javapath;C:\Program Files\Java\jdk1.8.0_102\bin;C:\Program Files\Common Files\Microsoft Shared\Microsoft Online Services;C:\Program Files (x86)\Common Files\Microsoft Shared\Microsoft Online Services;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\QuickTime\QTSystem\;C:\Program Files (x86)\Common Files\Roxio Shared\DLLShared\;C:\Program Files (x86)\Common Files\Roxio Shared\10.0\DLLShared\;C:\Program Files (x86)\Hewlett-Packard\HP ProtectTools Security Manager\Bin\;C:\Program Files\Intel\WiFi\bin\;C:\Program Files\Common Files\Intel\WirelessCommon\;C:\Users\583019\AppData\Local\Programs\Python\Python35-32;"C:\Program Files (x86)\Sqlite";C:\Program Files\nodejs\;C:\Program Files (x86)\Windows Kits\8.1\Windows Performance Toolkit\;"C:\Program Files\Putty";"C:\Program Files\Maven\bin";C:\Users\583019\AppData\Local\Programs\Git\cmd;C:\Program Files\Docker Toolbox;C:\Users\583019\AppData\Local\Continuum\Anaconda2;C:\Users\583019\AppData\Local\Continuum\Anaconda2\Scripts;C:\Users\583019\AppData\Local\Continuum\Anaconda2\Library\bin;C:\Users\583019\AppData\Local\Google\Chrome\Application;C:\ProgramData\Oracle\Java\javapath;C:\Program Files\Common Files\Microsoft Shared\Microsoft Online Services;C:\Program Files (x86)\Common Files\Microsoft Shared\Microsoft Online Services;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\QuickTime\QTSystem\;C:\Program Files (x86)\Common Files\Roxio Shared\DLLShared\;C:\Program Files (x86)\Common Files\Roxio Shared\10.0\DLLShared\;C:\Program Files (x86)\Hewlett-Packard\HP ProtectTools Security Manager\Bin\;C:\Program Files\Intel\WiFi\bin\;C:\Program Files\Common Files\Intel\WirelessCommon\;C:\Users\583019\AppData\Local\Programs\Python\Python35-32;"C:\Users\583019\AppData\Local\Programs\Git\bin";C:\Users\583019\AppData\Roaming\npm;"C:\Program Files\PostgreSQL\9.6\bin";C:\Users\583019\AppData\Local\Pandoc\;C:\Users\583019\AppData\Local\cURL;C:\Program Files\Docker Toolbox;C:\Users\583019\eclipse\java-neon\eclipse;;.
Dec 08, 2016 12:14:37 PM org.apache.coyote.AbstractProtocol init
INFO: Initializing ProtocolHandler ["http-nio-8080"]
Dec 08, 2016 12:14:38 PM org.apache.tomcat.util.net.NioSelectorPool getSharedSelector
INFO: Using a shared selector for servlet write/read
Dec 08, 2016 12:14:38 PM org.apache.coyote.AbstractProtocol init
INFO: Initializing ProtocolHandler ["ajp-nio-8009"]
Dec 08, 2016 12:14:38 PM org.apache.tomcat.util.net.NioSelectorPool getSharedSelector
INFO: Using a shared selector for servlet write/read
Dec 08, 2016 12:14:38 PM org.apache.catalina.startup.Catalina load
INFO: Initialization processed in 2002 ms
Dec 08, 2016 12:14:38 PM org.apache.catalina.core.StandardService startInternal
INFO: Starting service Catalina
Dec 08, 2016 12:14:38 PM org.apache.catalina.core.StandardEngine startInternal
INFO: Starting Servlet Engine: Apache Tomcat/8.0.37
Dec 08, 2016 12:14:40 PM org.apache.jasper.servlet.TldScanner scanJars
INFO: At least one JAR was scanned for TLDs yet contained no TLDs. Enable debug logging for this logger for a complete list of JARs that were scanned but no TLDs were found in them. Skipping unneeded JARs during scanning can improve startup time and JSP compilation time.
Dec 08, 2016 12:14:40 PM org.hibernate.jpa.internal.util.LogHelper logPersistenceUnitInformation
INFO: HHH000204: Processing PersistenceUnitInfo [
	name: local-db
	...]
Dec 08, 2016 12:14:41 PM org.hibernate.Version logVersion
INFO: HHH000412: Hibernate Core {5.2.4.Final}
Dec 08, 2016 12:14:41 PM org.hibernate.cfg.Environment <clinit>
INFO: HHH000206: hibernate.properties not found
Dec 08, 2016 12:14:41 PM org.hibernate.cfg.Environment buildBytecodeProvider
INFO: HHH000021: Bytecode provider name : javassist
Dec 08, 2016 12:14:41 PM org.hibernate.annotations.common.reflection.java.JavaReflectionManager <clinit>
INFO: HCANN000001: Hibernate Commons Annotations {5.0.1.Final}
Dec 08, 2016 12:14:42 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl configure
WARN: HHH10001002: Using Hibernate built-in connection pool (not for production use!)
Dec 08, 2016 12:14:42 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl buildCreator
INFO: HHH10001005: using driver [org.postgresql.Driver] at URL [jdbc:postgresql://localhost:5432/vane]
Dec 08, 2016 12:14:42 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl buildCreator
INFO: HHH10001001: Connection properties: {user=postgres, password=****}
Dec 08, 2016 12:14:42 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl buildCreator
INFO: HHH10001003: Autocommit mode: false
Dec 08, 2016 12:14:42 PM org.hibernate.engine.jdbc.connections.internal.PooledConnections <init>
INFO: HHH000115: Hibernate connection pool size: 20 (min=1)
Dec 08, 2016 12:14:43 PM org.hibernate.dialect.Dialect <init>
INFO: HHH000400: Using dialect: org.hibernate.dialect.PostgreSQL94Dialect
Dec 08, 2016 12:14:43 PM org.hibernate.engine.jdbc.env.internal.LobCreatorBuilderImpl useContextualLobCreation
INFO: HHH000424: Disabling contextual LOB creation as createClob() method threw error : java.lang.reflect.InvocationTargetException
Dec 08, 2016 12:14:44 PM org.hibernate.type.BasicTypeRegistry register
INFO: HHH000270: Type registration [java.util.UUID] overrides previous : org.hibernate.type.UUIDBinaryType@510e29d
Dec 08, 2016 12:14:46 PM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["http-nio-8080"]
Dec 08, 2016 12:14:46 PM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["ajp-nio-8009"]
Dec 08, 2016 12:14:46 PM org.apache.catalina.startup.Catalina start
INFO: Server startup in 8232 ms
```

### No Database Running

If the database isn't running, you will end up with a `java.net.ConnectException` that causes an `org.postgresql.util.PSQLException`. This is caused because the server is trying to establish a connection pool that it can use to make database requests, but the connection failed. Make sure that the server is running, and be sure to check the port number.

A full log that includes this error looks something like this:

```
Dec 08, 2016 12:16:53 PM org.apache.tomcat.util.digester.SetPropertiesRule begin
WARNING: [SetPropertiesRule]{Server/Service/Engine/Host/Context} Setting property 'source' to 'org.eclipse.jst.jee.server:war' did not find a matching property.
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Server version:        Apache Tomcat/8.0.37
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Server built:          Sep 1 2016 10:01:52 UTC
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Server number:         8.0.37.0
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: OS Name:               Windows 7
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: OS Version:            6.1
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Architecture:          amd64
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Java Home:             C:\Program Files\Java\jdk1.8.0_102\jre
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: JVM Version:           1.8.0_102-b14
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: JVM Vendor:            Oracle Corporation
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: CATALINA_BASE:         C:\Users\583019\git\mason-investment\.metadata\.plugins\org.eclipse.wst.server.core\tmp0
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: CATALINA_HOME:         C:\Users\583019\tomcat\apache-tomcat-8.0.37
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dcatalina.base=C:\Users\583019\git\mason-investment\.metadata\.plugins\org.eclipse.wst.server.core\tmp0
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dcatalina.home=C:\Users\583019\tomcat\apache-tomcat-8.0.37
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dwtp.deploy=C:\Users\583019\git\mason-investment\.metadata\.plugins\org.eclipse.wst.server.core\tmp0\wtpwebapps
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Djava.endorsed.dirs=C:\Users\583019\tomcat\apache-tomcat-8.0.37\endorsed
Dec 08, 2016 12:16:53 PM org.apache.catalina.startup.VersionLoggerListener log
INFO: Command line argument: -Dfile.encoding=Cp1252
Dec 08, 2016 12:16:53 PM org.apache.catalina.core.AprLifecycleListener lifecycleEvent
INFO: The APR based Apache Tomcat Native library which allows optimal performance in production environments was not found on the java.library.path: C:\Program Files\Java\jdk1.8.0_102\bin;C:\Windows\Sun\Java\bin;C:\Windows\system32;C:\Windows;C:/Program Files/Java/jre1.8.0_112/bin/server;C:/Program Files/Java/jre1.8.0_112/bin;C:/Program Files/Java/jre1.8.0_112/lib/amd64;C:\ProgramData\Oracle\Java\javapath;C:\Program Files\Java\jdk1.8.0_102\bin;C:\Program Files\Common Files\Microsoft Shared\Microsoft Online Services;C:\Program Files (x86)\Common Files\Microsoft Shared\Microsoft Online Services;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\QuickTime\QTSystem\;C:\Program Files (x86)\Common Files\Roxio Shared\DLLShared\;C:\Program Files (x86)\Common Files\Roxio Shared\10.0\DLLShared\;C:\Program Files (x86)\Hewlett-Packard\HP ProtectTools Security Manager\Bin\;C:\Program Files\Intel\WiFi\bin\;C:\Program Files\Common Files\Intel\WirelessCommon\;C:\Users\583019\AppData\Local\Programs\Python\Python35-32;"C:\Program Files (x86)\Sqlite";C:\Program Files\nodejs\;C:\Program Files (x86)\Windows Kits\8.1\Windows Performance Toolkit\;"C:\Program Files\Putty";"C:\Program Files\Maven\bin";C:\Users\583019\AppData\Local\Programs\Git\cmd;C:\Program Files\Docker Toolbox;C:\Users\583019\AppData\Local\Continuum\Anaconda2;C:\Users\583019\AppData\Local\Continuum\Anaconda2\Scripts;C:\Users\583019\AppData\Local\Continuum\Anaconda2\Library\bin;C:\Users\583019\AppData\Local\Google\Chrome\Application;C:\ProgramData\Oracle\Java\javapath;C:\Program Files\Common Files\Microsoft Shared\Microsoft Online Services;C:\Program Files (x86)\Common Files\Microsoft Shared\Microsoft Online Services;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\QuickTime\QTSystem\;C:\Program Files (x86)\Common Files\Roxio Shared\DLLShared\;C:\Program Files (x86)\Common Files\Roxio Shared\10.0\DLLShared\;C:\Program Files (x86)\Hewlett-Packard\HP ProtectTools Security Manager\Bin\;C:\Program Files\Intel\WiFi\bin\;C:\Program Files\Common Files\Intel\WirelessCommon\;C:\Users\583019\AppData\Local\Programs\Python\Python35-32;"C:\Users\583019\AppData\Local\Programs\Git\bin";C:\Users\583019\AppData\Roaming\npm;"C:\Program Files\PostgreSQL\9.6\bin";C:\Users\583019\AppData\Local\Pandoc\;C:\Users\583019\AppData\Local\cURL;C:\Program Files\Docker Toolbox;C:\Users\583019\eclipse\java-neon\eclipse;;.
Dec 08, 2016 12:16:53 PM org.apache.coyote.AbstractProtocol init
INFO: Initializing ProtocolHandler ["http-nio-8080"]
Dec 08, 2016 12:16:54 PM org.apache.tomcat.util.net.NioSelectorPool getSharedSelector
INFO: Using a shared selector for servlet write/read
Dec 08, 2016 12:16:54 PM org.apache.coyote.AbstractProtocol init
INFO: Initializing ProtocolHandler ["ajp-nio-8009"]
Dec 08, 2016 12:16:54 PM org.apache.tomcat.util.net.NioSelectorPool getSharedSelector
INFO: Using a shared selector for servlet write/read
Dec 08, 2016 12:16:54 PM org.apache.catalina.startup.Catalina load
INFO: Initialization processed in 906 ms
Dec 08, 2016 12:16:54 PM org.apache.catalina.core.StandardService startInternal
INFO: Starting service Catalina
Dec 08, 2016 12:16:54 PM org.apache.catalina.core.StandardEngine startInternal
INFO: Starting Servlet Engine: Apache Tomcat/8.0.37
Dec 08, 2016 12:16:55 PM org.apache.jasper.servlet.TldScanner scanJars
INFO: At least one JAR was scanned for TLDs yet contained no TLDs. Enable debug logging for this logger for a complete list of JARs that were scanned but no TLDs were found in them. Skipping unneeded JARs during scanning can improve startup time and JSP compilation time.
Dec 08, 2016 12:16:55 PM org.hibernate.jpa.internal.util.LogHelper logPersistenceUnitInformation
INFO: HHH000204: Processing PersistenceUnitInfo [
	name: local-db
	...]
Dec 08, 2016 12:16:55 PM org.hibernate.Version logVersion
INFO: HHH000412: Hibernate Core {5.2.4.Final}
Dec 08, 2016 12:16:55 PM org.hibernate.cfg.Environment <clinit>
INFO: HHH000206: hibernate.properties not found
Dec 08, 2016 12:16:55 PM org.hibernate.cfg.Environment buildBytecodeProvider
INFO: HHH000021: Bytecode provider name : javassist
Dec 08, 2016 12:16:56 PM org.hibernate.annotations.common.reflection.java.JavaReflectionManager <clinit>
INFO: HCANN000001: Hibernate Commons Annotations {5.0.1.Final}
Dec 08, 2016 12:16:56 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl configure
WARN: HHH10001002: Using Hibernate built-in connection pool (not for production use!)
Dec 08, 2016 12:16:56 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl buildCreator
INFO: HHH10001005: using driver [org.postgresql.Driver] at URL [jdbc:postgresql://localhost:5432/vane]
Dec 08, 2016 12:16:56 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl buildCreator
INFO: HHH10001001: Connection properties: {user=postgres, password=****}
Dec 08, 2016 12:16:56 PM org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl buildCreator
INFO: HHH10001003: Autocommit mode: false
Dec 08, 2016 12:16:56 PM org.hibernate.engine.jdbc.connections.internal.PooledConnections <init>
INFO: HHH000115: Hibernate connection pool size: 20 (min=1)
Dec 08, 2016 12:16:57 PM org.apache.catalina.core.StandardContext listenerStart
SEVERE: Exception sending context initialized event to listener instance of class com.bah.vane.endpoints.EMFCreationListener
org.hibernate.service.spi.ServiceException: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment]
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:267)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:231)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:210)
	at org.hibernate.engine.jdbc.internal.JdbcServicesImpl.configure(JdbcServicesImpl.java:51)
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.configureService(StandardServiceRegistryImpl.java:94)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:240)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:210)
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.handleTypes(MetadataBuildingProcess.java:352)
	at org.hibernate.boot.model.process.spi.MetadataBuildingProcess.complete(MetadataBuildingProcess.java:111)
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.metadata(EntityManagerFactoryBuilderImpl.java:846)
	at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:873)
	at org.hibernate.jpa.HibernatePersistenceProvider.createEntityManagerFactory(HibernatePersistenceProvider.java:58)
	at javax.persistence.Persistence.createEntityManagerFactory(Persistence.java:55)
	at javax.persistence.Persistence.createEntityManagerFactory(Persistence.java:39)
	at com.bah.vane.endpoints.EMFCreationListener.contextInitialized(EMFCreationListener.java:35)
	at org.apache.catalina.core.StandardContext.listenerStart(StandardContext.java:4853)
	at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:5314)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:145)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1407)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1397)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:745)
Caused by: org.hibernate.exception.JDBCConnectionException: Error calling Driver#connect
	at org.hibernate.exception.internal.SQLStateConversionDelegate.convert(SQLStateConversionDelegate.java:115)
	at org.hibernate.engine.jdbc.connections.internal.BasicConnectionCreator$1$1.convert(BasicConnectionCreator.java:101)
	at org.hibernate.engine.jdbc.connections.internal.BasicConnectionCreator.convertSqlException(BasicConnectionCreator.java:123)
	at org.hibernate.engine.jdbc.connections.internal.DriverConnectionCreator.makeConnection(DriverConnectionCreator.java:41)
	at org.hibernate.engine.jdbc.connections.internal.BasicConnectionCreator.createConnection(BasicConnectionCreator.java:58)
	at org.hibernate.engine.jdbc.connections.internal.PooledConnections.addConnections(PooledConnections.java:123)
	at org.hibernate.engine.jdbc.connections.internal.PooledConnections.<init>(PooledConnections.java:42)
	at org.hibernate.engine.jdbc.connections.internal.PooledConnections.<init>(PooledConnections.java:20)
	at org.hibernate.engine.jdbc.connections.internal.PooledConnections$Builder.build(PooledConnections.java:161)
	at org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl.buildPool(DriverManagerConnectionProviderImpl.java:109)
	at org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl.configure(DriverManagerConnectionProviderImpl.java:72)
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.configureService(StandardServiceRegistryImpl.java:94)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.initializeService(AbstractServiceRegistryImpl.java:240)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.getService(AbstractServiceRegistryImpl.java:210)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.buildJdbcConnectionAccess(JdbcEnvironmentInitiator.java:145)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:66)
	at org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.initiateService(JdbcEnvironmentInitiator.java:35)
	at org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.initiateService(StandardServiceRegistryImpl.java:88)
	at org.hibernate.service.internal.AbstractServiceRegistryImpl.createService(AbstractServiceRegistryImpl.java:257)
	... 23 more
Caused by: org.postgresql.util.PSQLException: Connection to localhost:5432 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.
	at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:265)
	at org.postgresql.core.ConnectionFactory.openConnection(ConnectionFactory.java:55)
	at org.postgresql.jdbc.PgConnection.<init>(PgConnection.java:219)
	at org.postgresql.Driver.makeConnection(Driver.java:407)
	at org.postgresql.Driver.connect(Driver.java:275)
	at org.hibernate.engine.jdbc.connections.internal.DriverConnectionCreator.makeConnection(DriverConnectionCreator.java:38)
	... 38 more
Caused by: java.net.ConnectException: Connection refused: connect
	at java.net.DualStackPlainSocketImpl.waitForConnect(Native Method)
	at java.net.DualStackPlainSocketImpl.socketConnect(DualStackPlainSocketImpl.java:85)
	at java.net.AbstractPlainSocketImpl.doConnect(AbstractPlainSocketImpl.java:350)
	at java.net.AbstractPlainSocketImpl.connectToAddress(AbstractPlainSocketImpl.java:206)
	at java.net.AbstractPlainSocketImpl.connect(AbstractPlainSocketImpl.java:188)
	at java.net.PlainSocketImpl.connect(PlainSocketImpl.java:172)
	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:392)
	at java.net.Socket.connect(Socket.java:589)
	at org.postgresql.core.PGStream.<init>(PGStream.java:64)
	at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:147)
	... 43 more

Dec 08, 2016 12:16:57 PM org.apache.catalina.core.StandardContext startInternal
SEVERE: One or more listeners failed to start. Full details will be found in the appropriate container log file
Dec 08, 2016 12:16:57 PM org.apache.catalina.core.StandardContext startInternal
SEVERE: Context [/war] startup failed due to previous errors
Dec 08, 2016 12:16:57 PM org.apache.catalina.core.StandardContext listenerStop
SEVERE: Exception sending context destroyed event to listener instance of class com.bah.vane.endpoints.EMFCreationListener
java.lang.NullPointerException
	at com.bah.vane.endpoints.EMFCreationListener.contextDestroyed(EMFCreationListener.java:28)
	at org.apache.catalina.core.StandardContext.listenerStop(StandardContext.java:4900)
	at org.apache.catalina.core.StandardContext.stopInternal(StandardContext.java:5537)
	at org.apache.catalina.util.LifecycleBase.stop(LifecycleBase.java:221)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:149)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1407)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1397)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:745)

Dec 08, 2016 12:16:57 PM org.apache.catalina.loader.WebappClassLoaderBase clearReferencesJdbc
WARNING: The web application [war] registered the JDBC driver [org.postgresql.Driver] but failed to unregister it when the web application was stopped. To prevent a memory leak, the JDBC Driver has been forcibly unregistered.
Dec 08, 2016 12:16:57 PM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["http-nio-8080"]
Dec 08, 2016 12:16:57 PM org.apache.coyote.AbstractProtocol start
INFO: Starting ProtocolHandler ["ajp-nio-8009"]
Dec 08, 2016 12:16:57 PM org.apache.catalina.startup.Catalina start
INFO: Server startup in 3734 ms
```

### Database has incorrect schema

This can be caused if there have been changes to the expected schema, but the database hasn't been updated. You can fix this by re-running the `reset.sql` script, as described in the PostgreSQL setup phase. If that doesn't fix the problem, that script might not have been updated after somebody changed the JPA entities, which is beyond the scope of this document.

These errors will *not* occur on database startup, but instead happen on the each database interaction. If uploading, saving, and loading maps fails, look for error messages that include an `org.postgresql.util.PSQLException`, which ends up causing an `org.hibernate.exception.SQLGrammarException`. This error will generally include a more detailed error message that specifies exactly what went wrong.

The (partial) log for these errors will look something like this:

Note: I excluded the server startup part of the log because that will all run without errors.

```
Dec 08, 2016 12:24:43 PM org.hibernate.engine.jdbc.spi.SqlExceptionHelper logExceptions
WARN: SQL Error: 0, SQLState: 42P01
Dec 08, 2016 12:24:43 PM org.hibernate.engine.jdbc.spi.SqlExceptionHelper logExceptions
ERROR: ERROR: relation "subnets" does not exist
  Position: 500
Dec 08, 2016 12:24:43 PM org.hibernate.event.internal.DefaultLoadEventListener doOnLoad
INFO: HHH000327: Error performing load command : org.hibernate.exception.SQLGrammarException: could not extract ResultSet
javax.persistence.PersistenceException: org.hibernate.exception.SQLGrammarException: could not extract ResultSet
	at org.hibernate.internal.ExceptionConverterImpl.convert(ExceptionConverterImpl.java:147)
	at org.hibernate.internal.ExceptionConverterImpl.convert(ExceptionConverterImpl.java:174)
	at org.hibernate.internal.SessionImpl.find(SessionImpl.java:3389)
	at org.hibernate.internal.SessionImpl.find(SessionImpl.java:3329)
	at com.bah.vane.endpoints.Subnet.doJsonGet(Subnet.java:31)
	at com.bah.vane.endpoints.JsonServlet.doGet(JsonServlet.java:29)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:622)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:729)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:292)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:207)
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:52)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:240)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:207)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:212)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:106)
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:502)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:141)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:79)
	at org.apache.catalina.valves.AbstractAccessLogValve.invoke(AbstractAccessLogValve.java:616)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:88)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:528)
	at org.apache.coyote.http11.AbstractHttp11Processor.process(AbstractHttp11Processor.java:1100)
	at org.apache.coyote.AbstractProtocol$AbstractConnectionHandler.process(AbstractProtocol.java:687)
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1520)
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.run(NioEndpoint.java:1476)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:745)
Caused by: org.hibernate.exception.SQLGrammarException: could not extract ResultSet
	at org.hibernate.exception.internal.SQLStateConversionDelegate.convert(SQLStateConversionDelegate.java:106)
	at org.hibernate.exception.internal.StandardSQLExceptionConverter.convert(StandardSQLExceptionConverter.java:42)
	at org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:111)
	at org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:97)
	at org.hibernate.engine.jdbc.internal.ResultSetReturnImpl.extract(ResultSetReturnImpl.java:79)
	at org.hibernate.loader.plan.exec.internal.AbstractLoadPlanBasedLoader.getResultSet(AbstractLoadPlanBasedLoader.java:434)
	at org.hibernate.loader.plan.exec.internal.AbstractLoadPlanBasedLoader.executeQueryStatement(AbstractLoadPlanBasedLoader.java:186)
	at org.hibernate.loader.plan.exec.internal.AbstractLoadPlanBasedLoader.executeLoad(AbstractLoadPlanBasedLoader.java:121)
	at org.hibernate.loader.plan.exec.internal.AbstractLoadPlanBasedLoader.executeLoad(AbstractLoadPlanBasedLoader.java:86)
	at org.hibernate.loader.entity.plan.AbstractLoadPlanBasedEntityLoader.load(AbstractLoadPlanBasedEntityLoader.java:167)
	at org.hibernate.persister.entity.AbstractEntityPersister.load(AbstractEntityPersister.java:4004)
	at org.hibernate.event.internal.DefaultLoadEventListener.loadFromDatasource(DefaultLoadEventListener.java:508)
	at org.hibernate.event.internal.DefaultLoadEventListener.doLoad(DefaultLoadEventListener.java:478)
	at org.hibernate.event.internal.DefaultLoadEventListener.load(DefaultLoadEventListener.java:219)
	at org.hibernate.event.internal.DefaultLoadEventListener.proxyOrLoad(DefaultLoadEventListener.java:278)
	at org.hibernate.event.internal.DefaultLoadEventListener.doOnLoad(DefaultLoadEventListener.java:121)
	at org.hibernate.event.internal.DefaultLoadEventListener.onLoad(DefaultLoadEventListener.java:89)
	at org.hibernate.internal.SessionImpl.fireLoad(SessionImpl.java:1219)
	at org.hibernate.internal.SessionImpl.access$1900(SessionImpl.java:204)
	at org.hibernate.internal.SessionImpl$IdentifierLoadAccessImpl.doLoad(SessionImpl.java:2762)
	at org.hibernate.internal.SessionImpl$IdentifierLoadAccessImpl.load(SessionImpl.java:2736)
	at org.hibernate.internal.SessionImpl.find(SessionImpl.java:3365)
	... 26 more
Caused by: org.postgresql.util.PSQLException: ERROR: relation "subnets" does not exist
  Position: 500
	at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2458)
	at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2158)
	at org.postgresql.core.v3.QueryExecutorImpl.execute(QueryExecutorImpl.java:291)
	at org.postgresql.jdbc.PgStatement.executeInternal(PgStatement.java:432)
	at org.postgresql.jdbc.PgStatement.execute(PgStatement.java:358)
	at org.postgresql.jdbc.PgPreparedStatement.executeWithFlags(PgPreparedStatement.java:171)
	at org.postgresql.jdbc.PgPreparedStatement.executeQuery(PgPreparedStatement.java:119)
	at org.hibernate.engine.jdbc.internal.ResultSetReturnImpl.extract(ResultSetReturnImpl.java:70)
	... 43 more
```
