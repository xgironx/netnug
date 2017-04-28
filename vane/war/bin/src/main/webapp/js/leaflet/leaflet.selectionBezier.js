(function(){
	angular.module("leaflet")
	
	// This is the blue outline that appears around links when they are selected
	// It is rendered as a separate path
	.factory("SelectionBezier", function(leaflet){
		return leaflet.Path.extend({
			
			// Constructor
			// Set the corresponding link
			initialize: function(link){
				this._link = link;
				
				this._updateWeight();
			},
			
			// Get the bezier of the corresponding link
			// This function exists because the renderer expects anything passed to the _updateBezier() function to have a .bezier() method
			// Because this bezier will always be the same as the corresponding link, no need to do any heavy lifting here or in _project()
			bezier: function(){
				return this._link.bezier();
			},
			
			// Update the weight of this bezier
			_updateWeight: function(){
				this.setStyle({weight: this._link.width() ? this._link.width() + 12 : 12});
			},
			
			// Runs on the normal update cycle (map zooms, map pans, and option changes)
			_update: function(){
				
				// If there's no corresponding map, do nothing
				if(!this._map){
					return;
				}
				
				// Try to bring this selection to the back
				// If you can't, no problem
				try{
					this.bringToBack();
				}catch(e){
					// Why does this empty catch block exist?
					// Good question. It happens because the first _update cycle happens after the <path> element is created, but before it's added to the DOM
					// So that means that on the first _update cycle, there's no parent element for <path>
					// This means that Path.bringToBack() (leaflet.js:7516) calls DomUtil.toBack() (leaflet.js:1337) calls element.parentNode.insertBefore(), which is undefined (or null)
					// This catch block handles those errors by ignoring them. On subsequent _update() cycles, there is no error, but the first update cycle always passes through here
					// The bringToBack() utility is handled in the overridden onAdd() function in this class
				}
				
				// Update all of the other things
				this._updateWeight();
				this._updatePath();
			},
			
			// This overrides the default Path onAdd
			onAdd: function(){
				this._renderer._initPath(this);
				this._reset();
				this._renderer._addPath(this);
				this._renderer.on('update', this._update, this);
				// Do all of the regular onAdd() stuff
				// this.prototype.onAdd()
				
				// Bring this <path> element to the back after it's finished being added (and <path> has a parent)
				// See the catch block in _update for details on why this works like this
				this.bringToBack();
			},

			// SelectionBezier uses it's parent's bezier curve, so it doesn't need its own projection
			_project: function(){},
			
			// Called on every _update cycle
			_updatePath: function(){
				this._renderer._updateBezier(this);
			}
		})
	})
})()