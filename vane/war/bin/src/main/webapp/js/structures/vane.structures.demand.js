(function(){
    angular.module("vane.structures")
    .factory("demand", ['Demand', function(Demand){
        return function(jsonData) {
            let id = jsonData.id;
            let name = jsonData.name;
            let fromNode = jsonData.fromNode;
            let toNode = jsonData.toNode;
            let trafficProfile = jsonData.traffic;

            return new Demand(id, name, fromNode, toNode, trafficProfile);
        }
    }])
    .factory("Demand", ['$filter', 'MapDemand', 'HighlighterCircle', 'HighlighterPolyline', 'highlighterService', 'Route',
        function($filter, MapDemand, HighlighterCircle, HighlighterPolyline, highlighterService, Route) {
        function Demand(id, name, fromNode, toNode, trafficProfile) {
            this._id = id;
            this._name = name;
            this._fromNode = fromNode;
            this._toNode = toNode;

            this._trafficProfile0 = $filter('copyTrafficProfile')(trafficProfile);
            this.setTrafficProfile(trafficProfile);

            this._nodes = [];
            this._routes = [];
            this._disabled = false;
            this._enabledState = 'Enabled';

            this._dirty = false;

            this._hidden = true;
            this._highlighted = false;

            let className = `demand ${this._id}`

            this._mapDemand = new MapDemand(this, {className: className});
            // this._highlighter = new HighlighterPolyline(this);
            // this._highlighters = [this._highlighter];

            this._deletionFlag = false;
            this._newFlag = false;

        }

        Demand.prototype.id = function(){
            return this._id;
        };

        Demand.prototype.name = function(name){
            if (name) this._name = name;
            return this._name;
        };

        Demand.prototype.fromNode = function(fromNode){
            if (fromNode) this._fromNode = fromNode;
            return this._fromNode;
        };

        Demand.prototype.toNode = function(toNode){
            if (toNode) this._toNode = toNode;
            return this._toNode;
        };

        Demand.prototype.getId = function() {
            return this._id;
        };

        Demand.prototype.setId = function(id) {
            this._id = id;
        };

        Demand.prototype.getName = function() {
            return this._name;
        };

        Demand.prototype.getPrettifiedName = function() {
            // return $filter('toTitleCase')(this._name).replace('-->', '\u21fe').replace('_', ' ');
            return this._name.replace('-->', '\u21fe').replace('_', ' ');
        };

        Demand.prototype.setName = function(newName) {
            this._name = newName;
        };

        Demand.prototype.getFromNode = function() {
            return this._fromNode;
        };

        Demand.prototype.setFromNode = function(fromNode) {
            this._fromNode = fromNode;
        };

        Demand.prototype.getToNode = function() {
            return this._toNode;
        };

        Demand.prototype.setToNode = function(toNode) {
            this._toNode = toNode;
        };

        Demand.prototype.setMap = function(map) {
            this._map = map;
        };

        Demand.prototype.getMapOverlay = function() {
            return this._mapDemand;
        };

        Demand.prototype.getTrafficProfile = function() {
            return this._trafficProfile;
        };

        Demand.prototype.setTrafficProfile = function(trafficProfile) {
            this._trafficProfile = trafficProfile;
            this._updateTrafficTimeSeries();
        };

        Demand.prototype._updateTrafficProfile = function() {
            this._dirty = true;
            this._trafficProfile = $filter('parseTrafficProfileFromTimeSeries')(this._trafficTimeSeries);
        };

        Demand.prototype.getTrafficTimeSeries = function() {
            return this._trafficTimeSeries;
        };

        Demand.prototype.setTrafficTimeSeries = function(trafficTimeSeries) {
            this._trafficTimeSeries = trafficTimeSeries;
            this._updateTrafficProfile();
        };

        Demand.prototype._updateTrafficTimeSeries = function() {
            this._dirty = true;
            this._trafficTimeSeries = $filter('parseTrafficTimeSeries')(this._trafficProfile);
        };

        Demand.prototype.isSatisfied = function() {
            return this._routes.length > 0;
        };

        Demand.prototype.resolveReferences = function(subnet){

            let fromNode = this.fromNode();
            let toNode = this.toNode();

            if (typeof fromNode !== "object") {
                let node = subnet.nodeById(fromNode);
                if (!node) throw "Could not find Node with ID " + fromNode;
                fromNode = this.fromNode(node);
            }

            if (typeof toNode !== "object") {
                let node = subnet.nodeById(toNode);
                if (!node) throw "Could not find Node with ID " + toNode;
                toNode = this.toNode(node);
            }

            // this._nodes = [fromNode, toNode];
            // let highlighters = [this._highlighter];

            // for (let node of this._nodes) {
            //     highlighters.push(new HighlighterCircle(node));
            // }

            // this._highlighters = highlighters;

            fromNode.addAssociatedDemand(this);
            toNode.addAssociatedDemand(this);
        };

        Demand.prototype.enable = function() {
            this._disabled = false;
            this._enabledState = 'Enabled';

            this._dirty = true;

            if (this.fromNode().isDisabled()) {
                this.fromNode().enable();
            }

            if (this.toNode().isDisabled()) {
                this.toNode().enable();
            }
            console.log("Enabled Demand " + this.id() + ": " + this.name());
        };

        Demand.prototype.disable = function() {
            this._disabled = true;
            this._enabledState = 'Disabled';

            this._dirty = true;
            console.log("Disabled Demand " + this.id() + ": " + this.name());
        };

        Demand.prototype.isDisabled = function() {
            return this._disabled || this.fromNode().isDisabled() || this.toNode().isDisabled();
            // return this._disabled;
        };

        Demand.prototype.enabledState = function() {
            // if (this._disabled) {
            //     return 'Disabled';
            // } else {
            //     return 'Enabled';
            // }
            return this._enabledState;
        };

        Demand.prototype.isNew = function() {
            return this._newFlag;
        };

        Demand.prototype.flagNew = function() {
            this._newFlag = true;
        };

        Demand.prototype.changes = function(){
            changes = {id: this.getId()};
            let fromNode = this.getFromNode();
            let toNode = this.getToNode();

            if (this.isNew()) {
                changes.name = this.getName();
                changes.fromNode = fromNode.getId();
                changes.fromNodeName = fromNode.getName();
                changes.toNode = toNode.getId();
                changes.toNodeName = toNode.getName();
                changes.profile = this.getTrafficProfile();
            } else if (this.isDirty()) {
                changes.disabled = this.isDisabled();
                changes.flagged4Deletion = this.flagged4Deletion();
                changes.name = this.getName();
                changes.fromNode = fromNode.getId();
                changes.fromNodeName = fromNode.getName();
                changes.toNode = toNode.getId();
                changes.toNodeName = toNode.getName();
                changes.profile = this.getTrafficProfile();
            }
            return changes;
        };

        Demand.prototype.flush = function(){
            changes = this.changes()
            // if (this.isDirty()) {
            //     this._dirty = false;
            // }
            return changes;
        };

        Demand.prototype.isDirty = function(isDirty){
            if (isDirty !== undefined) {
                this._dirty = isDirty;
            }
            return this._dirty;
        };

        Demand.prototype.setDirty = function() {
            this._dirty = true;
        };

        Demand.prototype.getWeight = function() {
            // if (this.hidden()) {
            //     return 0.0;
            // } else {
            //     return 8;
            // }
            return 8;
        };

        Demand.prototype.getColor = function() {
            // return "#0f0f0f";
            if (this.isSatisfied()) {
                // return '#00ff0f';
                return '#00cc00'
            // } else if (this.isDisabled()) {
            //     return '#4f4f4f';
            } else {
                // return '#0f0f0f';
                return '#ff0000';
            }
        };

        Demand.prototype.getOpacity = function(){
            if (this.flagged4Deletion()) {
                return 0.0;
            } else if (this.hidden()) {
                return 0.1;
            } else if (this.isDisabled()) {
                return 0.1;
            } else if (this.highlighted()) {
                return 0.8;
            } else {
                return 0.5;
            }
        };

        Demand.prototype.polyline = function(){
            return this._mapDemand.polyline();
        };

        Demand.prototype._update = function(){
            this._mapDemand._update();
            // this._highlighter._update();
        };

        Demand.prototype.addToMap = function(layerGroup, map){

            if (layerGroup != null) {
                // if (this._layerGroup) {
                //     this._layerGroup.removeLayer(this._mapDemand)
                // }
                this._layerGroup = layerGroup;
            } else {
                if (this._layerGroup) {
                    layerGroup = this._layerGroup;
                }
            }

            if (map !== undefined) {
                if (this._map) {
                    this._mapDemand.remove(this._map);
                }
                this._map = map;
            } else {
                map = this._map;
            }

            if (!map) throw "Demand.addToMap function missing required 'map' argument";

            if (layerGroup) {
                layerGroup.addLayer(this._mapDemand).addTo(map);
            } else {
                this._mapDemand.addTo(map);
            }
        };

        Demand.prototype.hide = function() {
            this._hidden = true;
            this.unhighlight();
            // this.hideNodes();
        };

        Demand.prototype.show = function() {
            this._hidden = false;
            // this._highlighted = false;
            this._mapDemand.bringToFront();
            this._mapDemand._update();
            this.showNodes();
            // this.bringToFront();
        };

        Demand.prototype.unhighlight = function() {
            this._highlighted = false;
            this._mapDemand._update();
            // this.unhighlightNodes();
        };

        Demand.prototype.highlight = function() {
            this._highlighted = true;
            this.show();
            // this.highlightNodes();
        };

        Demand.prototype.hideNodes = function() {
            this._fromNode.hide();
            this._toNode.hide();
        };

        Demand.prototype.showNodes = function() {
            this._fromNode.show();
            this._toNode.show();
        };

        Demand.prototype.hidden = function() {
            return this._hidden;
        };

        Demand.prototype.highlighted = function() {
            return this._highlighted;
        };

        Demand.prototype.on = function(event, callback){
            this._mapDemand.on(event, callback, this);
        };

        Demand.prototype.routes = function(routes) {
            if (routes != null) {
                this._routes = routes;
            }
            return this._routes;
        };

        Demand.prototype.addRoute = function(route) {
            if (route != null) {
                if (!(route instanceof Route)) {
                    route = new Route(route.id, this.name(), route.links, route.traffic);
                }
                // route.addToMap(this._map);
                this._routes.push(route);
            }
        };

        Demand.prototype.restoreOriginalTrafficProfile = function() {
            this.setTrafficProfile(this._trafficProfile0);
            this._dirty = false;
        };

        Demand.prototype.resetRoutes = function() {
            this._routes.length = 0;
        };

        Demand.prototype.getStatistics = function() {
            let trafficAmounts = this._trafficTimeSeries.amounts.slice();
            trafficAmounts.sort(function(a, b){return a - b});

            let min = trafficAmounts[0];
            let max = trafficAmounts[trafficAmounts.length - 1];
            let mean = $filter("computeAverage")(trafficAmounts);
            let std = $filter("computeStd")(trafficAmounts);
            let p95 = $filter("computePercentile")(trafficAmounts, 95);

            return {mean: mean, min: min, max: max, std: std, p95: p95};
        };

        Demand.prototype.generateConstantTrafficProfile = function(startTime, endTime, timeStep, constantTrafficAmount) {
            let time = startTime;
            let trafficProfile = [];
            while (time <= endTime) {
                trafficProfile.push({'time': time, 'amount': constantTrafficAmount});
                time += timeStep;
            }
            return trafficProfile;
        };

        Demand.prototype.generateRandomTrafficProfile = function(startTime, endTime, timeStep, minTrafficAmount, maxTrafficAmount) {
            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            }

            let time = startTime;
            let trafficProfile = [];
            while (time <= endTime) {
                trafficProfile.push({'time': time, 'amount': getRandomInt(minTrafficAmount, maxTrafficAmount)});
                time += timeStep;
            }
            return trafficProfile;
        };

        Demand.prototype.flagged4Deletion = function() {
            return this._deletionFlag;
        };

        Demand.prototype.flag4Deletion = function() {
            this._deletionFlag = true;
            this._dirty = true;
        };

        Demand.prototype.unflag4Deletion = function() {
            this._deletionFlag = false;
        };

        Demand.prototype.undoLastChange = function() {
            console.log("undo/redo functionality not yet implemented...");
        };

        Demand.prototype.redoEdit = function() {
            console.log("undo/redo functionality not yet implemented...");
        };

        Demand.prototype.structureClass = function() {
            return "Demand";
        };

        return Demand;
    }])
})()
