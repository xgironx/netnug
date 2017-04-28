(function(){
    angular.module("vane.structures")
    .factory("subnet", ["Subnet", "node", "link", "demand", function(Subnet, node, link, demand) {
        return function subnet(jsonData) {

            let name = jsonData.name;
            let id = jsonData.id;

            if (!id) return null;

            let nodes = [];
            let links = [];
            let demands = [];
            let subnets = [];

            for (let nodeData of jsonData.nodes) {
                nodes.push(node(nodeData));
            }

            for (let linkData of jsonData.links) {
                links.push(link(linkData));
            }

            for (let demandData of jsonData.demands) {
                demands.push(demand(demandData));
            }

            for (let subnetData of jsonData.subnets) {
                subnets.push(subnet(subnetData));
            }

            let newSubnet = new Subnet(id, nodes, links, demands, subnets, name);

            newSubnet.resolveReferences();

            return newSubnet;
        }
    }])
    .factory("Subnet", ['$filter', 'leaflet', 'iconLookup', 'Node', 'Link', 'Demand', function($filter, leaflet, iconLookup, Node, Link, Demand) {
        function Subnet(id, nodes, links, demands, subnets, name) {
            this._id = id;
            this._nodes = nodes;
            this._links = links;
            this._demands = demands;
            this._subnets = subnets;
            this._name = name;
            this._map = null;

            this._nodeLayerGroup = null;
            this._linkLayerGroup = null;
            this._linkTrafficLayerGroup = null;
            this._demandLayerGroup = null;
            this._subnetLayerGroup = null;
        }

        Subnet.prototype.id = function(){
            return this._id;
        };

        Subnet.prototype.name = function(name){
            if(name) this._name = name;
            return this._name;
        };

        Subnet.prototype.nodes = function(){
            let nodes = this._nodes.slice();

            for (let subnet of this._subnets) {
                for (let node of subnet.nodes()) {
                    nodes.push(node);
                }
            }

            return nodes;
        };

        Subnet.prototype.links = function(){
            let links = this._links.slice();

            for (let subnet of this._subnets) {
                for (let link of subnet.links()) {
                    links.push(link);
                }
            }

            return links;
        };

        Subnet.prototype.demands = function(){
            let demands = this._demands.slice();

            for (let subnet of this._subnets) {
                for (let demand of subnet.demands()) {
                    demands.push(demand);
                }
            }

            return demands;
        };

        Subnet.prototype.getLayerGroup = function(group) {
            let layerGroup = [];
            switch (group) {
                case 'nodes':
                    for (let node of this.nodes()) {
                        layerGroup.push(node.getMapOverlay());
                    }
                    break;
                case 'links':
                    for (let link of this.links()) {
                        layerGroup.push(link.getMapOverlay());
                    }
                    break;
                case 'demands':
                    for (let demand of this.demands()) {
                        layerGroup.push(demand.getMapOverlay());
                    }
                    break;
                case 'subnets':
                    for (let subnet of this._subnets) {
                        layerGroup.push(subnet.getLayerGroup());
                    }
                    break;
            }
            return layerGroup;
        };

        Subnet.prototype.changes = function(changes){

            if (!changes) {
                var changes = {links: [], nodes: [], demands: [], subnets: []};
            }

            for (let node of this._nodes) {
                if (node.isDirty() || node.isNew()) {
                    changes.nodes.push(node.changes());
                }
            }

            for (let link of this._links) {
                if (link.isDirty() || link.isNew()) {
                    changes.links.push(link.changes());
                }
            }

            for (let demand of this._demands) {
                if (demand.isDirty() || demand.isNew()) {
                    changes.demands.push(demand.changes());
                }
            }

            for (let subnet of this._subnets) {
                subnet.changes(changes);
            }

            return changes;
        };

        Subnet.prototype.flush = function(changes) {
            if (!changes) {
                var changes = {links: [], nodes: [], demands: [], subnets: []};
            }

            for (let node of this._nodes) {
                if (node.isDirty() || node.isNew()) {
                    changes.nodes.push(node.flush());
                }
            }

            for (let link of this._links) {
                if (link.isDirty() || link.isNew()) {
                    changes.links.push(link.flush());
                }
            }

            for (let demand of this._demands) {
                if (demand.isDirty() || demand.isNew()) {
                    changes.demands.push(demand.flush());
                }
            }

            for (let subnet of this._subnets) {
                subnet.flush(changes);
            }

            return changes;

        };

        Subnet.prototype.nodeById = function(id){
            for (let node of this._nodes) {
                if (node.id() === id){
                    return node;
                }
            }

            for (let subnet of this._subnets) {
                let node = subnet.nodeById(id);
                if (node) {
                    return node;
                }
            }

            return null;
        };

        Subnet.prototype.nodeByName = function(name){
            for (let node of this._nodes) {
                if (node.name() == name){
                    return node;
                }
            }

            for (let subnet of this._subnets) {
                let node = subnet.nodeByName(name);
                if (node) {
                    return node;
                }
            }

            return null;
        };

        Subnet.prototype.linkById = function(id){
            for (let link of this._links) {
                if (link.id() === id){
                    return link;
                }
            }

            for (let subnet of this._subnets) {
                let link = subnet.linkById(id);
                if (link) {
                    return link;
                }
            }

            return null;
        };

        Subnet.prototype.demandById = function(id){
            for (let demand of this._demands) {
                if (demand.id() === id){
                    return demand;
                }
            }

            for (let subnet of this._subnets) {
                let demand = subnet.demandById(id);
                if (demand) {
                    return demand;
                }
            }

            return null;
        };

        Subnet.prototype.resolveReferences = function() {
            for (let link of this._links) {
                link.resolveReferences(this);
            }

            for (let demand of this._demands) {
                demand.resolveReferences(this);
            }

            for (let subnet of this._subnets) {
                subnet.resolveReferences();
            }
        };

        Subnet.prototype.setMap = function(map) {
            this._map = map;
            for (let node of this._nodes) {
                node.setMap(map);
            }

            for (let link of this._links) {
                link.setMap(map);
            }

            for (let demand of this._demands) {
                demand.setMap(map);
            }

            for (let subnet of this._subnets) {
                subnet.setMap(map);
            }
        };

        Subnet.prototype.addToMap = function(layerGroups, map) {
            if (map !== undefined) {
                this._map = map;
            } else {
                map = this._map;
            }

            if (!map) throw "Subnet.addToMap func missing required 'map' argument";

            if (layerGroups) {
                this._nodeLayerGroup = layerGroups.Nodes;
                this._linkLayerGroup = layerGroups.Links;
                this._demandLayerGroup = layerGroups.Demands;
                this._linkTrafficLayerGroup = layerGroups.Traffic;
                this._subnetLayerGroup = layerGroups.Subnets;
            }

            for (let node of this._nodes) {
                node.addToMap(this._nodeLayerGroup, map);
            }

            for (let link of this._links) {
                link.addToMap(this._linkLayerGroup, map);
            }

            for (let demand of this._demands) {
                demand.addToMap(this._demandLayerGroup, map);
            }

            for (let subnet of this._subnets) {
                subnet.addToMap(layerGroups, map);
            }
        };

        Subnet.prototype.addLinkTraffic = function(layerGroup) {
            if (layerGroup !== undefined) {
                this._linkTrafficLayerGroup = layerGroup;
            } else {
                layerGroup = this._linkTrafficLayerGroup;
            }

            for (let link of this.links()) {
                link.addTraffic(layerGroup);
            }

            // for (let subnet of this._subnets) {
            //  subnet.addLinkTraffic(map);
            // }
        };

        Subnet.prototype.getEnabledNodes = function() {
            let enabledNodes = [];
            for (let node of this.nodes()) {
                if (!node.isDisabled()) {
                    enabledNodes.push(node);
                }
            }

            return enabledNodes;
        };

        Subnet.prototype.getEnabledLinks = function() {
            let enabledLinks = [];
            for (let link of this.links()) {
                if (!link.isDisabled()) {
                    enabledLinks.push(link);
                }
            }

            return enabledLinks;
        };

        Subnet.prototype.getDisabledNodes = function() {
            let disabledNodes = [];
            for (let node of this.nodes()) {
                if (node.isDisabled()) {
                    disabledNodes.push(node);
                }
            }

            return disabledNodes;
        };

        Subnet.prototype.getDisabledLinks = function() {
            let disabledLinks = [];
            for (let link of this.links()) {
                if (link.isDisabled()) {
                    disabledLinks.push(link);
                }
            }

            return disabledLinks;
        };

        // Subnet.prototype.getDisabledDemands = function() {
        //     let disabledDemands = [];
        //     for (let demand of this.demand()) {
        //         if (demand.isDisabled()) {
        //             disabledDemands.push(demand);
        //         }
        //     }

        //     return disabledDemands;
        // };

        Subnet.prototype.getAllEnabled = function() {
            return [...this.getEnabledNodes(), ...this.getEnabledLinks()];
        };

        Subnet.prototype.getAllDisabled = function() {
            return [...this.getDisabledNodes(), ...this.getDisabledLinks()];
        };

        Subnet.prototype.getMaxId = function(objects) {
            let maxId = 0;

            for (let object of objects) {
                maxId = Math.max(maxId, object.getId());
            }
            return maxId;
        };

        Subnet.prototype._addNode = function(node) {
            node.addToMap(this._nodeLayerGroup, this._map);
            // this._nodeLayerGroup.addLayer(node.getMapOverlay()).addTo(this._map);
        };

        Subnet.prototype._addLink = function(link) {
            link.addToMap(this._linkLayerGroup, this._map);
            // link.addTraffic(this._map);
            link.addTraffic(this._linkTrafficLayerGroup);

            link.resolveReferences(this);
        };

        Subnet.prototype._addDemand = function(demand) {
            demand.addToMap(this._demandLayerGroup, this._map);
            // this._demandLayerGroup.addLayer(demand.getMapOverlay()).addTo(this._map);
            demand.resolveReferences(this);
        };

        Subnet.prototype.addNode = function(name, latLng, equipment) {
            let id = this.getMaxId(this.nodes()) + 1;
            // let model = null;
            let model = equipment;
            let icon = iconLookup(equipment.toLowerCase());

            let node = new Node(id, latLng, name, equipment, model, icon);
            // console.log("New node: ", node);
            // node.setDirty();
            node.flagNew();
            this._nodes.push(node);
            this._addNode(node);

        };

        Subnet.prototype.addLink = function(fromNode, toNode, model, duplex) {
            let id = this.getMaxId(this.links()) + 1;
            let name = [fromNode.name(), toNode.name()];
            // let capacity = misc.modelCapacityMap[model];
            let capacity = null;
            let usage = null;
            let trafficProfile = null;
            let direction = "Forward";
            let reverseLink = null;

            if (duplex) {
                name = name.join(' <-> ');
            } else {
                name = name.join(' -> ');
            }

            let forwardLink = new Link(id, name, fromNode, toNode, model, capacity, usage, trafficProfile, duplex, direction, reverseLink);
            console.log('New link: ', forwardLink);
            // forwardLink.setDirty();
            forwardLink.flagNew();
            this._links.push(forwardLink);

            if (duplex) {
                reverseLink = new Link(id + 1, name, toNode, fromNode, model, capacity, usage, trafficProfile, duplex, "Reverse", forwardLink);
                reverseLink.flagNew();
                this._links.push(reverseLink);
                forwardLink.setReverseLink(reverseLink);
            }

            this._addLink(forwardLink);
            if (duplex) {
                this._addLink(reverseLink);
            }

        };

        Subnet.prototype.addDemand = function(fromNode, toNode, trafficProfile) {
            let id = this.getMaxId(this.demands()) + 1;
            let name = [fromNode.name(), toNode.name()].join(' --> ')

            if (trafficProfile == null) {
                let timeStep = 3600;
                let startTime = 0;
                let endTime = 23 * timeStep;
                let minTrafficAmount = 0;
                let maxTrafficAmount = 1e8;
                trafficProfile = Demand.prototype.generateRandomTrafficProfile(startTime, endTime, timeStep, minTrafficAmount, maxTrafficAmount);
            }

            let demand = new Demand(id, name, fromNode, toNode, trafficProfile);
            demand.flagNew();
            console.log('New demand: ', demand);
            this._demands.push(demand);
            this._addDemand(demand);
        };

        Subnet.prototype.getCentroid = function() {
            if (!this.isEmpty()) {
                let nodes = this.nodes();
                let lats = [];
                let lngs = [];
                for (let node of nodes) {
                    let latLng = node.getLatLng();
                    lats.push(latLng.lat);
                    lngs.push(latLng.lng);
                }

                return [$filter('computeAverage')(lats), $filter('computeAverage')(lngs)];
            }
            return null;
        };

        Subnet.prototype.getLatLngBounds = function() {
            let nodes = this.nodes();
            let latlngs = [];
            for (let node of nodes) {
                latlngs.push(node.getLatLng());
            }

            return leaflet.latLngBounds(latlngs);
        };

        Subnet.prototype.structureClass = function() {
            return "Subnet";
        };

        Subnet.prototype.isEmpty = function() {
            return this.nodes().length == 0;
        };

        Subnet.prototype.hasDemands = function() {
            return this.demands().length > 0;
        };

        return Subnet;
    }])
})()
