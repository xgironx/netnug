(function(){
	angular.module("leaflet")
	.factory("SelectionCircle", function(leaflet){
		
		// This is just a CircleMarker with some preset properties
		// See http://leafletjs.com/reference-1.0.2.html#circlemarker
		return leaflet.CircleMarker.extend({
			
			// Initialize takes a node (which provides the lat-lng) rather than the standard CircleMarker properties
			initialize: function(node){
				this._node = node;
				this.setLatLng(node.latLng());
				this.setRadius(25);
				
				// Set the desired style
				this.setStyle({stroke: false, fill: true, fillOpacity: .7});
			},
		})
	})
})()