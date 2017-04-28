(function(){
    angular.module("leaflet")
    .factory("HighlighterCircle", function(leaflet){

        // This is just a CircleMarker with some preset properties
        // See http://leafletjs.com/reference-1.0.2.html#circlemarker
        return leaflet.CircleMarker.extend({
            options: {
                color: '#ff9000',
                highlightColor: '#ff9000',
                selectionColor: '#3388ff',
                // interactive: false,
                // draggable: true
            },

            // Initialize takes a node (which provides the lat-lng) rather than the standard CircleMarker properties
            initialize: function(node, options){
                leaflet.setOptions(this, options);
                this._node = node;
                this.setLatLng(node.latLng());
                this.setRadius(25);

                // Set the desired style
                this.setStyle({stroke: false, fill: true, fillOpacity: .7});
                this._updateColor();
            },

            // _update: function() {
            //     if (!this._map) {
            //         return;
            //     }

            //     this._updateColor();
            // },

            // Update the color of this polyline
            _updateColor: function(){
                this.setStyle({color: this._node.selected() ? this.options.selectionColor : this.options.highlightColor});
            },

        })
    })
})()
