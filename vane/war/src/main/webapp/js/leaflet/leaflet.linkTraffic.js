(function(){
	angular.module("leaflet")
	// Render the dots that correspond with a link
	.factory("LinkTraffic", function(leaflet) {
		// Extend from Path
		return leaflet.Path.extend({
			options: {
				spacing: 30,		// Distance (in px) from one dot to the next
				updateperiod: 15,	// Frequency that the path updates
				speed: 0,			// Speed (in px/sec) that the dots move
				enabled: false,		// Is it on right now? If this is false, this consumes almost no resources.
				weight: 9,			// Size of the dots
				color: '#0f0f0f',	// Starting color of the dots
				interactive: false,	// Prevents the dot from being clickable
				opacity: 1,
				hidden: false
			},

			// Constructor
			initialize: function(link, options) {
				leaflet.setOptions(this, options);
				this._link = link;
				this._offset = Math.random() - 0.5;
			},

			// Disable these ants
			disable: function(){
				this.setStyle({enabled: false});
				return this;		// Allows for chaining
			},

			// Enable these ants
			enable: function(){
				this.setStyle({enabled: true});
				return this;		// Allows for chaining
			},

			// Project has to exist, but should be a no-op
			// LinkTraffic always uses the bezier curve it gets from _link, so it doesn't need to project itself
			_project: function(){},

			// Called by leaflet (and occasionally manually) to change the link path
			_update: function(){
				if(!this._map){
					return;
				}
				this._updatePath();
				this._updateColor();
				this._updateOpacity();
				this._updateWeight();
				this._updateSpeed();
			},

			// Sets the link path
			// See the todo below for how this should be made into a function that calls the renderer
			_updatePath: function() {
				// this._renderer._setPath()
				// this._renderer._updatePath();

				if (this.options.enabled){
					// TODO Make _updateAnts() a renderer function
					// This is inconsistent with other usage, and makes it non-portable to other (theoretical) renderers
					this._renderer._setPath(this, this._calculatePath());
				} else {
					// Path is an SVG path string, so empty string means draw nothing
					this._renderer._setPath(this, "");
				}
			},

			_updateColor: function() {
				this.setStyle({color: this._link._link.getTrafficColor()});
			},

			_updateOpacity: function() {
				// this.setStyle({opacity: this._link.options.hidden ? 0 : this._link.options.selected ? 1 : 0.5});
				// this.setStyle({opacity: this._link._link.getOpacity()});
				this.setStyle({opacity: this._link.options.hidden ? 0 : this._link._link.getTrafficOpacity()});
			},

			_updateWeight: function() {
				// this.setStyle({weight: this._link.options.hidden ? 0 : this._link.options.width});
				this.setStyle({weight: this._link._link.getTrafficWeight()});
			},

			// Grab the speed from the parent Link object
			_updateSpeed: function() {
				// this.setStyle({weight: this.options.hidden ? 0.0 : this._link.width() ? this._link.width() : 1});
				this.setStyle({speed: this.options.hidden ? 0.0 : this._link._link.getTrafficSpeed()});
			},

			// Determine the SVG Path string
			// This is a fairly expensive operation, so optimization is good here
			_calculatePath: function() {
				// Start with an empty string
				let path = "";

				// If the corresponding link is less than 2 pixels long, there's no point even trying
				if(this._link.length() < 2) {
					return "";
				}

				// Loop through the current points
				// LinkTraffic.currentPoints() returns an iterator (see that function for details)
				// Each point gets two path string entries:
				// - M moves to those coordinates (without drawing a line)
				// - L draws a line to those coordinates
				// Because M and L are on the same point, we get a zero-length line, which renders as a dot
				// This is WAY faster than any other method I tried

				// See https://css-tricks.com/svg-path-syntax-illustrated-guide/
				for (let point of this.currentPoints()) {
					path += "M";
					path += point.x;
					path += ",";
					path += point.y;
					path += "L";
					path += point.x;
					path += ",";
					path += point.y;
				}

				// Return the SVG path string
				// Leaflet inserts it like: <path d="pathString"/>
				return path;
			},

			// Returns an iterator that produces the animation points in view at the moment
			// This can be written with cleaner syntax as a generator, but it ends up much slower
			// Chrome's JIT compiler doesn't do generators (see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#2-unsupported-syntax)
			currentPoints: function() {

				// Create the iterator object
				let iter = {};
				let link = this._link;

				// Set the spacing constant (and check that it isn't 0, which causes an infinite loop)
				iter.spacing = this.options.spacing / link.length();
				if(iter.spacing === 0) throw "Spacing should not equal 0. It causes an infinite generator loop (and a Chrome crash)!";

				// Grab the parent's bezier
				// iter.bezier = this._link.bezier();
				iter.polyline = link.polyline();

				// Set t based on the current offset
				iter.t = this._offset / link.length();

				// Generate the next point
				iter.next = function(){

					// If the current t is too high, we're done here
					if(iter.t > 1){
						return {done: true};
					}

					// Set the value by evaluating the bezier
					// Note: This call is why QuadBezier.evaluate() has to be super fast
					// let value = iter.bezier.evaluate(iter.t);
					let value = iter.polyline.evaluate(iter.t);

					// Increment the t value
					iter.t += iter.spacing;

					// See the iterator definition for why this structure is necessary
					return {done: false, value: value};

				}

				// Make the iterator be also be an iterable
				iter[Symbol.iterator] = function() {return iter};

				return iter;
			},

			// _step is called every "frame"
			// It updates the path and recalculates the offset, then queues up another call to _step
			// TODO: Refactor this so there's just main loop instead of many small step functions
			_step: function() {
				this._update();
				let options = this.options;
				this._offset = (this._offset + (options.speed * options.updateperiod) / 1000) % options.spacing;

				let currentAntLayer = this;
				setTimeout(function(){currentAntLayer._step()}, currentAntLayer.options.updateperiod);
			},

			// Start the movement
			// Needs to be called to start up the _step loop
			start: function() {
				this._step();
				return this;
			}
		})
	})
})()
