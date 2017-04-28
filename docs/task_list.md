# Task List

## Modeler Tasks
- Create backend network analysis modeler in Python
	1. ~~Implement Flask server for communication between Tomcat server and Python modeler code (~1-2 days)~~ (Complete)
	1. ~~Review Python source code with Mel (~2 days)~~ (Complete)
	1. ~~Refactor Mel's code to parse JSON input data (~1-2 weeks)~~ (Complete)
	1. ~~Parse JSON data from HTTP POST request sent from Tomcat servlet  (~1 day)~~ (Complete)
	1. ~~Send JSON results back to Tomcat servlet in the content of the HTTP response to the initial HTTP POST request.~~ (Complete)
	1. Implement logic/algorithms to analyze network demands and validate results (~2-3 weeks)
		- ~~Generate list of routes which satisfy given demand. (~1 week)~~ (Complete)
		- ~~Place demand traffic on routes. (~1 week)~~ (Complete)
		- ~~Output routing results as JSON object. (~1-2 days)~~ (Complete)
		- Validate results (~1 week)
	1. ~~Generate mock dataset of routing results to return to Tomcat/UI side. (~1-2 days)~~ (Complete)
	- Update Route objects with a priority attribute and include in JSON output.
- Functional-test modeler (Mel) (7 d)
	- Write a test plan
	- Generate test networks
	- Test input
	- Test output
	- Test route calculations
	- Test performance
- >90% Test Coverage (~1-2 weeks)
- Documentation/Tutorials (~1-2 weeks)
- Implement demand traffic statistics calculations and return in analysis results

## Server Tasks
- Set up python to run on AWS (1 day)
- Unit Testing (1-2 days)
	- Servlets
	- Interfaces (implementing classes are tested)
- Documentation (1-2 days)
	1. Javadoc-style comments per function (~90% Complete) (1-2 days to complete)
	1. Comments on reasoning and failures

## UI Tasks
- Backend UI Tasks:
	- Pass the network from the UI to the modeler back to the UI
		- UI to Tomcat
			- ~~Implement UI action (i.e., button click), which triggers an HTTP POST request to send UI network state to Tomcat~~ (Complete)
		- Tomcat to Flask
			- ~~Send data to modeler from Tomcat in HTTP POST request to Flask server~~ (Complete)
			- ~~Parse JSON object containing changes to network.~~ (Complete)
			- Update database with network changes?
			- Work out concurrent users and threading issues
		- Flask to Modeler
			- ~~Design flask-modeler interaction~~
			- ~~Implement the flask-modeler interaction~~
		- Modeler to Flask
			- ~~Return analysis results to Flask~~ (Complete)
		- Flask to Tomcat
			- ~~Return analysis results (as JSON) to Tomcat in HTTP response to original Tomcat HTTP POST request.~~ (Complete)
			- Use results to generate updated network on server side.
			- Persist analysis results in DB?
		- Tomcat to UI
			- ~~Return analysis results (as JSON) to UI in HTTP response to original UI HTTP POST request.~~ (Complete)
- Interactive UI Tasks:
	- Load a base network (not editable)
		- ~~Upload on client side~~ (Complete)
		- ~~Persist~~ (Complete)
		- Parse/display demands on UI
	- Create a scenario on the client side
		- ~~Add/remove node~~ (Complete)
		- ~~Add/remove link~~ (Complete)
		- Add/remove demand
		- Add/remove scenario properties
			- Name
			- Description
			- Date
	- Save/persist scenario to database via Tomcat
		- ~~JS sends network changes to Tomcat servlet via HTTP POST request (1-3 days)~~ (Complete)
		- Commit updated network to database or add new network to database?
	- Send the scenario to the modeler
		- ~~Merge scenario changes with base network (1-3 days)~~ (Complete)
		- ~~Send merged network to the modeler (<1 day)~~ (Complete)
	- Handle the modeler results
		- ~~Tomcat accepts modeler results~~ (~2-3 days) (Complete)
		- Reformats as necessary
		- ~~Sends to UI~~ (Complete)
		- ~~UI displays on screen (~1 week)~~ (Complete)
			- Display errors elegantly
	- Put unused links behind used ones.
