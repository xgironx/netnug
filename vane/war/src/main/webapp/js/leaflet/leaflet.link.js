(function(){
    angular.module("leaflet")

    // This is a leaflet object that can be directly added to a map
    .factory("MapLink", function leafletLinkFactory(leaflet, polylineLink){

        // Extend the leaflet Path object
        // This provides the basic Path functionality, as well as the standard options (color, weight, etc.)
        return leaflet.Polyline.extend({
            options: {
                // lineCap: "butt",
                opacity: 0.25,
                color: '#0f0f0f',
            },
            // This is the constructor
            // See http://leafletjs.com/reference-1.0.2.html#class
            initialize: function(link, options) {
                leaflet.setOptions(this, options);
                this._link = link;
            },

            setLatLngs: function() {
                let latlngs = [this._link.fromNode().latLng(), this._link.toNode().latLng()];
                leaflet.Polyline.prototype.setLatLngs.call(this, latlngs);
            },

            // // This is called by leaflet whenever the mapping from lat-lng to x-y changes
            // // Essentially, on zoom changes and map loads
            _project: function() {
                let p0 = this._map.latLngToLayerPoint(this._link.fromNode().latLng());
                let p1 = this._map.latLngToLayerPoint(this._link.toNode().latLng());

                if (this.options.duplex) {
                    if (this.options.duplexLinkStyle == "OPNET") {
                        let interval = p1.subtract(p0);
                        p1 = p0.add(interval.divideBy(2.0));
                    } else {
                        // let width = this._link.width() / 2;
                        let width = 0;
                        let interval = p1.subtract(p0);
                        let normal = leaflet.point(-interval.y, interval.x).subtract(p0);
                        normal = normal.divideBy(normal.distanceTo(p0));
                        let offset = normal.multiplyBy(width);
                        p0 = p0.add(offset);
                        p1 = p1.add(offset);
                    }
                }

                this._polyline = polylineLink(p0, p1);
            },

            // This is called by leaflet whenever the map coordinates or class options change
            // Essentially, on moves or when MapLink.options is set
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

            // Grab the color from the parent Link object's color
            _updateColor: function() {
                // this.setStyle({color: this._link.color()});
                this.setStyle({color: this._link.getLinkColor()});
            },

            _updateOpacity: function() {
                // console.log("updating opacity...");
                // this.setStyle({opacity: this.options.hidden ? 0.0 : this.options.selected ? 1 : this._link.getOpacity()});
                this.setStyle({opacity: this._link.getLinkOpacity()});
            },

            // Grab the weight from the parent Link object's width
            _updateWeight: function() {
                // this.setStyle({weight: this.options.hidden ? 0.0 : this._link.width() ? this._link.width() : 1});
                this.setStyle({weight: this._link.getLinkWeight()});
                // console.log(this, this._link.width(), this.options.weight);
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

