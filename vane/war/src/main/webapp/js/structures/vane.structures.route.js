(function(){
    angular.module("vane.structures")
    .factory("Route", ['$filter', 'leaflet', 'HighlighterPolyline', 'highlighterService',
        function($filter, leaflet, HighlighterPolyline, highlighterService){
            function Route(id, name, links, trafficProfile){
                this._id = id;
                this._name = name;
                // this._links = [...links];
                this._links = links;
                this._trafficProfile = trafficProfile;

                let linkIds = [];
                let nodes = new Set();
                let nodeIds = [];

                let count = 1;
                for (let link of links) {
                    linkIds.push('L' + link.getId());
                    // linkIds.push('Hop ' + count);
                    nodes.add(link.fromNode());
                    nodes.add(link.toNode());
                    nodeIds.push("(" + [link.fromNode().id(), link.toNode().id()] + ")");
                    // count++;
                }
                this._linkIds = linkIds;
                this._nodeIds = nodeIds;
                this._nodes = [...nodes];

                this._popups = [];

                // this._isDisabled = false;
                // this._isDirty = false;
            }

            Route.prototype.id = function() {
                return this._id;
            };

            Route.prototype.name = function(name){
                if (name) this._name = name;
                return this._name;
            };

            Route.prototype.links = function(links){
                if (links) this._links = links;
                return this._links;
            };

            Route.prototype.linkIds = function(){
                return this._linkIds.join("\u2192");
            };

            Route.prototype.nodes = function(nodes){
                if (nodes) this._nodes = nodes;
                return this._nodes;
            };

            Route.prototype.nodeIds = function(){
                return this._nodeIds.join("\u2192");
            };

            Route.prototype.getTrafficProfile = function() {
                return this._trafficProfile;
            };

            Route.prototype.getTrafficTimeSeries = function() {
                return $filter('parseTrafficTimeSeries')(this._trafficProfile);
            };

            Route.prototype.unhighlight = function() {

                for (let link of this._links) {
                    link.unhighlight();
                    link.unbindPopup();
                }
                // for (let i=0; i < this._links.length; i++) {
                //     let link = this._links[i];
                //     let linkId = this._linkIds[i];
                //     link.unhighlight();
                //     // link._mapLink.unbindPopup();
                // }
            };

            Route.prototype.highlight = function() {
                for (let i=0; i < this._links.length; i++) {
                    let link = this._links[i];
                    let linkId = this._linkIds[i];
                    let popupContent = "<div><strong>" + linkId + "</strong></div>";
                    // link._mapLink.bindPopup(popupContent).openPopup(link.getMidPointLatLng());
                    let popup = leaflet.popup({autoClose: false}).setContent(popupContent);
                    link.highlight(popup);
                    // link._update();
                }
                // console.log("popups: ", this._popups);
                // for (let link of this._links) {
                //     link.highlight();
                // }
            };

            Route.prototype.resetLinks = function() {
                this._links = [];
            };

            Route.prototype.structureClass = function() {
                return "Route";
            };

            return Route;
        }
    ])
})()