- Update chart directive to resize to container size


- Unit Testing

## Report Generator Tasks
- Determine what we want to generate
- Additional tasks as necessary (this is lowest priority)

## Transition Tasks
### Dan -> Drew
- ~~Help Drew setup development environment~~ (Complete)
- AWS
	1. ~~Transfer ownership in BAH (Blocking)~~ (Complete)
	1. ~~Get Drew access to AWS console (Blocking)~~ (Complete)
	1. ~~Give Drew private keys~~ (Dropped/Unnecessary)
	1. ~~Document/brain dump server setup and issues~~ (Complete)
- Documentation
	1. ~~Package-level documentation~~ (Complete)
	1. Javadoc-style comments per function (~90% Complete) (1-2 days to complete)
	1. ~~Comments on reasoning and failures~~ (Completed to best of Dan's ability given time constraints)
- ~~Brain dumping~~ (Complete)

### Drew -> Kyle
- ~~Help Kyle setup development environment (Blocking)~~ (Complete)
- ~~Setup Github account/obtain project source code/review git basics (Blocking)~~ (Complete)
- Review Source Code
	- ~~Review JavaScript Source Code (Blocking)~~ (Complete)
	- Review Java Source Code. *Not necessary for initial productivity* (20% Complete. Will revisit at later date)
- Brain dumping (Ongoing)


# Prioritized Task Assignments (Estimated Time)

## Priorities for Drew as follows:
1. ~~Complete transition tasks (Dan -> Drew)~~ (Blocking Tasks Complete)
1. ~~Review/update **Modeler Tasks** progress and time estimates with Mel (<1 day)~~
1. Work with Kyle on UI Tasks (~1-2 weeks)
1. ~~Work with Kyle to verify all "pass the network from the UI to the modeler" tasks work (1-2 days)~~ (Complete)
1. ~~Prepare mock dataset for Kyle~~ (Mock data set ready for Mel's review)
1. ~~Complete "Modeler Tasks" (~1-2 weeks)~~
1. Work with Max on validating modeler results (~1 week)

## Priorities for Kyle as follows:
1. ~~Complete transition tasks (Drew -> Kyle) (1 week)~~ (Blocking Tasks Complete)
1. ~~Review/update **UI Tasks** progress and time estimates with Drew (1-2 days)~~ (Complete)
1. ~~Remove the usage slider and just keep the number (1 day)~~ (Complete)
1. ~~Convert capacity slider to dropdown and have it work in the UI like the slider does (i.e. changing link width but not yet communicating with back-end) (~1 week) (50% Complete)~~ (Dropped/On-hold)
1. ~~Restore usage slider (<1 day)~~ (Complete)
1. ~~Work with Drew to verify all "pass the network from the UI to the modeler" tasks work (1-2 days)~~ (Complete)
1. Document approach used to parse the demands for display, then implement it using the mock data (~1 week)
1. Complete **UI Tasks -> UI Options** in the order they are listed, including back-end communication for capacity changes & demand dropdown and tooltips (~2-4 weeks)
1. Write unit tests for the demand parsing and think about how/if we can write unit tests for the JS code (~1-2 weeks)

## Priorities for Max as follows:
1. Provide an estimate on how long it will take to create the 5 sample networks (i.e. first one done by Tuesday, next by Thursday, etc) (~1-2 weeks) (Initial mock-up network ready for review)
1. Perform network flow analysis on model network.
1. Determine the best place to store the sample networks, whether in our GitHub or somewhere else; will versioning be an issue?
1. Create the sample networks and provide to the team when each is completed

## Priorities for Mel as follows:
1. Work with Drew to review/update **Modeler Tasks** progress and time estimates
1. Work with Drew to review mock dataset for Kyle
1. Work with Drew to complete **Modeler Tasks**
1. Work with Max on the sample networks as needed
