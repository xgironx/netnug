(function(){
	angular.module("leaflet")

	// Is this class tiny? Yes. Is it effective? Also yes.

	// This is literally just a leaflet Marker. No more, no less.
	// Nodes are simple and need no customization
	.factory("MapNode", ["leaflet", function(leaflet){
		return leaflet.Marker.extend({});
	}])
})()
