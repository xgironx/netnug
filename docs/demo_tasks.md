# Demo Tasks

## UI Tasks

* ~~Fix bug in link opacity on zoom in/out or pan~~
* ~~Add count for demand on link~~
* **Add legend for traffic marker widths**
* **Update screenshot for powerpoint**
* Demand View
    * ~~Routes on selected demands~~
    * Apply spring layout to demand view nodes
    * Options to display/hide all
    * Search for demand by node/source
    * Arrows for direction
    * ~~Add grid to demand view background~~
* ~~Add link utilization chart~~
* ~~Update link capacity slider~~
    * ~~Add 40 Gb/s~~
* Implement alternative options for link/traffic visualizations
    * ~~split line color at midpoint along length~~
    * try aspect ratio correction for line offset
    * try a color gradient or pulsating effect to represent traffic flow
    * CSS tricks?
    * ...
* ~~Update icons / mappings~~
* Implement auto-analyze
* Add UI control to select time on graph --> shows snapshot on map
* Add selectable UI line on y-axis values (eg. utilization 70%)
* Add time dial for time series view
* Put unused links behind used links
* Add buttons to toggle traffic on/off in any view
* ~~Implement toolbar for all buttons~~
* Look into Selenium for testing
* Add UI options for controlling the visualization features and implementation
    * More ant options
        * Toggle on/off
        * speed
        * size
        * separation
        * opacity
        * geometry
    * More link options
        * min/max/default widths
        * color
        * opacity
        * Options to control duplex link viz
            * single or double link implementations
            * single link with 2 colors
            * single link with or without ants
        * Options to control traffic flow implementation
            * moving ants
            * color gradient
            * pulsating effect

## Java/JPA tasks

* Implement database commands in persistence.xml
* Normalize traffic profile time series when parsing

## Modeler Tasks

    * ~~Update OSPF reference bandwidth to 1e12~~
    * Implement caching for traffic time series analysis (lrucache library)
    * Implement data binning via numpy only


## Validation Tasks

* Validation against OPNET flow analysis
    * Utilization
    * Total traffic

## Demo Prep

* Refactor PowerPoint presentation
    * Add financials
        * Estimate of next phase of development
