/*
 * This file is responsible for wrapping Leaflet's global (L by default) in an
 * Angular factory.
 * 
 * It also adds a getRenderBounds function to leaflet.Map. This should
 * *probably* be done elsewhere, but this guarantees that it gets done as soon
 * as leaflet is loaded.	
 */

(function(){
	angular.module("leaflet", [])
	.factory("leaflet", function(){
		
		let getRenderBoundsLocalL = L;
		
		L.Map.include({
			// getRenderBounds produces the current pixel bounds for rendering
			// The Leaflet docs *say* that getPixelBounds() does this, but
			// it's broken.
			
			// Essentially, this:
			// - Grabs the map bounds in lat-lng
			// - Projects the points manually to x-y
			// - Creates and returns a bounds in x-y
			getRenderBounds: function(padding){
				if(!padding && padding != 0) padding = .05;
				
				let latLngBounds = this.getBounds().pad(.05);
				return getRenderBoundsLocalL.bounds(this.latLngToLayerPoint(latLngBounds.getNorthWest()), 
					this.latLngToLayerPoint(latLngBounds.getSouthEast()));
			}
		})
		
		return L.noConflict();
	})
})()