(function(){
    angular.module("vane.pages").controller("MapController", ['$scope', '$route', '$rootScope', '$filter',
    '$timeout', '$location', '$q', 'leaflet', 'mapboxTileLayer', 'coloring', 'networkService', 'LinkTraffic',
    'highlighterService', 'selectionService', 'Demand', 'Route', function($scope, $route, $rootScope, $filter, $timeout, $location, $q,
        leaflet, mapboxTileLayer, coloring, networkService, LinkTraffic, highlighterService, selectionService, Demand, Route) {

        $scope.hidden = false;

        $scope.loaded = false;

        $scope.activeView = $route.current.activeView;
        $scope.viewDropdownOpen = false;

        // $scope.demandSelection = false;
        let mapTiles = mapboxTileLayer(true),
            gridTiles = mapboxTileLayer(false);

        let nodeLayerGroup = leaflet.featureGroup([]),
            linkLayerGroup = leaflet.featureGroup([]),
            demandLayerGroup = leaflet.featureGroup([]),
            linkTrafficLayerGroup = leaflet.featureGroup([]),
            subnetLayerGroup = leaflet.featureGroup([]);

        let baseMaps = {
            "Geographic": mapTiles,
            "Logical": gridTiles
        };

        let overlayGroups = {
            "Nodes": nodeLayerGroup,
            "Links": linkLayerGroup,
            "Demands": demandLayerGroup,
            "Traffic": linkTrafficLayerGroup,
            "Subnets": subnetLayerGroup,
        };

        $timeout(function() {
            $scope.map = leaflet.map("main-view", {
                boxZoom: true,
                center: [0, 0],
                layers: [mapTiles],
                zoomControl: false,
                zoom: 2
            });
            new leaflet.Control.Zoom({position: 'bottomleft'}).addTo($scope.map);
            leaflet.control.layers(baseMaps, overlayGroups, {position: 'topleft'}).addTo($scope.map);
            networkService.setMap($scope.map);
        }, 0);

        $rootScope.status = "Loading network data...";

        if ($rootScope.currentNetwork && $route.current.params.id == $rootScope.mostRecentMap) {
            $timeout(function(){
                $scope.loaded = false;
                networkService._network = $rootScope.currentNetwork;
                updateMap(networkService.getNetwork());
            }, 0);
        } else {
            $rootScope.mostRecentMap = $route.current.params.id;
            networkService.load($route.current.params.id).then(function(){
                $timeout(function(){updateMap(networkService.getNetwork());}, 0);
            }, function(response){
                console.log(response);
                statusMessage = "Failure loading network data. Server responded with status "
                    + response.status + " (" + response.statusText + ")";

                if (response.data && response.data.message) {
                    statusMessage += " due to " + response.data.message;
                }
                $rootScope.$broadcast("vane.updateStatus", statusMessage, null, 'error');
                // $scope.$apply();
            });
        }

        function analyzeNetwork() {
            $rootScope.$broadcast("vane.toggleAnalysisState");
            // $rootScope.analyzing = true;
            // $rootScope.status = "Queueing Project " + $route.current.params.id + " for analysis.";
            $rootScope.$broadcast("vane.updateStatus", "Queueing Project " + $route.current.params.id + " for analysis...");
            networkService.analyze($route.current.params.id).then(function(response) {
                $rootScope.$broadcast("vane.updateStatus", "Network analysis complete.", null, 'success');
                networkService.getNetwork().addLinkTraffic(linkTrafficLayerGroup);
                // if (!$scope.loaded){
                //     networkService.getNetwork().addLinkTraffic();
                //     // $scope.loaded = true;
                // }
                $timeout(function(){applyPostAnalysisUpdate();}, 1000);
            }, function(response){
                console.log("response: ", response);
                // $scope.$apply(function(){$rootScope.status = "Error analyzing network.";});
                $rootScope.$broadcast("vane.updateStatus", "Error analyzing network.", null, 'error');
            });

            // $timeout(function(){$rootScope.analyzing = false;}, 5000);
            $timeout(function(){$rootScope.$broadcast("vane.toggleAnalysisState");}, 3000);
        }

        function updateMap(network) {
            console.log("updating map...");
            console.log(network);
            network.setMap($scope.map);

            if (!network.isEmpty()) {
                $scope.map.flyToBounds(network.getLatLngBounds());
                network.addToMap(overlayGroups);
                $scope.loaded = true;
            }

            if (network.hasDemands()) {
                analyzeNetwork();
            } else {
                $timeout(function(){$rootScope.$broadcast("vane.updateStatus", "Done", null, 'success');}, 2000);
            }

        }

        function applyPostAnalysisUpdate() {
            console.log("Applying post analysis update...");
            $q.when()
            .then(function() {
                return resetNetworkTraffic();
            })
            .then(function() {
                return updateNetworkTraffic();
            })
            .then(function() {
                return updateSelections();
            })
            .then(function() {
                let deferred = $q.defer();
                let availableDemands = networkService.getAvailableDemands();

                deferred.resolve(availableDemands);
                $q.when(deferred.promise)
                .then(function(availableDemands) {
                    let satisfiedDemands = networkService.getSatisfiedDemands();
                    let unsatisfiedDemands = networkService.getUnsatisfiedDemands();

                    if (unsatisfiedDemands.length > 0) {
                        statusUpdate = satisfiedDemands.length + " satisfied " + $filter('pluralize')("demand", satisfiedDemands.length) + ".";
                        statusUpdate += "\n" + unsatisfiedDemands.length + " unsatisfied " + $filter('pluralize')("demand", unsatisfiedDemands.length) + ".";
                        $rootScope.$broadcast("vane.updateStatus", statusUpdate, null, "warning");
                    } else {
                        $rootScope.$broadcast("vane.updateStatus", "All demands satisfied.", null, "success");
                    }

                    if (availableDemands) {
                        $rootScope.$broadcast("vane.showSelection", availableDemands);
                    }
                });
            })


            // $timeout(function() {

            // }, 5000);
        }

        function clearAnalysisResults() {
            console.log("clearing analysis results...");
            networkService.resetAnalysisResults();
            resetNetworkTraffic();
        }

        function selectAll() {
            let network = networkService.getNetwork();
            if (network) {
                let selection = [...network.nodes(), ...network.links()];
                selectionService.selectAll(selection, true);
            }
        }

        function selectType(type) {
            let network = networkService.getNetwork();
            if (network) {
                switch (type) {
                    case 'Node':
                        selectionService.selectAll(network.nodes(), true);
                        break;
                    case 'Link':
                        selectionService.selectAll(network.links(), true);
                        break;
                    default:
                        console.log('unknown selection type ' + type + '.');
                }
            }
        }

        function selectState(state) {
            let network = networkService.getNetwork();
            if (network) {
                let selection = [];
                switch (state) {
                    case 'enabled':
                        selectionService.selectAll(network.getAllEnabled(), true);
                        break;
                    case 'disabled':
                        selectionService.selectAll(network.getAllDisabled(), true);
                        break;
                    case 'satisfied':
                        // highlighterService.highlightAll()
                        highlightSelection(networkService.getSatisfiedDemands());
                        break;
                    case 'unsatisfied':
                        highlightSelection(networkService.getUnsatisfiedDemands());
                        break;
                    default:
                        console.log('Unknown selection state: ' + state);
                }
            }
        }

        function toggleVisibility(selection, visible) {
            switch (selection) {
                case 'legend':
                    var legend = document.getElementById('linkUtilizationLegend');
                    legend.style.display = (legend.style.display == 'flex') ? 'none' : 'flex';
                    break;
                case 'allNodes':
                    var nodes = networkService.getAvailableNodes();
                    if (visible) {
                        showSelection(nodes);
                    } else {
                        hideSelection(nodes);
                    }
                    break;
                case 'enabledNodes':
                    var nodes = $filter('enabled')(networkService.getAvailableNodes());
                    if (visible) {
                        showSelection(nodes);
                    } else {
                        hideSelection(nodes);
                    }
                    break;
                case 'disabledNodes':
                    var nodes = $filter('disabled')(networkService.getAvailableNodes());
                    if (visible) {
                        showSelection(nodes);
                    } else {
                        hideSelection(nodes);
                    }
                    break;
                case 'allLinks':
                    var links = networkService.getAvailableLinks();
                    if (visible) {
                        showSelection(links);
                    } else {
                        hideSelection(links);
                    }
                    break;
                case 'enabledLinks':
                    var links = $filter('enabled')(networkService.getAvailableLinks());
                    if (visible) {
                        showSelection(links);
                    } else {
                        hideSelection(links);
                    }
                    break;
                case 'disabledLinks':
                    var links = $filter('disabled')(networkService.getAvailableLinks());
                    if (visible) {
                        showSelection(links);
                    } else {
                        hideSelection(links);
                    }
                    break;
                case 'usedLinks':
                    var links = networkService.getAvailableLinks();
                    var selection = [];
                    for (let link of links) {
                        if (link.getUsage() != null) {
                            selection.push(link);
                        }
                    }

                    if (visible) {
                        showSelection(selection);
                    } else {
                        hideSelection(selection);
                    }
                    break;
                case 'unusedLinks':
                    var links = networkService.getAvailableLinks();
                    var selection = [];
                    for (let link of links) {
                        if (link.getUsage() == null) {
                            selection.push(link);
                        }
                    }
                    if (visible) {
                        showSelection(selection);
                    } else {
                        hideSelection(selection);
                    }
                    break;
                case 'allDemands':
                    var demands = networkService.getAvailableDemands();
                    if (visible) {
                        highlightSelection(demands);
                    } else {
                        unhighlightSelection(demands);
                    }
                    break;
                case 'enabledDemands':
                    var demands = $filter('enabled')(networkService.getAvailableDemands());
                    if (visible) {
                        highlightSelection(demands);
                    } else {
                        unhighlightSelection(demands);
                    }
                    break;
                case 'disabledDemands':
                    var demands = $filter('disabled')(networkService.getAvailableDemands());
                    if (visible) {
                        highlightSelection(demands);
                    } else {
                        unhighlightSelection(demands);
                    }
                    break;
                case 'satisfiedDemands':
                    var demands = networkService.getSatisfiedDemands();
                    if (visible) {
                        highlightSelection(demands);
                    } else {
                        unhighlightSelection(demands);
                    }
                    break;
                case 'unsatisfiedDemands':
                    var demands = networkService.getUnsatisfiedDemands();
                    if (visible) {
                        highlightSelection(demands);
                    } else {
                        unhighlightSelection(demands);
                    }
                    break;
                default:
                    console.log('unknown selection: ', selection);
            }
        }

        // Highlight selected items
        function highlightSelection(selection, exclusive, hideExcluded) {
            console.log("highlighting selection: ", selection);
            let nodes = networkService.getAvailableNodes();
            let links = networkService.getAvailableLinks();
            let demands = networkService.getAvailableDemands();

            if (links) {
                for (let link of links) {
                    if (selection.indexOf(link) < 0) {
                        if (exclusive) {
                            link.unhighlight();
                        }
                        if (hideExcluded) {
                            link.hide();
                        }

                    } else {
                        link.highlight();
                    }
                }
            }

            if (nodes) {
                for (let node of nodes) {
                    if (selection.indexOf(node) < 0) {
                        if (exclusive) {
                            node.unhighlight();
                        }
                        if (hideExcluded) {
                            node.hide();
                        }
                    } else {
                        node.highlight();
                    }
                }
            }

            if (demands) {
                for (let demand of demands) {
                    if (selection.indexOf(demand) < 0) {
                        if (exclusive) {
                            demand.unhighlight();
                        }
                        if (hideExcluded) {
                            demand.hide();
                        }
                    } else {
                        demand.highlight();
                    }
                }
            }
        }

        // Highlight selected items
        function unhighlightSelection(selection) {
            // let network = networkService.getNetwork();
            let nodes = networkService.getAvailableNodes();
            let links = networkService.getAvailableLinks();
            let demands = networkService.getAvailableDemands();

            if (links) {
                for (let link of links) {
                    if (selection.indexOf(link) >= 0) {
                        link.unhighlight();
                    }
                }
            }

            if (nodes) {
                for (let node of nodes) {
                    if (selection.indexOf(node) >= 0) {
                        node.unhighlight();
                    }
                }
            }

            if (demands) {
                for (let demand of demands) {
                    if (selection.indexOf(demand) >= 0) {
                        demand.unhighlight();
                    }
                }
            }
        }

        function hideSelection(selection) {
            console.log("hiding selection: ", selection);
            if (selection) {
                try {
                    for (let obj of selection) {
                        obj.hide();
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        };

        function showSelection(selection, exclusive, hideExcluded) {
            console.log("showing selection: ", selection);
            if (selection) {
                try {
                    for (let obj of selection) {
                        obj.show();
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        };

        function unhighlightNodes() {
            try {
                let network = networkService.getNetwork();
                for (let node of network.nodes()) {
                    node.unhighlight();
                }
            } catch (e) {
                console.log(e);
            }
        };

        function unhighlightLinks() {
            try {
                let network = networkService.getNetwork();
                for (let link of network.links()) {
                    link.unhighlight();
                }
            } catch (e) {
                console.log(e);
            }
        };

        function unhighlightDemands() {
            try {
                let network = networkService.getNetwork();
                for (let demand of network.demands()) {
                    demand.unhighlight();
                }
            } catch (e) {
                console.log(e);
            }
        };

        function unhighlightAll() {
            try {
                let network = networkService.getNetwork();
                for (let node of network.nodes()) {
                    node.unhighlight();
                }

                for (let link of network.links()) {
                    link.unhighlight();
                }

                for (let demand of network.demands()) {
                    demand.unhighlight();
                }

            } catch (e) {
                console.log(e);
            }
        };

        function hideAll() {
            $scope.hidden = true;
            let network = networkService.getNetwork();
            if (network) {
                for (let node of network.nodes()) {
                    node.hide();
                }

                for (let link of network.links()) {
                    link.hide();
                }

                for (let demand of network.demands()) {
                    demand.hide();
                }
            }
        };

        function showAll() {
            $scope.hidden = false;
            let network = networkService.getNetwork();
            if (network) {
                for (let node of network.nodes()) {
                    node.show();
                }

                for (let link of network.links()) {
                    link.show();
                }

                for (let demand of network.demands()) {
                    demand.show();
                }
            }
        };

        function hideNetworkComponents() {
            if (!$scope.hidden && $scope.loaded) {
                try {
                    let network = networkService.getNetwork();
                    for (let node of network.nodes()) {
                        node.hide();
                    }
                    for (let link of network.links()) {
                        link.hide();
                    }
                } catch (e) {
                    console.log(e);
                }
                $scope.hidden = true;
            }
        }

        function showNetworkComponents() {
            if ($scope.hidden && $scope.loaded) {
                try {
                    let network = networkService.getNetwork();
                    for (let node of network.nodes()) {
                        node.show();
                    }
                    for (let link of network.links()) {
                        link.show(true);
                    }
                } catch (e) {
                    console.log(e);
                }
                $scope.hidden = false;
            }
        }

        function hideNetworkDemands() {
            let network = networkService.getNetwork();
            if (network) {
                for (let demand of network.demands()) {
                    demand.hide();
                }
            }
        };

        function showNetworkDemands(demands) {
            if (demands && Array.isArray(demands)) {
                for (let demand of demands) {
                    demand.show();
                }
            } else {
                let network = networkService.getNetwork();
                if (network) {
                    for (let demand of network.demands()) {
                        demand.show();
                    }
                }
            }
        };

        function hideNetworkTraffic() {
            if ($scope.loaded) {
                let network = networkService.getNetwork();
                if (network) {
                    for (let link of network.links()) {
                        try {
                            link.hideTraffic();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
        }

        function showNetworkTraffic(demands) {
            if ($scope.loaded) {
                let links;
                if (Array.isArray(demands)) {
                    links = [];
                    for (let demand of demands) {
                        for (let route of demand.routes()) {
                            links = [...links, ...route.links()];
                        }
                    }
                    let linkSet = new Set(links);
                    links = [...linkSet];
                } else {
                    links = networkService.getAvailableLinks();
                }
                if (links && networkService.getNetwork().hasDemands()) {
                    for (let link of links) {
                        link.showTraffic();
                    }
                }
            }
        }

        function resetNetworkTraffic() {
            console.log("resetting network traffic...");
            let network = networkService.getNetwork();
            if (network) {
                for (let link of network.links()) {
                    link.resetDemands();
                    link.setUsage(null);
                    link.setTrafficProfile(null);
                }
            }
        }

        function updateNetworkTraffic() {
            console.log("updating network traffic...");
            try {
                var network = networkService.getNetwork();
                var networkLinks = network.links();
                var networkDemands = network.demands();

                var routeUpdates = networkService.analysisResults().routes;
                var linkUpdates = networkService.analysisResults().links;

                if (networkDemands != null && routeUpdates != null) {
                    for (let demand of networkDemands) {
                        demand.resetRoutes();
                        for (let route of routeUpdates) {
                            if (route.id == demand.id()) {
                                let links = route.links = [];
                                for (let linkId of route.link_ids) {
                                    let link = network.linkById(linkId);
                                    if (link != null) {
                                        links.push(link)
                                    }
                                }
                                demand.addRoute(route);
                            }
                        }
                        demand._update();
                    }
                }

                if (networkLinks != null && linkUpdates != null) {
                    for (let link of networkLinks) {
                        for (let linkUpdate of linkUpdates) {
                            if (linkUpdate.id == link.id()) {
                                link.setUsage(linkUpdate.usage);
                                link.setTrafficProfile(linkUpdate.traffic);
                                link.update();
                                var linkDemands = link.demands();
                                linkDemands.length = 0;
                                for (let demandID of linkUpdate.demand_ids) {
                                    for (let demand of networkDemands) {
                                        if (demandID == demand.id()) {
                                            linkDemands.push(demand);
                                        }
                                    }
                                }
                            }
                        }
                        if (link._trafficFlow != null && link.getUsage() != null) {
                            link._trafficFlow.enable().start();
                        } else {
                            link._trafficFlow.disable();
                        }
                    }
                }

                $rootScope.$broadcast("vane.updateStatus", "Network traffic updated.", null, 'success');

            } catch (e) {
                $rootScope.$broadcast("vane.updateStatus", "Error updating network traffic.", null, 'error');
                console.log(e);
            }
        }

        function updateSelections() {
            $timeout(function() {
                $scope.$broadcast("vane.updateSelections");
            }, 0);
        }

        $scope.$on("vane.clearAnalysisResults", function() {
            console.log("vane.clearAnalysisResults event triggered.");
            $timeout(clearAnalysisResults, 0);
        });

        $scope.$on("vane.hideSelection", function(event, selection) {
            console.log("vane.hideSelection event handler triggered.");
            $timeout(hideSelection, 0, true, selection);
        });

        $scope.$on("vane.showSelection", function(event, selection, exclusive, hideExcluded) {
            console.log("vane.showSelection event handler triggered.");
            $timeout(showSelection, 0, true, selection, exclusive, hideExcluded);
        });

        $scope.$on("vane.hideAll", function() {
            console.log("vane.hideAll event handler triggered.");
            $timeout(hideAll, 0);
        });

        $scope.$on("vane.showAll", function() {
            console.log("vane.showAll event handler triggered.");
            $timeout(showAll, 0);
        });

        $scope.$on("vane.highlightSelection", function(event, selection, exclusive, hideExcluded) {
            console.log("vane.highlightSelection event handler triggered.");
            $timeout(highlightSelection, 0, true, selection, exclusive, hideExcluded);
        });

        $scope.$on("vane.unhighlightSelection", function(event, selection) {
            console.log("vane.unhighlightSelection event handler triggered.");
            $timeout(unhighlightSelection, 0, true, selection);
        });

        $scope.$on("vane.unhighlightNodes", function() {
            console.log("vane.unhighlightNodes event handler triggered.");
            $timeout(unhighlightNodes, 0);
        });

        $scope.$on("vane.unhighlightLinks", function() {
            console.log("vane.unhighlightLinks event handler triggered.");
            $timeout(unhighlightLinks, 0);
        });

        $scope.$on("vane.unhighlightDemands", function() {
            console.log("vane.unhighlightDemands event handler triggered.");
            $timeout(unhighlightDemands, 0);
        });

        $scope.$on("vane.unhighlightAll", function() {
            console.log("vane.unhighlightAll event handler triggered.");
            $timeout(unhighlightAll, 0);
        });

        $scope.$on("vane.selectAll", function() {
            console.log("vane.selectAll event handler triggered.");
            $timeout(selectAll, 0);
        });

        $scope.$on("vane.selectType", function(event, type) {
            console.log("vane.selectType event handler triggered.");
            $timeout(selectType, 0, true, type);
        });

        $scope.$on("vane.selectState", function(event, state) {
            console.log("vane.selectState event handler triggered.");
            $timeout(selectState, 0, true, state);
        });

        $scope.$on("vane.analyzeNetwork", function() {
            console.log("vane.analyzeNetwork event handler triggered.");
            $timeout(analyzeNetwork, 0);
            // analyzeNetwork();
        });

        $scope.$on("vane.applyPostAnalysisUpdate", function() {
            console.log("vane.applyPostAnalysisUpdate event handler triggered.");
            $timeout(applyPostAnalysisUpdate, 0);
        });

        $scope.$on("vane.hideNetworkComponents", function() {
            console.log("vane.hideNetworkComponents event handler triggered.");
            $timeout(hideNetworkComponents, 0);
        });

        $scope.$on("vane.showNetworkComponents", function() {
            console.log("vane.showNetworkComponents event handler triggered.");
            $timeout(showNetworkComponents, 0);
        });

        $scope.$on("vane.hideNetworkDemands", function() {
            console.log("vane.hideNetworkDemands event handler triggered.");
            $timeout(hideNetworkDemands, 0);
        });

        $scope.$on("vane.showNetworkDemands", function(event, demands) {
            console.log("vane.showNetworkDemands event handler triggered.");
            $timeout(showNetworkDemands, 0, true, demands);
        });

        $scope.$on("vane.hideNetworkTraffic", function() {
            console.log("vane.hideNetworkTraffic event handler triggered.");
            $timeout(hideNetworkTraffic, 0);
        });

        $scope.$on("vane.showNetworkTraffic", function(event, demands) {
            console.log("vane.showNetworkTraffic event handler triggered.");
            $timeout(showNetworkTraffic, 0, true, demands);
        });

        $scope.$on("vane.resetNetworkTraffic", function() {
            console.log("vane.resetNetworkTraffic event handler triggered.");
            $timeout(resetNetworkTraffic, 0);
        });

        $scope.$on("vane.updateNetworkTraffic", function() {
            console.log("vane.updateNetworkTraffic event handler triggered.");
            $timeout(updateNetworkTraffic, 0);
        });

        $scope.$on("vane.toggleVisibility", function(event, selection, visible) {
            console.log("vane.toggleVisibility event handler triggered.");
            $timeout(toggleVisibility, 0, true, selection, visible);
        });
    }]);
})()
