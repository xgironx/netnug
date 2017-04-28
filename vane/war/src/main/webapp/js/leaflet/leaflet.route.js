(function(){
    angular.module("leaflet")

    // This is a leaflet object that can be directly added to a map
    .factory("MapRoute", function leafletLinkFactory(leaflet, multiPolylineLink){

        // Extend the leaflet Path object
        // This provides the basic Path functionality, as well as the standard options (color, weight, etc.)
        return leaflet.Polyline.extend({
            options: {
                // lineCap: "butt",
                opacity: 0.6,
                enabled: false,
                weight: 5,
                color: '#f8f8f8',
                interactive: false,
            },
            // This is the constructor
            // See http://leafletjs.com/reference-1.0.2.html#class
            initialize: function(route, options) {
                leaflet.setOptions(this, options);
                this._route = route;
                this._links = route._links;
            },

            setLatLngs: function() {
                let latlngs = [];
                for (let link of this._links) {
                    latlngs.push([link.fromNode().latLng(), link.toNode().latLng()]);
                }
                leaflet.Polyline.prototype.setLatLngs.call(this, latlngs);
            },

            // // This is called by leaflet whenever the mapping from lat-lng to x-y changes
            // // Essentially, on zoom changes and map loads
            _project: function() {
                let points = [];
                for (let link of this._links) {
                    points.push(this._map.latLngToLayerPoint(link.fromNode().latLng()));
                    points.push(this._map.latLngToLayerPoint(link.toNode().latLng()));
                }
                // let p0 = this._map.latLngToLayerPoint(this._route.fromNode().latLng());
                // let p1 = this._map.latLngToLayerPoint(this._route.toNode().latLng());
                this._polyline = multiPolylineLink(points);
            },

            // This is called by leaflet whenever the map coordinates or class options change
            // Essentially, on moves or when MapRoute.options is set
            _update: function() {

                // If there isn't an associated map, don't do anything
                if(!this._map) {
                    return;
                }

                // Update each individual component

                this._updateOpacity();
                this._updateColor();
                this._updateWeight();
                // this._updateClippedPolyline();
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
                this.setStyle({weight: this._route.width() ? this._route.width() : 1});
                // console.log(this, this._route.width(), this.options.weight);
            },

            // Grab the color from the parent Link object's color
            _updateColor: function() {
                this.setStyle({color: this._route.color()});
            },

            _updateOpacity: function() {
                // console.log("updating opacity...");
                // this.setStyle({opacity: this._route.getOpacity()});
            },

            // Get the displayed polyline object
            // _clippedPolyline gets updated on each _update cycle
            polyline: function() {
                return this._polyline;
            },

            // Get the length (in pixels) of the path
            // The actual length is expensive to calculate, so it only gets found once per _update
            length: function() {
                return this._length;
            },
        });
    })
})()

