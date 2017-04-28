(function() {
	
	angular.module("leaflet")
	
	/*
	 * QuadBezier is an object that holds a quadratic bezier curve.
	 * 
	 * There are 3 control points, represented as Leaflet Point objects. They
	 * accessible through the array-like [0], [1], and [2] operators.
	 * 
	 * There are also many utility functions included in this factory.
	 * 
	 * Finally, this factory also adds bezier rendering capacity to the SVG
	 * renderer.
	 */
	.factory("QuadBezier", function(leaflet){
		
		// This is analogous to the renderer's _updatePoly() and _updateCircle() functions
		// See lines 8702-8719 of leaflet.js
		leaflet.SVG.include({
			_updateBezier: function(layer){
				this._setPath(layer, leaflet.SVG.bezierToPath(layer.bezier()));
			}
		});
		
		// This is analogous to the renderer's pointsToPath() function
		// It calculates an SVG path string from a bezier
		// See lines 8750-8769 of leaflet.js for how this fits into leaflet
		// See https://css-tricks.com/svg-path-syntax-illustrated-guide/
		leaflet.extend(leaflet.SVG, {
			bezierToPath: function(bezier) {
				return "M " + bezier[0].x + "," + bezier[0].y +
					"Q " + bezier[1].x + "," + bezier[1].y +
					" " + bezier[2].x + "," + bezier[2].y;
			}
		});
		
		// The main constructor (and class definition)
		// This is the thing that gets returned
		function QuadBezier(p0, p1, p2){
			this[0] = leaflet.point(p0);
			this[1] = leaflet.point(p1);
			this[2] = leaflet.point(p2);
		}
		
		// Evaluates the bezier at a particular t value
		// This function gets run several thousand times per second, so it has to be very fast
		// Using leaflet's point functions turned out to be too slow, but this runs extremely quickly
		// Also, Chrome's V8 JIT compiler *really* likes this function
		QuadBezier.prototype.evaluate = function(t){
				return leaflet.point(this[0].x + t*(this[1].x + this[1].x - this[0].x - this[0].x + t*(this[2].x - this[1].x - this[1].x + this[0].x)),
					this[0].y + t*(this[1].y + this[1].y - this[0].y - this[0].y + t*(this[2].y - this[1].y - this[1].y + this[0].y)));
		}
		
		// This takes the inverse of the bezier curve at a specific point
		QuadBezier.prototype.inverse = function(coordinate, axis){
			let a, b, c;
			if(axis === "x"){
				a = this[0].x;
				b = this[1].x;
				c = this[2].x;
			}else if(axis === "y"){
				a = this[0].y;
				b = this[1].y;
				c = this[2].y;
			}else{
				throw "Must specify \"x\" or \"y\" as the axis, not " + axis;
			}
			
			let result1 = (-1*Math.sqrt(-1*a*c + a*coordinate + b*b - 2*b*coordinate + c*coordinate) - a + b)/(-1*a + 2*b - c);
			let result2 = (Math.sqrt(-1*a*c + a*coordinate + b*b - 2*b*coordinate + c*coordinate) - a + b)/(-1*a + 2*b - c);
			
			let results = [];
			
			if(result1 >= 0 && result1 <= 1) results.push(result1);
			if(result2 >= 0 && result2 <= 1) results.push(result2);
			
			return results;
		}
		
		// Split the bezier into two at a specific T value
		// This is essentially a non-recursive, quadratic-only implementation of De Casteljau's algorithm
		// Returns two bezier curves
		QuadBezier.prototype.split = function(t){
			// Produce a point between 2 other points, where t is the proportion of the way between them
			function interpolatePoint(start, end, t){
				return leaflet.point(interpolate(start.x, end.x, t), interpolate(start.y, end.y, t));
			}
			
			// Produce a number M between A and B, where t is the ratio of (A-M)/B
			function interpolate(start, end, t){
				return start + t*(end - start);
			}
			
			let a = this[0];
			let b = this[1];
			let c = this[2];
			
			let d = interpolatePoint(a, b, t);
			let e = interpolatePoint(b, c, t);
			let f = interpolatePoint(d, e, t);
			
			return [new QuadBezier(a, d, f), new QuadBezier(f, e, c)];
		}
		
		// Clip the bezier curve at two different t values
		// Just calls QuadBezier.split() twice
		QuadBezier.prototype.clip = function(lower, upper){
			let zones2and3 = this.split(lower)[1];
			
			// Need to rescale the split point because it is taken with respect to
			// zones2and3's parameter limits, but upper is specified on the overall 
			// parameter limits.
			let zone2 = zones2and3.split((upper - lower)/(1 - lower))[0];
			return zone2;
		}
		
		// Given a Leaflet bounds object, clip the bezier to just include the part within those bounds
		QuadBezier.prototype.clipToBounds = function(bounds){
			let parameterBounds = this.parameterBounds(bounds);
			return this.clip(parameterBounds.lower, parameterBounds.upper);
		}
		
		// Given a Leaflet bounds object, determing what t-values sit on those bounds
		QuadBezier.prototype.parameterBounds = function(bounds){
			
			// Interior function figures out if a point is "on" a set of bounds (within a certain tolerance)
			function onBounds(point, bounds, tolerance) {
				if(!tolerance) tolerance = .0005;
				
				let between = function between(x, a, b){
					return (x >= a && x <= b) || (x <= a && x >= b);
				}


				return point != null && (
					(Math.abs(bounds.min.x - point.x) < tolerance) && between(point.y, bounds.min.y, bounds.max.y) ||
					 Math.abs(bounds.min.y - point.y) < tolerance && between(point.x, bounds.min.x, bounds.max.x) ||
					 Math.abs(bounds.max.x - point.x) < tolerance && between(point.y, bounds.min.y, bounds.max.y) ||
					 Math.abs(bounds.max.y - point.y) < tolerance && between(point.x, bounds.min.x, bounds.max.x)
				);
			}
			
			// Take the two results of the inverse quadratic bezier for each of the two sides
			// For each one, if one result is valid, keep the valid one
			// If both or none are valid, discard them both (marking them null)
			let pairs = {};
			pairs.left = this.inverse(bounds.min.x, "x");
			pairs.right = this.inverse(bounds.max.x, "x");
			pairs.bottom = this.inverse(bounds.min.y, "y");
			pairs.top = this.inverse(bounds.max.y, "y");

			let finalbounds = [];

			// Note: V8 JIT compiler prefers var to let in for-in loops
			// See https://groups.google.com/d/msg/v8-users/hsUrt4I2D98/ELsfO1e6AQAJ
			for(var key in pairs){
				let valid0 = pairs[key][0] < 1 && pairs[key][0] > 0;
				let valid1 = pairs[key][1] < 1 && pairs[key][1] > 0;

				let potentialbound;

				// If one is valid, keep that one
				if(valid1 && !valid0){
					potentialbound = pairs[key][1];
				}else if(!valid1 && valid0){
					potentialbound = pairs[key][0];
				}

				// If we found a valid bound, and it's on the map bounds, add it to the final
				if(potentialbound && onBounds(this.evaluate(potentialbound), bounds)) {
					finalbounds.push(potentialbound);
				}
			}

			// Look at the number of valid bounds
			// There will either be 0, 1, or 2 bounds
			switch(finalbounds.length){
				// Curve never crosses a line. Either completely in or completely out
				// Figure out if one endpoint is in bounds. If so, return full interval
				// If not, return no interval
				case 0:
					if(bounds.contains(this.evaluate(1))){
						return {lower: 0, upper: 1};
					} else {
						return {lower: 0, upper: 0};
					}
					break;
				
				// Curve crosses 1 line. One point must be in, and the other must be out
				// Figure out if one endpoint is in bounds
				// If so, return crossing to that endpoint
				// If not, return other endpoint to crossing
				case 1:
					if(bounds.contains(this.evaluate(1))){
						return {lower: finalbounds[0], upper: 1};
					} else {
						return {lower: 0, upper: finalbounds[0]};
					}
					break;
					
				// Curve crosses line twice
				// Both endpoints are valid
				// Return them in order
				case 2:
				default:
					if(finalbounds[0] > finalbounds[1]){
						return {lower: finalbounds[1], upper: finalbounds[0]};
					}else{
						return {lower: finalbounds[0], upper: finalbounds[1]};
					}
			}
		}
		
		return QuadBezier;
	})
	
	// A factory function that calculates a QuadBezier from two points and an offset
	.factory("quadBezier", function(leaflet, QuadBezier){
		return function(p0, p2, offset){
			let interval = p2.subtract(p0);
			
			let normal = leaflet.point(-interval.y, interval.x);
			normal = normal._divideBy(normal.distanceTo([0, 0]));

			let midpoint = p0.add(interval.divideBy(2));
			let offsetvector = normal.multiplyBy(offset * p0.distanceTo(p2));
			let p1 = midpoint.add(offsetvector);
			
			return new QuadBezier(p0, p1, p2);
		}
	})
})()