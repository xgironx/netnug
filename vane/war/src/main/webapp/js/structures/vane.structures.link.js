(function(){
    angular.module("vane.structures")
    .factory("link", ['Link', 'misc', function(Link, misc){
        return function(jsonData, subnet){
            let id = jsonData.id;
            let name = jsonData.name;
            let fromNode = jsonData.fromNode;
            let toNode = jsonData.toNode;
            let model = jsonData.model;
            let capacity = jsonData.capacity;

            if (!capacity && model in misc.modelCapacityMap) {
                capacity = misc.modelCapacityMap[model];
            }
            let usage = jsonData.usage;
            let trafficProfile = jsonData.traffic;
            let duplex = jsonData.duplex;
            let direction = jsonData.direction;
            let reverseLink = jsonData.reverseLink;

            if (subnet) {
                fromNode = subnet.nodeById(fromNode);
                toNode = subnet.nodeById(toNode);
            }

            return new Link(id, name, fromNode, toNode, model, capacity, usage, trafficProfile, duplex, direction, reverseLink);
        }
    }])
    .factory("Link", ['$filter', '$timeout', 'MapLink', 'AnimatedTraffic', 'LinkTraffic', 'HighlighterPolyline', 'coloring', 'highlighterService', 'selectionService', 'misc',
        function($filter, $timeout, MapLink, AnimatedTraffic, LinkTraffic, HighlighterPolyline, coloring, highlighterService, selectionService, misc) {
            function Link(id, name, fromNode, toNode, model, capacity, usage, trafficProfile, duplex, direction, reverseLink) {
                this._id = id;
                this._name = name;
                this._fromNode = fromNode;
                this._toNode = toNode;
                this._model = model;
                if (!capacity && model in misc.modelCapacityMap) {
                    capacity = misc.modelCapacityMap[model];
                }
                this._capacity = capacity;
                this._usage = usage;
                this._trafficProfile = trafficProfile;
                this._updateTrafficTimeSeries();

                this._duplex = duplex;
                this._direction = direction;
                this._reverseLink = reverseLink;

                this._disabled = false;
                this._dirty = false;

                this._isFocused = false;
                this._hidden = false;

                this._mapLink = new MapLink(this, {duplex: duplex, duplexLinkStyle: 'Default'});
                this._highlighter = new HighlighterPolyline(this);
                this._demands = [];

                this._trafficFlow = null;
                this._trafficHidden = false;

                this._deletionFlag = false;
                this._newFlag = false;

                this._layerGroup = null;

                this.on("click", function(event){
                    if(event.originalEvent.shiftKey){
                        this.toggleSelection();
                    }else if(this.selected()){
                        selectionService.deselectAll();
                    }else{
                        selectionService.selectOnly(this);
                        // this.openPopup();
                    }
                });

                this.on("layerremove", function(event) {
                    // this.unhighlight();
                    let layerGroup = this._layerGroup;
                    let highlighter = this._highlighter;

                    if (layerGroup && layerGroup.hasLayer(highlighter)) {
                        layerGroup.removeLayer(highlighter);
                    } else {
                        highlighter.remove();
                    }
                });
            }

            Link.prototype.id = function(){
                return this._id;
            };

            Link.prototype.name = function(name){
                if (name) this._name = name;
                return this._name;
            };

            Link.prototype.fromNode = function(fromNode){
                if (fromNode) this._fromNode = fromNode;
                return this._fromNode;
            };

            Link.prototype.toNode = function(toNode){
                if (toNode) this._toNode = toNode;
                return this._toNode;
            };

            Link.prototype.model = function(model){

                if (model) {
                    this._model = model;
                    if (model in misc.modelCapacityMap) {
                        this._capacity = misc.modelCapacityMap[model];
                    }
                    this._update();
                    this._dirty = true;
                }
                return this._model;
            };

            Link.prototype.capacity = function(capacity){

                if (capacity) {
                    this.setCapacity(capacity)
                }
                return this._capacity;
            };

            Link.prototype.usage = function(usage){
                if (usage !== undefined) {
                    this._usage = usage;
                    this._update();
                }
                return this._usage;
            };

            Link.prototype.duplex = function(duplex){
                if (duplex) {
                    this._duplex = duplex;
                }
                return this._duplex;
            };

            Link.prototype.direction = function(direction) {
                if (direction) {
                    this._direction = direction;
                }
                return this._direction;
            };

            Link.prototype.reverseLink = function(reverseLink) {
                if (reverseLink) {
                    this._reverseLink = reverseLink;
                }
                return this._reverseLink;
            };

            Link.prototype.getId = function() {
                return this._id;
            };

            Link.prototype.setId = function(id) {
                this._id = id;
            };

            Link.prototype.getName = function() {
                return this._name;
            };

            Link.prototype.getPrettifiedName = function() {
                // return $filter('toTitleCase')(this._name).replace('<->', '\u21c4').replace('->', '\u2192').replace('_', ' ');
                return this._name.replace('<->', '\u21c4').replace('->', '\u2192').replace('_', ' ');
            };

            Link.prototype.setName = function(newName) {
                this._name = newName;
            };

            Link.prototype.getFromNode = function() {
                return this._fromNode;
            };

            Link.prototype.setFromNode = function(fromNode) {
                this._fromNode = fromNode;
            };

            Link.prototype.getToNode = function() {
                return this._toNode;
            };

            Link.prototype.setToNode = function(toNode) {
                this._toNode = toNode;
            };

            Link.prototype.getModel = function() {
                return this._model;
            };

            Link.prototype.setModel = function(model) {
                if (model) {
                    this._model = model;
                }
                return this;
            };

            Link.prototype.getCapacity = function() {
                return this._capacity;
            };

            Link.prototype.setCapacity = function(capacity) {
                if (capacity) {
                    this._capacity = capacity;

                    if (capacity in misc.capacityModelMap) {
                        this.setModel(misc.capacityModelMap[capacity]);
                    }
                    this._update();
                    this._dirty = true;
                }

                if (this.duplex() && this.reverseLink() != null && this.reverseLink().getCapacity() != capacity) {
                    this.reverseLink().setCapacity(capacity);
                }

                return this;
            };

            Link.prototype.getUsage = function() {
                return this._usage;
            };

            Link.prototype.setUsage = function(usage) {
                this._usage = usage;
                this._update();
                return this;
            };

            Link.prototype.getDirection = function() {
                return this._direction;
            };

            Link.prototype.setDirection = function(direction) {
                if (direction) {
                    this._direction = direction;
                }

                return this;

            };

            Link.prototype.getReverseLink = function() {
                return this._reverseLink;
            };

            Link.prototype.setReverseLink = function(reverseLink) {
                if (reverseLink) this._reverseLink = reverseLink;
            };

            Link.prototype.setMap = function(map) {
                this._map = map;
            };

            Link.prototype.getMapOverlay = function() {
                return this._mapLink;
            };

            Link.prototype.getTrafficOverlay = function() {
                return this._trafficFlow;
            };

            Link.prototype.demands = function(demands){
                if (demands) {
                    this._demands = demands;
                }
                return this._demands;
            };

            Link.prototype.isNew = function() {
                return this._newFlag;
            };

            Link.prototype.flagNew = function() {
                this._newFlag = true;
            };

            Link.prototype.capacityToWeight = function(capacity){
                // w = {min: 8.0, max: 12.0};
                // b = {min: 100e6, max: 10e9};
                // return (w.max - w.min) / (b.max - b.min) * (capacity - b.min) + w.min;
                let l = Math.log10(capacity);
                let weight = 1+(12/(1+Math.exp(8-l)));
                return weight;
            };

            Link.prototype.width = function(){
                return this.capacityToWeight(this.capacity());
            };

            Link.prototype.color = function(){
                return coloring.color(this.getUsage());
            };

            Link.prototype.getColor = function() {
                return '#A0A0A0';
            };

            Link.prototype.getOpacity = function() {
                if (this.flagged4Deletion() || this.hidden()) {
                    return 0.0;
                } else if (this.isDisabled()) {
                    return 0.1;
                } else if (this.selected()) {
                    return 0.75;
                } else if (this.highlighted()) {
                    return 0.75;
                } else {
                    return 0.5;
                }
            };

            Link.prototype.getLinkColor = function() {
                return this.getColor();
            };

            Link.prototype.getLinkOpacity = function() {
                return this.getOpacity();
            };

            Link.prototype.getLinkWeight = function() {
                if (this.hidden()) {
                    return 0.0;
                // } else if (this.selected()) {
                //     return this.width();
                } else {
                    return this.width();
                }
            };

            Link.prototype.getTrafficColor = function() {
                return this.color();
            };

            Link.prototype.getTrafficOpacity = function() {
                if (this.hidden()) {
                    return 0.0;
                } else {
                    return 1.0;
                }
            };

            Link.prototype.getTrafficWeight = function() {
                // weight = this.usage() * this.getLinkWeight();
                // w = {min: 5, max: 12};
                // u = {min: 0.0, max: 1};

                // weight = (w.max - w.min) / (u.max - u.min) * this.usage() + w.min;
                // // return weight / this.getLinkWeight();
                // return weight;

                let usage = this.usage();
                let linkWeight = this.getLinkWeight();

                if (usage == null || usage === 0) {
                    return 0.0;
                } else if (usage > 0 && usage < 0.25) {
                    return 0.25 * linkWeight;
                } else if (usage >= 0.25 && usage < 0.5) {
                    return 0.5 * linkWeight;
                } else if (usage >= 0.5 && usage < 0.75) {
                    return 0.75 * linkWeight;
                } else if (usage >= 0.75 && usage <= 1) {
                    return linkWeight;
                }

                // return this.getLinkWeight();
            };

            Link.prototype.getTrafficSpeed = function() {
                // let usage = this.usage(this._usage);
                // let speed = Math.pow(this.width(), 1.4);

                // if (isNaN(speed) || !speed) {
                //  speed = 0;
                //  speed = speed;
                // }

                // speed = 5 * speed;

                // return speed;
                return Math.pow(10, 1.5);

            };

            Link.prototype.getTrafficProfile = function() {
                return this._trafficProfile;
            };

            Link.prototype.setTrafficProfile = function(trafficProfile) {
                this._trafficProfile = trafficProfile;
                this._updateTrafficTimeSeries();
            };

            Link.prototype._updateTrafficProfile = function() {
                this._trafficProfile = $filter('parseTrafficProfileFromTimeSeries')(this._trafficTimeSeries);
            };

            Link.prototype.getTrafficTimeSeries = function() {
                return $filter('parseTrafficTimeSeries')(this._trafficProfile);
            };

            Link.prototype.setTrafficTimeSeries = function(trafficTimeSeries) {
                this._trafficTimeSeries = trafficTimeSeries;
                this._updateTrafficProfile();
            };

            Link.prototype._updateTrafficTimeSeries = function() {
                this._trafficTimeSeries = $filter('parseTrafficTimeSeries')(this._trafficProfile);
            };

            Link.prototype.getBandwidthUtilizationTimeSeries = function() {
                return $filter('parseUsageTimeSeries')(this._trafficProfile, this._capacity);
            };

            Link.prototype._update = function(){
                this._mapLink._update();
                if (this._trafficFlow && !this._trafficHidden) {
                    this._trafficFlow._update();
                }
                this._highlighter._update();
            };

            Link.prototype.addToMap = function(layerGroup, map){
                if (layerGroup != null) {
                    // if (this._layerGroup) {
                    //     this._layerGroup.removeLayer(this._mapLink)
                    // }
                    this._layerGroup = layerGroup;
                } else {
                    if (this._layerGroup) {
                        layerGroup = this._layerGroup;
                    }
                }

                if (map !== undefined) {
                    if (this._map) {
                        this._mapLink.removeFrom(this._map);
                    }
                    this._map = map;
                } else {
                    map = this._map;
                }

                if (!map) throw "Link.addToMap function missing required 'map' argument";

                if (layerGroup) {
                    layerGroup.addLayer(this._mapLink).addTo(map);
                } else {
                    this._mapLink.addTo(map);
                }
            };

            Link.prototype.addTraffic = function(layerGroup, map) {
                if (layerGroup == null && this._layerGroup) {
                    layerGroup = this._layerGroup;
                }

                if (map === undefined && this._map) {
                    map = this._map;
                }

                if (!map) throw "Link.addTraffic function missing required 'map' argument";

                let trafficFlow = this._trafficFlow;

                if (trafficFlow) {
                    if (layerGroup && layerGroup.hasLayer(trafficFlow)) {
                        layerGroup.removeLayer(trafficFlow);
                    } else {
                        map.removeLayer(trafficFlow);
                    }
                }

                let className = `leaflet-ant-path ${this._id}`
                // this._trafficFlow = new LinkTraffic(this._mapLink, {className: className});
                this._trafficFlow = new AnimatedTraffic(this._mapLink, {className: className});
                // this._trafficFlow = new AnimatedTraffic(this, {className: className});

                trafficFlow = this._trafficFlow;

                if (layerGroup) {
                    layerGroup.addLayer(trafficFlow).addTo(map);
                } else {
                    trafficFlow.addTo(map);
                }

                trafficFlow._update();
                trafficFlow.enable().start();
            };

            Link.prototype.removeTraffic = function() {
                let trafficFlow = this._trafficFlow;

                if (trafficFlow) {
                    let layerGroup = this._layerGroup;
                    if (layerGroup && layerGroup.hasLayer(trafficFlow)) {
                        layerGroup.removeLayer(trafficFlow);
                    } else {
                        trafficFlow.remove();
                    }
                }
            };

            Link.prototype.update = function() {
                // this._trafficFlow.setStyle({color: this.getTrafficColor(),
                //                          opacity: this.getTrafficOpacity(),
                //                          speed: this.getTrafficSpeed(),
                //                          weight: this.getTrafficWeight()});
                // this._mapLink._update();
                // this._trafficFlow._update();
                this._update();
            };

            Link.prototype.resolveReferences = function(subnet) {
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

                fromNode.addOutgoingLink(this);
                toNode.addIncomingLink(this);

                if (this.duplex()) {
                    let reverseLink = this.reverseLink();
                    if (typeof reverseLink !== "object") {
                        reverseLink = subnet.linkById(reverseLink);
                        if (!reverseLink) {
                            console.log(this);
                            throw "Could not find Link with ID " + reverseLink;
                        }
                        reverseLink = this.reverseLink(reverseLink);
                    }
                }

                this._mapLink.setLatLngs();

            };

            Link.prototype.polyline = function(){
                return this._mapLink.polyline();
            };

            Link.prototype.hide = function() {
                this.hideLink();
            };

            Link.prototype.show = function(linkOnly) {
                this.showLink();
                if (!linkOnly) {
                    this.showTraffic();
                }
            };

            Link.prototype.hideLink = function() {
                this._hidden = true;
                // this._isFocused = false;
                // this._mapLink.bringToBack();
                this._mapLink._update();
                this.hideTraffic();
                this.unhighlight();
            };

            Link.prototype.showLink = function() {
                this._hidden = false;
                // this._isFocused = true;
                // this._mapLink.bringToFront();
                this._mapLink._update();
                this.showNodes();
                // this.highlight();
            };

            Link.prototype.hideTraffic = function() {
                // this._hidden = true;
                // this._isFocused = false;
                // this._mapLink.bringToBack();
                if (this._trafficFlow) {
                    this._trafficFlow.disable();
                    this._trafficFlow._update();
                    this._trafficHidden = true;
                }
            };

            Link.prototype.showTraffic = function() {
                if (!this._hidden && this._trafficFlow) {
                // if (this._trafficFlow) {
                    this._trafficFlow.enable().start();
                    this._trafficFlow._update();
                    this._trafficHidden = false;
                }
            };

            Link.prototype.hideNodes = function() {
                this._fromNode.hide();
                this._toNode.hide();
            };

            Link.prototype.showNodes = function() {
                this._fromNode.show();
                this._toNode.show();
            };

            Link.prototype.unhighlightNodes = function() {
                this._fromNode.unhighlight();
                this._toNode.unhighlight();
            };

            Link.prototype.highlightNodes = function() {
                this.showNodes();
                this._fromNode.highlight();
                this._toNode.highlight();
            };

            Link.prototype._highlight = function(){
                if (!this.selected()) {
                    let layerGroup = this._layerGroup;
                    let highlighter = this._highlighter;
                    let map = this._map;

                    if (layerGroup && !layerGroup.hasLayer(highlighter)) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                        layerGroup.addLayer(highlighter).addTo(map);
                    } else {
                        highlighter.remove().addTo(map);
                    }
                }
            };

            Link.prototype._unhighlight = function(){
                if (!this.selected()) {
                    let layerGroup = this._layerGroup;
                    let highlighter = this._highlighter;

                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                    } else {
                        highlighter.remove();
                    }
                }
            };

            Link.prototype.highlight = function(popup){
                this.show();
                highlighterService.highlight(this);
                this.bringToFront();
                // this._highlighter._update();
                // this._update();
                if (popup) {
                    this._mapLink.bindPopup(popup).openPopup(this.getMidPointLatLng())
                }
            };

            Link.prototype.unhighlight = function(){
                highlighterService.unhighlight(this);
                // this.bringToBack();
                this._update();
                // this.closePopup();
                this.unbindPopup();
            };

            Link.prototype.highlighted = function() {
                return highlighterService.isHighlighted(this);
            };

            Link.prototype.toggleHighlight = function() {
                if (this.highlighted()) {
                    this.unhighlight();
                } else {
                    this.highlight();
                }
            };

            Link.prototype._select = function(){
                if (!this.highlighted()) {
                    let layerGroup = this._layerGroup;
                    let highlighter = this._highlighter;

                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                        layerGroup.addLayer(highlighter).addTo(this._map);
                    } else {
                        highlighter.remove().addTo(this._map);
                    }
                }
            };

            Link.prototype._deselect = function(){
                if (!this.highlighted()) {
                    let layerGroup = this._layerGroup;
                    let highlighter = this._highlighter;

                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                    } else {
                        highlighter.remove();
                    }
                }
            };

            Link.prototype.select = function(){
                console.log("selecting link...");

                highlighterService.unhighlight(this);
                selectionService.select(this);
                this._update();

                if (this.duplex() && this.reverseLink() != null) {
                    if (!this.reverseLink().selected()) {
                        // selectionService.select(this.reverseLink());
                        this.reverseLink().select();
                    }
                }
                // this.openPopup();
            };

            Link.prototype.deselect = function(){
                console.log("deselecting link...");
                this._mapLink.unbindPopup();
                selectionService.deselect(this);
                this._update();

                if (this.duplex() && this.reverseLink() != null) {
                    if (this.reverseLink().selected()) {
                        // selectionService.deselect(this.reverseLink());
                        this.reverseLink().deselect();
                    }
                }

                // this.closePopup();
                this.unbindPopup();
            };

            Link.prototype.selected = function(newState){
                if(newState == null){
                    return selectionService.isSelected(this);
                }else if(newState == true){
                    this.select();
                    return selectionService.isSelected(this);
                }else if(newState == false){
                    this.deselect();
                    return selectionService.isSelected(this);
                }
            };

            Link.prototype.toggleSelection = function(){
                console.log("toggling selection");
                if(this.selected()){
                    this.deselect();
                }else{
                    this.select();
                }
                selectionService.updateSelections();
            };

            Link.prototype.changes = function(){
                changes = {id: this.getId()};

                if (this.isNew()) {
                    changes.new = true;
                    changes.name = this.getName();
                    changes.fromNode = this.getFromNode().getId();
                    changes.toNode = this.getToNode().getId();
                    changes.fromNodeName = this.getFromNode().getName();
                    changes.toNodeName = this.getToNode().getName();
                    changes.model = this.getModel();
                    changes.capacity = this.getCapacity();
                    changes.duplex = this.duplex();
                    changes.direction = this.getDirection();
                    if (this.duplex()) {
                        changes.reverseLink = this.getReverseLink().getId();
                    }
                } else if (this.isDirty()) {
                    changes.disabled = this.isDisabled();
                    changes.flagged4Deletion = this.flagged4Deletion();
                    changes.name = this.getName();
                    changes.model = this.getModel();
                    changes.capacity = this.getCapacity();
                    changes.fromNode = this.getFromNode().getId();
                    changes.toNode = this.getToNode().getId();
                    changes.fromNodeName = this.getFromNode().getName();
                    changes.toNodeName = this.getToNode().getName();
                }

                return changes;
            };

            Link.prototype.flush = function(){
                changes = this.changes()
                // if (this.isDirty()) {
                //     this._dirty = false;
                // }

                // if (this.isNew()) {
                //     this._isNew = false;
                // }

                return changes;
            };

            Link.prototype.isDirty = function(isDirty) {
                if (isDirty !== undefined) {
                    this._dirty = isDirty;
                }
                return this._dirty;
            };

            Link.prototype.setDirty = function() {
                this._dirty = true;
            };

            Link.prototype.enable = function() {
                this._disabled = false;
                this._dirty = true;
                this._mapLink._update();
                this.addTraffic();

                if (this.fromNode().isDisabled()) {
                    this.fromNode().enable();
                }

                if (this.toNode().isDisabled()) {
                    this.toNode().enable();
                }
                console.log("Enabled Link " + this.id() + ": " + this.name());

                if (this.duplex() && this.reverseLink() != null && this.reverseLink().isDisabled()) {
                    this.reverseLink().enable();
                }

            };

            Link.prototype.disable = function() {
                this._usage = null;
                this._disabled = true;
                this._dirty = true;
                // this._mapLink.remove();
                this._mapLink._update();

                this.removeTraffic();

                // this.deselect();
                console.log("Disabled Link " + this.id() + ": " + this.name());

                if (this.duplex() && this.reverseLink() != null && !this.reverseLink().isDisabled()) {
                    this.reverseLink().disable();
                }

                this.unbindPopup();
            };

            Link.prototype.isDisabled = function() {
                return this._disabled;
            };

            Link.prototype.enabledState = function() {
                if (this._disabled) {
                    return 'Disabled';
                } else {
                    return 'Enabled';
                }
            };

            Link.prototype.hidden = function() {
                return this._hidden;
            };

            Link.prototype.isFocused = function() {
                return this._isFocused;
            };

            Link.prototype.on = function(event, callback){
                this._mapLink.on(event, callback, this);
            };

            Link.prototype.resetDemands = function() {
                this._demands = [];
            };

            Link.prototype.bringToFront = function() {
                this._mapLink.bringToFront();
                // this._mapLink._update();

                if (this._trafficFlow) {
                    this._trafficFlow.bringToFront();
                    // this._trafficFlow._update();
                }
                this._update();
            };

            Link.prototype.bringToBack = function() {
                this._mapLink.bringToBack();
                // this._mapLink._update();

                if (this._trafficFlow) {
                    this._trafficFlow.bringToBack();
                    // this._trafficFlow._update();
                }
                this._update();
            };

            Link.prototype.getAssociatedDemands = function() {
                return this._demands;
            };

            Link.prototype.flagged4Deletion = function() {
                return this._deletionFlag;
            };

            Link.prototype.flag4Deletion = function() {
                this._deletionFlag = true;
                this._dirty = true;
                // this.closePopup();
                this.unbindPopup();
            };

            Link.prototype.unflag4Deletion = function() {
                this._deletionFlag = false;
            };

            Link.prototype.undoLastChange = function() {
                console.log("undo/redo functionality not yet implemented...");
            };

            Link.prototype.redoEdit = function() {
                console.log("undo/redo functionality not yet implemented...");
            };

            Link.prototype.structureClass = function() {
                return "Link";
            };

            Link.prototype.getMidPointLatLng = function() {
                let p0 = this._map.latLngToLayerPoint(this.fromNode().getLatLng());
                let p1 = this._map.latLngToLayerPoint(this.toNode().getLatLng());
                let interval = p1.subtract(p0);
                return this._map.layerPointToLatLng(p0.add(interval.divideBy(2.0)));
            };

            Link.prototype.openPopup = function(content, options, latLng) {
                this.unbindPopup();

                if (!content) {
                    content = "<div><strong>Name: </strong>" + this.getPrettifiedName() + "</div>" +
                              "<div><strong>ID: </strong>" + this.getId() + "</div>" +
                              "<div><strong>From: </strong>" + this.getFromNode().getPrettifiedName() + "</div>" +
                              "<div><strong>To: </strong>" + this.getToNode().getPrettifiedName() + "</div>" +
                              "<div><strong>Model: </strong>" + this.getModel() + "</div>" +
                              "<div><strong>Demands: </strong> " + this.getAssociatedDemands().length + "</div>" +
                              "<div><strong>Max Usage:</strong> " + $filter('percent')(this.getUsage(), 3) + "</div>";
                }

                // if (!options) {
                //     options = {autoClose: false};
                // }

                if (!latLng) {
                    latLng = this.getMidPointLatLng();
                }

                this._mapLink.bindPopup(content, options).openPopup(latLng);

                return this;

            };

            Link.prototype.closePopup = function() {
                if (this._mapLink.getPopup()) {
                    this._mapLink.closePopup();
                }
                return this;
            };

            Link.prototype.unbindPopup = function() {
                if (this._mapLink.getPopup()) {
                    this._mapLink.closePopup().unbindPopup();
                    // this._mapLink.unbindPopup();
                }
                return this;
            };

            return Link;
        }
    ])
})()
