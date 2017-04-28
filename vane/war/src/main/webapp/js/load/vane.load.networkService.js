(function(){
    angular.module("vane.load")
    .service("networkService", ['$rootScope', '$http', '$filter', '$timeout', '$q', 'subnet', 'selectionService',
        function($rootScope, $http, $filter, $timeout, $q, subnet, selectionService) {

            let self = this;

            self._network = null;
            self._map = null;
            self._analysisResults = {
                routes: null,
                links: null,
            };

            self.network = function(){
                return self._network;
            };

            self.getNetwork = function() {
                return self._network;
            };

            self.setNetwork = function(network) {
                self._network = network;
                $rootScope.currentNetwork = self._network;
                return this;
            };

            self.getMap = function() {
                return self._map;
            };

            self.setMap = function(map) {
                self._map = map;
            };

            self.networkNodes = function() {
                if (self._network) {
                    return self._network.nodes();
                }
            };

            self.networkLinks = function() {
                if (self._network) {
                    return self._network.links();
                }
            };

            self.networkDemands = function() {
                if (self._network) {
                    return self._network.demands();
                }
            };

            self.analysisResults = function(analysisResults) {
                if (analysisResults !== undefined) {
                    self._analysisResults = analysisResults;
                }
                return self._analysisResults;
            };

            self.resetAnalysisResults = function() {
                self._analysisResults.routes = null;
                self._analysisResults.links = null;
            };

            self.load = function(id) {
                return new Promise(function(resolve, reject) {
                    console.log("Loading network...");
                    $http({
                        method: "GET",
                        url: "subnet?id=" + id
                    }).then(function(response){
                        // console.log("/subnet HTTP GET response.data: ", response.data);
                        // the response data is loaded from the server database
                        self.setNetwork(subnet(response.data));
                        resolve();
                    }, reject);
                });
            };

            self.analyze = function(id) {
                return new Promise(function(resolve, reject) {
                    console.log("Analyzing network changes...");
                    changes = self._network.changes();
                    console.log("Network changes: ", changes);
                    $http({
                        method: "POST",
                        url: "analyze?id=" + id,
                        data: changes,
                    }).then(
                        function(response){
                            //self.network = subnet(response.data)
                            // console.log("/analyze HTTP POST response: ", response.data);
                            self._analysisResults = response.data;
                            console.log("routes: ", self.analysisResults().routes);
                            console.log("links: ", self.analysisResults().links);
                            resolve(response);
                        },
                        function(response) {
                            reject(response);
                        }
                    );
                });
            };

            self.save = function(id) {
                return new Promise(function(resolve, reject) {
                    console.log("Saving network changes...");
                    changes = self._network.flush();
                    console.log("Network changes: ", changes);
                    $http({
                        method: "POST",
                        url: "save?id=" + id,
                        data: changes,
                    }).then(
                        function(response){
                            console.log("/save HTTP POST response.data: ", response.data);
                            self.setNetwork(subnet(response.data));
                            console.log(self._network);
                            resolve(response);
                        },
                        function(response) {
                            reject(response);
                        }
                    );
                });
            };

            self.runStudy = function(projectId, studyName, studyParameters) {
                return new Promise(function(resolve, reject) {
                    $http({
                        method: "POST",
                        url: "network-study?id=" + projectId + "&type=" + studyName,
                        // url: "http://localhost:5000/network-study",
                        data: studyParameters,
                    }).then(
                        function(response){
                            console.log("/network-study HTTP POST response.data: ", response.data);
                            self._analysisResults = response.data;
                            console.log("routes: ", self.analysisResults().routes);
                            console.log("links: ", self.analysisResults().links);
                            resolve(response);
                        },
                        function(response) {
                            reject(response);
                        }
                    );
                });
            };

            self.getSatisfiedDemands = function() {
                let satisfied = [];
                if (self._network) {
                    let demands = self._network.demands();
                    for (let demand of demands) {
                        if (demand.isSatisfied()) {
                            satisfied.push(demand);
                        }
                    }
                }
                return satisfied;
            };

            self.getUnsatisfiedDemands = function() {
                let unsatisfied = [];
                if (self._network) {
                    let demands = self._network.demands();
                    for (let demand of demands) {
                        if (!demand.isSatisfied()) {
                            unsatisfied.push(demand);
                        }
                    }
                }
                return unsatisfied;
            };


            self.getAvailableNodes = function() {
                // return self._availableNodes;
                let network = self._network;
                let availableNodes = null;
                if (network) {
                    availableNodes = [];
                    for (let node of network.nodes()) {
                        if (!node.flagged4Deletion()) {
                            availableNodes.push(node);
                        }
                    }
                    availableNodes = availableNodes.length > 0 ? $filter('orderBy')(availableNodes, '_name') : null;
                }
                return availableNodes;
            };

            self.getAvailableLinks = function() {
                let network = self._network;
                let availableLinks = null;
                if (network) {
                    availableLinks = [];
                    for (let link of network.links()) {
                        if (!link.flagged4Deletion()) {
                            availableLinks.push(link);
                        }
                    }
                    availableLinks = availableLinks.length > 0 ? $filter('orderBy')(availableLinks, '_name') : null;
                }
                return availableLinks;
            };

            self.getAvailableDemands = function() {
                let network = self._network;
                let availableDemands = null;
                if (network) {
                    availableDemands = [];
                    for (let demand of network.demands()) {
                        if (!demand.flagged4Deletion()) {
                            availableDemands.push(demand);
                        }
                    }
                    availableDemands = availableDemands.length > 0 ? $filter('orderBy')(availableDemands, '_name', false) : null;
                }
                return availableDemands;
            };

            self.getAvailableRoutes = function(demands) {
                let availableRoutes = null;

                if (demands === undefined) {
                    demands = selectionService.getSelectedDemands();
                }

                if (Array.isArray(demands)) {
                    availableRoutes = [];
                    for (let demand of demands) {
                        for (let route of demand.routes()) {
                            availableRoutes.push(route);
                        }
                    }
                    availableRoutes = availableRoutes.length > 0 ? $filter('orderBy')(availableRoutes, 'id', false) : null;
                } else {
                    selectionService.resetSelectedRoutes();
                }
                return availableRoutes;
            };
        }
    ])
})()
