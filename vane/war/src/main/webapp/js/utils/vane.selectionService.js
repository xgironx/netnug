(function(){
    angular.module("vane.selectionService", [])
    .service("selectionService", ['$rootScope', '$timeout', '$q',
        function($rootScope, $timeout, $q) {
            let self = this;
            self._selectedObjects = new Set();
            self._selectedDemands = null;
            self._selectedRoutes = null;

            self.select = function(object) {
                object._select();
                self._selectedObjects.add(object);
                console.log("selected ", object);
                // $rootScope.$broadcast("vane.updateSelections");
                return this;
            };

            self.deselect = function(object){
                object._deselect();
                self._selectedObjects.delete(object);
                console.log("deselected ", object);
                // $rootScope.$broadcast("vane.updateSelections");
                return this;
            };

            self.selectAll = function(objects, updateSelections){
                console.log("selecting all...");
                for (let object of objects) {
                    object.select();
                }
                if (updateSelections) self.updateSelections();
                return this;
            };

            self.deselectAll = function(updateSelections){
                console.log("deselecting all...");
                for (let object of self._selectedObjects){
                    // object._deselect();
                    object.deselect();
                }
                self._selectedObjects.clear();
                if (updateSelections) self.updateSelections();
                return this;
            };

            self.selectOnly = function(item, updateSelections) {
                console.log("selectOnly: ", item);
                for (let object of self._selectedObjects) {
                    if (object != item){
                        // object._deselect();
                        // self.deselect(object);
                        object.deselect();
                        // self._selectedObjects.delete(object);
                    }
                }
                item.toggleSelection();
                if (updateSelections) self.updateSelections();
                return this;
            };

            self.isSelected = function(object){
                return self._selectedObjects.has(object);
            };

            self.hasSelection = function(){
                return self.count() > 0;
            };

            self.hasSingleSelection = function(){
                return self.count() === 1;
            };

            self.hasMultiSelection = function(){
                return self.count() > 1;
            };

            self.selection = function(){
                if(self.hasSingleSelection()){
                    return self._selectedObjects.values().next().value;
                }else{
                    return self._selectedObjects.values();
                }
            };

            self.count = function(){
                return self._selectedObjects.size;
            };

            self.allEnabled = function() {
                for (let object of self._selectedObjects) {
                    if (object.isDisabled()) {
                        return false;
                    }
                }
                return true;
            };

            self.allDisabled = function() {
                for (let object of self._selectedObjects) {
                    if (!object.isDisabled()) {
                        return false;
                    }
                }
                return true;
            };

            this[Symbol.iterator] = function(){
                return self._selectedObjects.values();
            };

            self.allNodesSelected = function() {
                for (let object of self._selectedObjects) {
                    // if (!(object.hasOwnProperty('_mapNode'))) {
                    if (!(object.structureClass() == 'Node')) {
                        return false;
                    }
                }
                return true;
            };

            self.allLinksSelected = function() {
                for (let object of self._selectedObjects) {
                    // if (!(object.hasOwnProperty('_mapLink'))) {
                    if (!(object.structureClass() == 'Link')) {
                        return false;
                    }
                }
                return true;
            };

            self.selectedNodes = function(nodes) {
                return self.setSelectedNodes(nodes).getSelectedNodes();
            };

            self.getSelectedNodes = function() {
                // return self._selectedNodes;
                let nodes = [];
                for (let object of self._selectedObjects) {
                    if (object.structureClass() == 'Node') {
                        nodes.push(object);
                    }
                }
                return (nodes.length > 0) ? nodes : null;
            };

            self.setSelectedNodes = function(nodes) {
                if (nodes !== undefined) {
                    if (!Array.isArray(nodes)) {
                        nodes = [nodes];
                    }
                    return self.selectAll(nodes);
                }
                return this;
            };

            self.selectedLinks = function(links) {
                return self.setSelectedLinks(links).getSelectedLinks();
            };

            self.getSelectedLinks = function() {
                let links = [];
                for (let object of self._selectedObjects) {
                    if (object.structureClass() == 'Link') {
                        links.push(object);
                    }
                }
                return (links.length > 0) ? links : null;
            };

            self.setSelectedLinks = function(links) {
                if (links !== undefined) {
                    if (!Array.isArray(links)) {
                        links = [links];
                    }
                    return self.selectAll(links);
                }
                return this;
            };

            self.selectedDemands = function(demands) {
                if (demands !== undefined) {
                    return self.setSelectedDemands(demands).getSelectedDemands();
                }
                return self.getSelectedDemands();
            };

            self.getSelectedDemands = function() {
                let demands = self._selectedDemands;
                return (Array.isArray(demands) && demands.length > 0) ? demands : null;
            };

            self.setSelectedDemands = function(demands) {
                if (demands == null) {
                    self._selectedDemands = null;
                } else {
                    if (!Array.isArray(demands)) {
                        demands = [demands];
                    }
                    self._selectedDemands = [...demands];
                }
                return this;
            };

            self.selectedRoutes = function(routes) {
                if (routes !== undefined) {
                    return self.setSelectedRoutes(routes).getSelectedRoutes();
                }
                return self.getSelectedRoutes();
            };

            self.getSelectedRoutes = function() {
                let routes = self._selectedRoutes;
                return (Array.isArray(routes) && routes.length > 0) ? routes : null;
            };

            self.setSelectedRoutes = function(routes) {
                if (routes == null) {
                    self._selectedRoutes = null;
                } else {
                    if (!Array.isArray(routes)) {
                        routes = [routes];
                    }
                    self._selectedRoutes = [...routes];
                }
                return this;
            };

            self.resetSelectedNodes = function() {
                let selectedNodes = self.getSelectedNodes();
                if (selectedNodes) {
                    for (let node of selectedNodes) {
                        node.deselect();
                    }
                }
                return this;
            };

            self.resetSelectedLinks = function() {
                let selectedLinks = self.getSelectedLinks();
                if (selectedLinks) {
                    for (let link of selectedLinks) {
                        link.deselect();
                    }
                }
                return this;
            };

            self.resetSelectedDemands = function() {
                self._selectedDemands = null;
                return this;
            };

            self.resetSelectedRoutes = function() {
                self._selectedRoutes = null;
                return this;
            };

            self.updateSelections = function() {
                $rootScope.$broadcast("vane.updateSelections");
                return this;
            };

            function deleteSelection(selection, selectionType) {
                for (let obj of selection) {
                    obj.flag4Deletion();
                }
                $rootScope.$broadcast("vane.clearAnalysisResults");
                return this;
            }

            $rootScope.$on("vane.deleteSelection", function(event, selection, selectionType) {
                console.log("vane.deleteSelection event handler triggered.");
                $timeout(deleteSelection, 0, true, selection, selectionType);
            });
        }
    ])
})()
