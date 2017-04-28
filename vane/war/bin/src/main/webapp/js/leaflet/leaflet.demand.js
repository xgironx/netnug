(function(){
    angular.module("leaflet")

    // This is a leaflet object that can be directly added to a map
    .factory("MapDemand", function leafletLinkFactory(leaflet, polylineLink){

        // Extend the leaflet Path object
        // This provides the basic Path functionality, as well as the standard options (color, weight, etc.)
        return leaflet.Polyline.extend({
            options: {
                // opacity: 0.5,
                enabled: false,
                weight: 5,
                color: '#0f0f0f',
                interactive: false,
            },
            // This is the constructor
            // See http://leafletjs.com/reference-1.0.2.html#class
            initialize: function(demand, options) {
                leaflet.setOptions(this, options);
                this._demand = demand;
            },

            setLatLngs: function() {
                let latlngs = [this._demand.fromNode().latLng(), this._demand.toNode().latLng()];
                leaflet.Polyline.prototype.setLatLngs.call(this, latlngs);
            },

            // // This is called by leaflet whenever the mapping from lat-lng to x-y changes
            // // Essentially, on zoom changes and map loads
            _project: function() {
                let p0 = this._map.latLngToLayerPoint(this._demand.fromNode().latLng());
                let p1 = this._map.latLngToLayerPoint(this._demand.toNode().latLng());
                this._polyline = polylineLink(p0, p1);
            },

            // This is called by leaflet whenever the map coordinates or class options change
            // Essentially, on moves or when MapDemand.options is set
            _update: function() {

                // If there isn't an associated map, don't do anything
                if(!this._map) {
                    return;
                }

                // Update each individual component

                this._updateOpacity();
                this._updateColor();
                this._updateWeight();
                this._updateClippedPolyline();
                this._updatePath();

            },

            // Updates the corresponding <path> element
            // Note that _updatePolyline isn't part of the renderer by default
            // It gets added when PolylineLink is injected
            _updatePath: function() {
                // _renderer is set by leaflet for all Path objects (including this)
                // The main current renderer is SVG. There is a Canvas renderer, but _updatePolyline isn't implemented on it
                // If you need to support non-SVG renderers, you need to include an _updatePolyline function in the new renderer
                // See the PolylineLink implementation for how I did it in SVG
                this._renderer._updatePoly(this);

                // Whenever you change the path, make sure that the length is changed to match
                this._updateLength();

                // let options = this.options;
                // // console.log("this.options.className: ", options.className);
                // let path = document.getElementsByClassName(options.className)[0];
                // console.log('path: ', path);
                // if (path) {
                //     path.style.strokeDasharray = `${this._length}`;
                //     path.style.strokeDashoffset = `${this._length}`;
                //     path.style.animation = 'stroke-dashoffset 2s linear';
                //     path.style.strokeDashoffset = '0';
                //     path.setAttribute("data-animated", true);
                //     // this.setStyle({dashArray: this._length, dashOffset: this._length})
                //     console.log('path.style.transition: ', path.style.transition);
                // }
            },

            // The clipped polyline is the portion of the polyline visible within the map
            // It needs to get updated whenever the map is moved, so this function should be called as part of _update
            _updateClippedPolyline: function() {
                this._clippedPolyline = this._polyline.clipToBounds(this._map.getRenderBounds());
            },

            // The length is expensive to calculate, so it only gets calculated once per _update
            _updateLength: function() {
                this._length = this._path.getTotalLength();
            },

            // Grab the weight from the parent Link object's width
            _updateWeight: function() {
                this.setStyle({weight: this._demand.getWeight()});
            },

            // Grab the color from the parent Link object's color
            _updateColor: function() {
                this.setStyle({color: this._demand.getColor()});
            },

            _updateOpacity: function() {
                // console.log("updating opacity...");
                this.setStyle({opacity: this._demand.getOpacity()});
            },

            // Get the displayed polyline object
            // _clippedPolyline gets updated on each _update cycle
            polyline: function() {
                return this._clippedPolyline;
            },

            // Get the length (in pixels) of the path
            // The actual length is expensive to calculate, so it only gets found once per _update
            length: function() {
                return this._length;
            },

            onAdd: function() {
                this._renderer._initPath(this);
                this._reset();
                this._renderer._addPath(this);
                this._update();
                this.bringToBack();
            }
        });
    })
})()

