(function(){
    angular.module("leaflet")
    // Render the dots that correspond with a link
    .factory("AnimatedTraffic", function(leaflet) {
        // Extend from Path
        return leaflet.Polyline.extend({
            options: {
                spacing: 10,        // Distance (in px) from one dot to the next
                delay: 1000,    // Frequency that the path updates
                paused: false,     // Is it on right now? If this is false, this consumes almost no resources.
                weight: 9,          // Size of the dots
                color: '#ff9800',   // Starting color of the dots
                interactive: false, // Prevents the dot from being clickable
                opacity: 0.75,
                dashArray: [5, 50],
            },

            // Constructor
            initialize: function(link, options) {
                leaflet.setOptions(this, options);
                this._link = link;
            },

            polyline: function(){
                return this._link.polyline();
            },

            // Disable these ants
            disable: function(){
                this.setStyle({enabled: false});
                return this;        // Allows for chaining
            },

            // Enable these ants
            enable: function(){
                this.setStyle({enabled: true});
                return this;        // Allows for chaining
            },

            // Project has to exist, but should be a no-op
            // AnimatedTraffic always uses the bezier curve it gets from _link, so it doesn't need to project itself
            _project: function(){},

            // Called by leaflet (and occasionally manually) to change the link path
            _update: function(){
                if(!this._map){
                    return;
                }
                this._calculateAnimationSpeed();
                this._updatePath();
                this._updateColor();
                this._updateOpacity();
                this._updateWeight();
                // this._updateSpeed();
            },

            // Sets the link path
            // See the todo below for how this should be made into a function that calls the renderer
            // _updatePath: function() {
            //     // this._renderer._setPath()
            //     // this._renderer._updatePath();

            //     if (this.options.enabled){
            //         // TODO Make _updateAnts() a renderer function
            //         // This is inconsistent with other usage, and makes it non-portable to other (theoretical) renderers
            //         this._renderer._setPath(this, this._calculatePath());
            //     } else {
            //         // Path is an SVG path string, so empty string means draw nothing
            //         this._renderer._setPath(this, "");
            //     }
            // },

            _updateColor: function() {
                this.setStyle({color: this._link._link.getTrafficColor()});
            },

            _updateOpacity: function() {
                // this.setStyle({opacity: this._link.options.hidden ? 0 : this._link.options.selected ? 1 : 0.5});
                this.setStyle({opacity: !this._link._link.usage() || this._link.options.hidden || !this.options.enabled ? 0 : this._link._link.getTrafficOpacity()});
            },

            _updateWeight: function() {
                // this.setStyle({weight: this._link.options.hidden ? 0 : this._link.options.width});
                this.setStyle({weight: this._link._link.getTrafficWeight()});
            },

            // Grab the speed from the parent Link object
            // _updateSpeed: function() {
            //     // this.setStyle({weight: this.options.hidden ? 0.0 : this._link.width() ? this._link.width() : 1});
            //     this.setStyle({speed: this.options.hidden ? 0.0 : this._link._link.getTrafficSpeed()});
            // },

            // Determine the SVG Path string
            // This is a fairly expensive operation, so optimization is good here
            _calculatePath: function() {
                // Start with an empty string
                console.log("calculating path...");
                let path = "";

                // If the corresponding link is less than 2 pixels long, there's no point even trying
                if(this._link.length() < 2) {
                    return "";
                }

                let polyline = this.polyline();
                let spacing = this.options.dashArray[1];
                let offset = 0;
                let t = 0;

                let points = [];

                while (t < 1) {
                    let pt = polyline.evaluate(t);
                    points.push(pt);
                    offset += spacing;
                    t = offset / this._link.length();
                }

                while (points.length >= 2) {
                    p0 = points.shift();
                    p1 = points.shift();
                    path += "M";
                    path += p0.x.toFixed(2);
                    path += ",";
                    path += p0.y.toFixed(2);
                    path += " L";
                    path += p1.x.toFixed(2);
                    path += ",";
                    path += p1.y.toFixed(2);
                    points.shift();
                }

                // Return the SVG path string
                // Leaflet inserts it like: <path d="pathString"/>
                return path;
            },

            // Start the movement
            // Needs to be called to start up the _step loop
            start: function() {
                this._update();
                return this;
            },

            _calculateAnimationSpeed: function() {
                if (!this._map) {
                    return;
                }
                let options = this.options;
                // console.log("this.options.className: ", options.className);
                let animatedPolyElements = document.getElementsByClassName(options.className);
                // console.log('animatedPolyElements: ', animatedPolyElements);
                let animationDuration = 15 + "s";
                // let animationDuration = 1 + (options.delay / 3) / this._map.getZoom() + "s";

                let animationRules = ["-webkit-", "-moz-", "-ms-", "-o-", ""]
                    .map(prefix => `${prefix}animation-duration: ${animationDuration}`).join(";");

                Array.from(animatedPolyElements, el => {
                    el.style.cssText = animationRules;
                    el.setAttribute("data-animated", true);
                });
            },

            onAdd: function() {
                this._renderer._initPath(this);
                this._reset();
                this._renderer._addPath(this);
                this._renderer.on('update', this._update, this);
                this._map.on('zoomend', this._calculateAnimationSpeed, this);
                this._renderer._setPath(this, this._calculatePath());
                this._update();
            }
        })
    })
})()
