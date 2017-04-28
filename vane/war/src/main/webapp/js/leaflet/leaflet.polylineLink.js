(function() {

    angular.module("leaflet")
    .factory("PolylineLink", function(leaflet){
        // leaflet.extend(leaflet.SVG, {padding: 0.5});

        leaflet.SVG.include({
            _updatePoly: function(layer){
                this._setPath(layer, leaflet.SVG.pointsToPath(layer.polyline()));
            }
        });

        // This is analogous to the renderer's pointsToPath() function
        // It calculates an SVG path string from a bezier
        // See lines 8750-8769 of leaflet.js for how this fits into leaflet
        // See https://css-tricks.com/svg-path-syntax-illustrated-guide/
        leaflet.extend(leaflet.SVG, {
            pointsToPath: function(polyline) {
                return "M " + polyline[0].x + "," + polyline[0].y +
                    "L " + polyline[1].x + "," + polyline[1].y;
            }
        });

        // The main constructor (and class definition)
        // This is the thing that gets returned
        function PolylineLink(p0, p1){
            this[0] = leaflet.point(p0);
            this[1] = leaflet.point(p1);
        }

        // Evaluates the bezier at a particular t value
        // This function gets run several thousand times per second, so it has to be very fast
        // Using leaflet's point functions turned out to be too slow, but this runs extremely quickly
        // Also, Chrome's V8 JIT compiler *really* likes this function
        PolylineLink.prototype.evaluate = function(t){
            return leaflet.point(this[0].x + t * (this[1].x - this[0].x),
                                 this[0].y + t * (this[1].y - this[0].y));
        };

        // Given a Leaflet bounds object, clip the polyline to just include the part within those bounds
        PolylineLink.prototype.clipToBounds = function(bounds){

            let p0 = this[0], p1 = this[1];
            let lineBounds = leaflet.bounds([p0, p1]);

            function between(x, a, b){
                return (x >= a && x <= b) || (x <= a && x >= b);
            }

            function onBounds(point, bounds, tolerance) {
                if(!tolerance) tolerance = .0005;

                return point != null && (
                    (Math.abs(bounds.min.x - point.x) < tolerance) && between(point.y, bounds.min.y, bounds.max.y) ||
                     Math.abs(bounds.min.y - point.y) < tolerance && between(point.x, bounds.min.x, bounds.max.x) ||
                     Math.abs(bounds.max.x - point.x) < tolerance && between(point.y, bounds.min.y, bounds.max.y) ||
                     Math.abs(bounds.max.y - point.y) < tolerance && between(point.x, bounds.min.x, bounds.max.x)
                );
            }

            function interpolatePoint(start, end, t){
                return leaflet.point(interpolate(start.x, end.x, t), interpolate(start.y, end.y, t));
            }

            // Produce a number M between A and B, where t is the ratio of (A-M)/B
            function interpolate(start, end, t){
                return start + t*(end - start);
            }

            if (bounds.contains(p0) && bounds.contains(p1)) {
                return this;
            } else if (!bounds.contains(p0) && !bounds.contains(p1)) {
                if (!bounds.intersects(lineBounds)) {
                    return new PolylineLink(this[0], this[0]);
                    // return this;
                } else {
                    let xmin = bounds.min.x;
                    let ymin = bounds.min.y;
                    let xmax = bounds.max.x;
                    let ymax = bounds.max.y;
                    let m;

                    if (between(p0.y, ymin, ymax)) {
                        m = (p1.y - p0.y) / (p1.x - p0.x);
                        let yi;

                        if (p0.x < xmin) {
                            yi = m * (xmin - p0.x) + p0.y;
                            p0 = leaflet.point(xmin, yi);
                        } else {
                            yi = m * (xmax - p0.x) + p0.y;
                            p0 = leaflet.point(xmax, yi);
                        }
                    } else if (between(p0.x, xmin, xmax)) {
                        m = (p1.x - p0.x) / (p1.y - p0.y);
                        let xi;
                        if (p0.y < ymin) {
                            xi = m * (ymin - p0.y) + p0.x;
                            p0 = leaflet.point(xi, ymin);
                        } else {
                            xi = m * (ymax - p0.y) + p0.x;
                            p0 = leaflet.point(xi, ymax);
                        }
                    }

                    if (between(p1.y, ymin, ymax)) {
                        m = (p1.y - p0.y) / (p1.x - p0.x);
                        let yi;

                        if (p1.x < xmin) {
                            yi = m * (xmin - p0.x) + p0.y;
                            p1 = leaflet.point(xmin, yi);
                        } else {
                            yi = m * (xmax - p0.x) + p0.y;
                            p1 = leaflet.point(xmax, yi);
                        }
                    } else if (between(p1.x, xmin, xmax)) {
                        m = (p1.x - p0.x) / (p1.y - p0.y);
                        let xi;
                        if (p1.y < ymin) {
                            xi = m * (ymin - p0.y) + p0.x;
                            p1 = leaflet.point(xi, ymin);
                        } else {
                            xi = m * (ymax - p0.y) + p0.x;
                            p1 = leaflet.point(xi, ymax);
                        }
                    }
                    return new PolylineLink(p0, p1);
                }
            } else {

                let xmin = bounds.min.x;
                let ymin = bounds.min.y;
                let xmax = bounds.max.x;
                let ymax = bounds.max.y;
                let m;

                if (!bounds.contains(p0)) {
                    if (between(p0.y, ymin, ymax)) {
                        m = (p1.y - p0.y) / (p1.x - p0.x);
                        let yi;

                        if (p0.x < xmin) {
                            yi = m * (xmin - p0.x) + p0.y;
                            p0 = leaflet.point(xmin, yi);
                        } else {
                            yi = m * (xmax - p0.x) + p0.y;
                            p0 = leaflet.point(xmax, yi);
                        }
                    } else if (between(p0.x, xmin, xmax)) {
                        m = (p1.x - p0.x) / (p1.y - p0.y);
                        let xi;
                        if (p0.y < ymin) {
                            xi = m * (ymin - p0.y) + p0.x;
                            p0 = leaflet.point(xi, ymin);
                        } else {
                            xi = m * (ymax - p0.y) + p0.x;
                            p0 = leaflet.point(xi, ymax);
                        }
                    }
                } else {
                    if (between(p1.y, ymin, ymax)) {
                        m = (p1.y - p0.y) / (p1.x - p0.x);
                        let yi;

                        if (p1.x < xmin) {
                            yi = m * (xmin - p0.x) + p0.y;
                            p1 = leaflet.point(xmin, yi);
                        } else {
                            yi = m * (xmax - p0.x) + p0.y;
                            p1 = leaflet.point(xmax, yi);
                        }
                    } else if (between(p1.x, xmin, xmax)) {
                        m = (p1.x - p0.x) / (p1.y - p0.y);
                        let xi;
                        if (p1.y < ymin) {
                            xi = m * (ymin - p0.y) + p0.x;
                            p1 = leaflet.point(xi, ymin);
                        } else {
                            xi = m * (ymax - p0.y) + p0.x;
                            p1 = leaflet.point(xi, ymax);
                        }
                    }
                }

                return new PolylineLink(p0, p1);
            }

        };

        return PolylineLink;
    })

    // A factory function that calculates a PolylineLink from two points and an offset
    .factory("polylineLink", function(leaflet, PolylineLink){
        return function(p0, p1){
            return new PolylineLink(p0, p1);
        }
    })
})()
