(function(){
    angular.module("vane.structures")
    .factory("node", ['Node', 'leaflet', 'iconLookup', function(Node, leaflet, iconLookup) {
        return function(jsonData) {
            let id = null;
            let latLng = null;
            let name = null;
            let equipment = null;
            let model = null;
            let icon = iconLookup();

            if (jsonData) {
                id = jsonData.id;
                latLng = leaflet.latLng(jsonData.lat, jsonData.lng);
                name = jsonData.name;
                equipment = jsonData.equipment;
                model = jsonData.model;
                icon = jsonData.icon.toLowerCase();

                if (icon.startsWith('lan')) {
                    icon = 'lan';
                } else if (icon.startsWith('rtr')) {
                    icon = 'router';
                } else if (icon.startsWith('wkstn')) {
                    icon = 'workstation';
                }
                // console.log("jsonData.icon: ", icon);
                icon = iconLookup(icon);
            }

            return new Node(id, latLng, name, equipment, model, icon);
        }
    }])
    .factory("Node", ['$filter', 'iconLookup', 'highlighterService', 'selectionService', 'MapNode', 'HighlighterCircle',
        function($filter, iconLookup, highlighterService, selectionService, MapNode, HighlighterCircle) {
            function Node(id, latLng, name, equipment, model, icon) {
                this._id = id;
                this._latLng = latLng;
                this._name = name;
                this._equipment = equipment;
                this._model = model;
                this._icon = icon;

                this._disabled = false;
                this._enabledState = 'Enabled';
                this._dirty = false;

                this._highlighter = new HighlighterCircle(this);
                // this._map = undefined;
                this._mapNode = new MapNode(this._latLng, {icon: this._icon, draggable: true, zIndexOffset: 1000});

                this._incomingLinks = new Set();
                this._outgoingLinks = new Set();

                this._associatedDemands = new Set();

                this._deletionFlag = false;
                this._newFlag = false;

                this.on("click", function(event) {

                    if (event.originalEvent.shiftKey){
                        this.toggleSelection();
                    } else if (this.selected()){
                        selectionService.deselectAll();
                    } else {
                        selectionService.selectOnly(this);
                        // this.openPopup();
                    }
                });

                this.on("move", function(event) {
                    latLng = event.latlng;
                    this._latLng = latLng;
                    this._highlighter.setLatLng(latLng);
                    this.setDirty();
                    let incomingLinks = this.incomingLinks();
                    let outgoingLinks = this.outgoingLinks();
                    let associatedDemands = this.getAssociatedDemands();
                    if (incomingLinks) {
                        for (let link of incomingLinks) {
                            link._mapLink.setLatLngs();
                            link._update();
                        }
                    }

                    if (outgoingLinks) {
                        for (let link of outgoingLinks) {
                            link._mapLink.setLatLngs();
                            link._update();
                        }
                    }

                    if (associatedDemands) {
                        for (let demand of associatedDemands) {
                            demand._mapDemand.setLatLngs();
                            demand._update();
                        }
                    }

                });
            }

            Node.prototype.id = function() {
                return this._id;
            };

            Node.prototype.latLng = function(latLng){
                if (latLng) {
                    this.setLatLng(latLng);
                }
                return this.getLatLng();
            };

            Node.prototype.name = function(name){
                if (name) this._name = name;
                return this._name;
            };

            Node.prototype.equipment = function(equipment){
                if (equipment) this._equipment = equipment;
                return this._equipment;
            };

            Node.prototype.model = function(model){
                if (model) this._model = model;
                return this._model;
            };

            Node.prototype.icon = function(icon){
                if (icon) this._icon = icon;
                return this._icon;
            };

            Node.prototype.getId = function() {
                return this._id;
            };

            Node.prototype.setId = function(id) {
                this._id = id;
            };

            Node.prototype.getLatLng = function() {
                return this._latLng;
            };

            Node.prototype.setLatLng = function(latLng) {
                this._latLng = latLng;
            };

            Node.prototype.getName = function() {
                return this._name;
            };

            Node.prototype.getPrettifiedName = function() {
                // return $filter('toTitleCase')(this._name).replace('_', ' ');
                return this._name.replace('_', ' ');
            };

            Node.prototype.setName = function(newName){
                this._name = newName;
                this.setDirty();

                let incomingLinks = this.incomingLinks();
                let outgoingLinks = this.outgoingLinks();
                let associatedDemands = this.getAssociatedDemands();
                if (incomingLinks) {
                    for (let link of incomingLinks) {
                        link.setDirty();
                    }
                }

                if (outgoingLinks) {
                    for (let link of outgoingLinks) {
                        link.setDirty();
                    }
                }

                if (associatedDemands) {
                    for (let demand of associatedDemands) {
                        demand.setDirty();
                    }
                }

            };

            Node.prototype.getEquipment = function(){
                return this._equipment;
            };

            Node.prototype.setEquipment = function(equipment){
                if (equipment) {
                    this._equipment = equipment;
                    this.setModel(equipment);
                }
            };

            Node.prototype.getModel = function(){
                return this._model;
            };

            Node.prototype.setModel = function(model){
                if (model) {
                    this._model = model;
                    this._icon = iconLookup(model.toLowerCase());
                    if (this._mapNode) {
                        this._mapNode.setIcon(this._icon);
                    }
                    this.setDirty();
                }
            };

            Node.prototype.getIcon = function(){
                return this._icon;
            };

            Node.prototype.setIcon = function(icon){
                if(icon) this._icon = icon;
                return this._icon;
            };

            Node.prototype.getMapOverlay = function() {
                return this._mapNode;
            };

            Node.prototype.setMap = function(map) {
                // if (this._map) {
                //     this._mapNode.remove(this._map);
                // }
                this._map = map;
            };

            Node.prototype.addToMap = function(layerGroup, map) {
                if (layerGroup != null) {
                    // if (this._layerGroup) {
                    //     this._layerGroup.removeLayer(this._mapNode)
                    // }
                    this._layerGroup = layerGroup;
                } else {
                    if (this._layerGroup) {
                        layerGroup = this._layerGroup;
                    }
                }

                if (map !== undefined) {
                    if (this._map) {
                        this._mapNode.remove(this._map);
                    }
                    this._map = map;
                } else {
                    map = this._map;
                }

                if (!map) throw "Node.addToMap function missing required 'map' argument";

                if (layerGroup) {
                    layerGroup.addLayer(this._mapNode).addTo(map);
                } else {
                    this._mapNode.addTo(map);
                }

            };

            Node.prototype.isNew = function() {
                return this._newFlag;
            };

            Node.prototype.flagNew = function() {
                this._newFlag = true;
            };

            Node.prototype.incomingLinks = function() {
                return this._incomingLinks;
            };

            Node.prototype.addIncomingLink = function(link) {
                this._incomingLinks.add(link);
            };

            Node.prototype.removeIncomingLink = function(link) {
                this._incomingLinks.remove(link);
            };

            Node.prototype.outgoingLinks = function() {
                return this._outgoingLinks;
            };

            Node.prototype.addOutgoingLink = function(link) {
                this._outgoingLinks.add(link);
            };

            Node.prototype.removeOutgoingLink = function(link) {
                this._outgoingLinks.remove(link);
            };

            Node.prototype.associatedDemands = function() {
                return this._associatedDemands;
            };

            Node.prototype.addAssociatedDemand = function(demand) {
                this._associatedDemands.add(demand);
            };

            Node.prototype.removeAssociatedDemand = function(demand) {
                this._associatedDemands.remove(demand);
            };

            Node.prototype.getOpacity = function() {
                if (this._deletionFlag || this._hidden) {
                    return 0.0;
                } else if (this._disabled) {
                    return 0.4;
                } else {
                    return 1.0
                }
            };

            Node.prototype.hide = function(){
                this._hidden = true;
                // this._mapNode.setOpacity(0.0);
                this._mapNode.setOpacity(this.getOpacity());
                this.unhighlight();
            };

            Node.prototype.show = function(){
                this._hidden = false;
                this._mapNode.setOpacity(this.getOpacity());
            };

            Node.prototype._highlight = function(){
                if (!this.selected()) {
                    let layerGroup = this._layerGroup;
                    let highlighter = this._highlighter;
                    let map = this._map;

                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                        layerGroup.addLayer(highlighter).addTo(map);
                    } else {
                        highlighter.remove().addTo(map);
                    }
                }
            };

            Node.prototype._unhighlight = function(){
                if (!this.selected()) {
                    let highlighter = this._highlighter;
                    let layerGroup = this._layerGroup;
                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                    } else {
                        highlighter.remove();
                    }
                }
            };

            Node.prototype.highlight = function(){
                this.show();
                highlighterService.highlight(this);
                this._mapNode._bringToFront();
                // this._highlighter._updateColor();
            };

            Node.prototype.unhighlight = function(){
                highlighterService.unhighlight(this);
                this._highlighter._updateColor();
                this.closePopup();
            };

            Node.prototype.highlighted = function() {
                return highlighterService.isHighlighted(this);
            };

            Node.prototype.toggleHighlight = function() {
                if (this.highlighted()) {
                    this.unhighlight();
                } else {
                    this.highlight();
                }
            };

            Node.prototype._select = function(){
                if (!this.highlighted()) {
                    let highlighter = this._highlighter;
                    let layerGroup = this._layerGroup;
                    let map = this._map;

                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                        layerGroup.addLayer(highlighter).addTo(map);
                    } else {
                        highlighter.remove().addTo(map);
                    }
                }
            };

            Node.prototype._deselect = function(){
                if (!this.highlighted()) {
                    let highlighter = this._highlighter;
                    let layerGroup = this._layerGroup;
                    if (layerGroup) {
                        if (layerGroup.hasLayer(highlighter)) {
                            layerGroup.removeLayer(highlighter);
                        }
                    } else {
                        highlighter.remove();
                    }
                }
            };

            Node.prototype.select = function(){
                // highlighterService.unhighlight(this);
                selectionService.select(this);
                this._highlighter._updateColor();
            };

            Node.prototype.deselect = function(){
                selectionService.deselect(this);
                this._highlighter._updateColor();
                this.closePopup();
            };

            Node.prototype.selected = function(newState) {
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

            Node.prototype.toggleSelection = function(){
                if(this.selected()){
                    this.deselect();
                }else{
                    this.select();
                }
                selectionService.updateSelections();
            };

            Node.prototype.changes = function(){
                changes = {id: this.id()};

                if (this.isNew()) {
                    changes.new = true;
                    changes.lat = this.getLatLng().lat;
                    changes.lng = this.getLatLng().lng;
                    changes.name = this.getName();
                    changes.equipment = this.getEquipment();
                    changes.model = this.getModel();
                    changes.icon = this.getModel();
                } else if (this.isDirty()) {
                    changes.disabled = this.isDisabled();
                    changes.flagged4Deletion = this.flagged4Deletion();
                    changes.lat = this.getLatLng().lat;
                    changes.lng = this.getLatLng().lng;
                    changes.name = this.getName();
                    changes.equipment = this.getEquipment();
                    changes.model = this.getModel();
                    changes.icon = this.getModel();
                }

                return changes;
            };

            Node.prototype.flush = function(){
                changes = this.changes()
                // if (this.isDirty()) {
                //     this._dirty = false;
                // }

                // if (this.isNew()) {
                //     this._isNew = false;
                // }

                return changes;
            };

            Node.prototype.enable = function() {
                this._disabled = false;
                this._enabledState = 'Enabled';

                this._dirty = true;
                this._mapNode.setOpacity(1.0);
                console.log("Enabled Node " + this.id() + ": " + this.name());
            };

            Node.prototype.disable = function() {
                this._disabled = true;
                this._enabledState = 'Disabled';

                this._dirty = true;
                this._mapNode.setOpacity(this.getOpacity());
                // this.deselect();
                this.closePopup();

                for (let link of this.incomingLinks()) {
                    if (!link.isDisabled()) {
                        link.disable();
                    }
                }

                for (let link of this.outgoingLinks()) {
                    if (!link.isDisabled()) {
                        link.disable();
                    }
                }

                for (let demand of this.associatedDemands()) {
                    demand.isDirty(true);
                    // if (!demand.isDisabled()) {
                    //  demand.disable();
                    // }
                }

                console.log("Disabled Node " + this.id() + ": " + this.name());
            };

            Node.prototype.isDirty = function(isDirty){
                if (isDirty !== undefined) {
                    this._dirty = isDirty;
                }
                return this._dirty;
            };

            Node.prototype.setDirty = function() {
                this._dirty = true;
            };

            Node.prototype.isDisabled = function() {
                return this._disabled;
            };

            Node.prototype.enabledState = function() {
                return this._enabledState;

                // if (this._disabled) {
                //     return 'Disabled';
                // } else {
                //     return 'Enabled';
                // }
            };

            Node.prototype.on = function(event, callback){
                this._mapNode.on(event, callback, this);
            };

            Node.prototype.getAssociatedDemands = function() {
                return [...this._associatedDemands];
            };

            Node.prototype.flagged4Deletion = function() {
                return this._deletionFlag;
            };

            Node.prototype.flag4Deletion = function() {
                this._deletionFlag = true;
                this._dirty = true;
                this._mapNode.setOpacity(this.getOpacity());
                this._highlighter.remove();
                this.closePopup();

                for (let link of this.incomingLinks()) {
                    if (!link.flagged4Deletion()) {
                        link.flag4Deletion();
                    }
                }

                for (let link of this.outgoingLinks()) {
                    if (!link.flagged4Deletion()) {
                        link.flag4Deletion();
                    }
                }

                // for (let demand of this.associatedDemands()) {
                //     if (!demand.flagged4Deletion()) {
                //         demand.flag4Deletion();
                //     }
                // }

            };

            Node.prototype.unflag4Deletion = function() {
                this._deletionFlag = false;
            };

            Node.prototype.undoLastChange = function() {
                console.log("undo/redo functionality not yet implemented...");
            };

            Node.prototype.redoEdit = function() {
                console.log("undo/redo functionality not yet implemented...");
            };

            Node.prototype.structureClass = function() {
                return "Node";
            };


            Node.prototype.openPopup = function(content, options) {
                // this.closePopup();
                this.unbindPopup();

                if (!content) {
                    content = "<div><strong>Name: </strong>" + this.getPrettifiedName() + "</div>" +
                              "<div><strong>ID: </strong>" + this.getId() + "</div>" +
                              "<div><strong>Latitude: </strong>" + this.getLatLng().lat.toFixed(2) + "</div>" +
                              "<div><strong>Longitude: </strong>" + this.getLatLng().lng.toFixed(2) + "</div>" +
                              "<div><strong>Equipment: </strong>" + this.getModel() + "</div>";
                }

                // if (!options) {
                //     options = {autoClose: false};
                // }

                this._mapNode.bindPopup(content, options).openPopup();

                return this;

            };

            Node.prototype.closePopup = function() {
                if (this._mapNode.getPopup()) {
                    this._mapNode.closePopup();
                }
                return this;
            };

            Node.prototype.unbindPopup = function() {
                if (this._mapNode.getPopup()) {
                    this._mapNode.unbindPopup();
                }
                return this;
            };

            return Node;
        }
    ])
})()
