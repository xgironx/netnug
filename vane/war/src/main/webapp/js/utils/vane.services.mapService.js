(function(){
    angular.module("vane.mapService", []).service("mapService", ['$rootScope', '$q', '$scope', '$route', '$timeout', 'networkService',
        function($rootScope, $q, $scope, $route, $timeout, networkService) {

            this.hidden = false;
            this.loaded = false;
            this.trafficVisible = true;

            this.load = function(id) {
                return networkService.load(id).then(updateMap);
            };

            this.analyzeNetwork = function() {
                networkService.analyze($route.current.params.id).then(function(response) {
                    $rootScope.$broadcast("vane.updateStatus", "Network analysis complete.", null, 'success');
                    if (!this.loaded){
                        networkService.network().addLinkTraffic($scope.map);
                        this.loaded = true;
                        this.trafficVisible = true;
                    }
                    $timeout(function(){applyPostAnalysisUpdate();}, 2000);
                }, function(response){
                    console.log("response: ", response);
                    // $scope.$apply(function(){$rootScope.status = "Error analyzing network.";});
                    $rootScope.$broadcast("vane.updateStatus", "Error analyzing network.", null, 'error');
                });

                // $timeout(function(){$rootScope.analyzing = false;}, 5000);
                $timeout(function(){$rootScope.$broadcast("vane.toggleAnalysisState");}, 4000);
            }

            this.updateMap = function(network) {
                let deferred = $q.defer();

                console.log("updating map...");
                console.log(network);
                network.addToMap($scope.map);
                analyzeNetwork();
                $scope.map.panTo(network.getCentroid());
                // $timeout(function(){network.addToMap($scope.map);}, 0);
                // $timeout(function(){analyzeNetwork();}, 0);
                // $scope.$apply();
            }

            this.applyPostAnalysisUpdate = function() {
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
                            $rootScope.$broadcast("vane.highlightSelection", availableDemands);
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
                try {
                    let network = networkService.network();
                    for (let node of network.nodes()) {
                        node.select();
                    }
                    for (let link of network.links()) {
                        link.select();
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            function selectType(type) {
                try {
                    let network = networkService.network();
                    switch (type) {
                        case 'Node':
                            selectionService.selectAll(network.nodes());
                            break;
                        case 'Link':
                            selectionService.selectAll(network.links());
                            break;
                        default:
                            console.log('unknown selection type ' + type + '.');
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            function selectState(state) {
                try {
                    let network = networkService.network();
                    let selection = [];
                    switch (state) {
                        case 'enabled':
                            selectionService.selectAll(network.getAllEnabled());
                            break;
                        case 'disabled':
                            selectionService.selectAll(network.getAllDisabled());
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
                } catch (e) {
                    console.log(e);
                }
            }

            function toggleVisibility(selection, visible) {
                switch (selection) {
                    case 'legend':
                        let legend = document.getElementById('linkUtilizationLegend');
                        legend.style.display = (legend.style.display == 'flex') ? 'none' : 'flex';
                        break;
                    case 'allNodes':
                        let availableNodes = networkService.getAvailableNodes()
                        let selection = [];
                        // showSelection(networkService.getAvailableNodes());
                        break;
                    case 'enabledNodes':
                        highlightSelection($filter('enabled')(networkService.getAvailableNodes()));
                        break;
                    case 'disabledNodes':
                        highlightSelection($filter('disabled')(networkService.getAvailableNodes()));
                        break;
                    case 'allLinks':
                        break;
                    case 'enabledLinks':
                        highlightSelection($filter('enabled')(networkService.getAvailableLinks()));
                        break;
                    case 'disabledLinks':
                        highlightSelection($filter('disabled')(networkService.getAvailableLinks()));
                        break;
                    case 'usedLinks':
                        break;
                    case 'unusedLinks':
                        break;
                    case 'allDemands':
                        highlightSelection(networkService.getAvailableDemands());
                        break;
                    case 'enabledDemands':
                        highlightSelection($filter('enabled')(networkService.getAvailableDemands()));
                        break;
                    case 'disabledDemands':
                        highlightSelection($filter('disabled')(networkService.getAvailableDemands()));
                        break;
                    case 'satisfiedDemands':
                        highlightSelection(networkService.getSatisfiedDemands());
                        break;
                    case 'unsatisfiedDemands':
                        highlightSelection(networkService.getUnsatisfiedDemands());
                        break;
                    default:
                        console.log('unknown selection: ', selection);
                }
            }

            // Highlight selected items
            function highlightSelection(selection, hideOthers) {
                console.log("highlighting selection: ", selection);
                try {
                    let network = networkService.network();
                    for (let link of network.links()) {
                        if (selection.indexOf(link) < 0) {
                            // link.hide();
                            link.unhighlight();
                            if (hideOthers) {
                                link.hide();
                            }

                        } else {
                            link.highlight();
                        }
                    }

                    for (let node of network.nodes()) {
                        if (selection.indexOf(node) < 0) {
                            // link.hide();
                            node.unhighlight();
                            if (hideOthers) {
                                node.hide();
                            }
                        } else {
                            node.highlight();
                        }
                    }

                    for (let demand of network.demands()) {
                        if (selection.indexOf(demand) < 0) {
                            demand.unhighlight();
                            if (hideOthers) {
                                demand.hide();
                            }
                        } else {
                            demand.highlight();
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            // Highlight selected items
            function unhighlightSelection(selection, hideOthers) {
                try {
                    let network = networkService.network();
                    for (let link of network.links()) {
                        if (selection.indexOf(link) < 0) {
                            // link.hide();
                            link.unhighlight();
                            if (hideOthers) {
                                link.hide();
                            }

                        } else {
                            link.unhighlight();
                        }
                    }

                    for (let node of network.nodes()) {
                        if (selection.indexOf(node) < 0) {
                            // link.hide();
                            node.unhighlight();
                            if (hideOthers) {
                                node.hide();
                            }
                        } else {
                            node.unhighlight();
                        }
                    }

                    for (let demand of network.demands()) {
                        if (selection.indexOf(demand) < 0) {
                            demand.unhighlight();
                            if (hideOthers) {
                                demand.hide();
                            }
                        } else {
                            demand.unhighlight();
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            function hideSelection(selection) {
                console.log("hiding selection: ", selection);
                try {
                    for (let obj of selection) {
                        obj.hide();
                    }
                    // let network = networkService.network();
                    // for (let link of network.links()) {
                    //     if (selection.indexOf(link) >= 0) {
                    //         link.hide();
                    //     }
                    // }
                } catch (e) {
                    console.log(e);
                }
            };

            function showSelection(selection, hideOthers) {
                console.log("showing selection: ", selection);
                try {
                    for (let obj of selection) {
                        obj.show();
                    }
                    // let network = networkService.network();
                    // for (let link of network.links()) {
                    //     if (selection.indexOf(link) < 0) {
                    //         link.hide();
                    //     } else {
                    //         link.show();
                    //     }
                    // }
                } catch (e) {
                    console.log(e);
                }
            };

            function unhighlightNodes() {
                try {
                    let network = networkService.network();
                    for (let node of network.nodes()) {
                        node.unhighlight();
                    }
                } catch (e) {
                    console.log(e);
                }
            };

            function unhighlightLinks() {
                try {
                    let network = networkService.network();
                    for (let link of network.links()) {
                        link.unhighlight();
                    }
                } catch (e) {
                    console.log(e);
                }
            };

            function unhighlightDemands() {
                try {
                    let network = networkService.network();
                    for (let demand of network.demands()) {
                        demand.unhighlight();
                    }
                } catch (e) {
                    console.log(e);
                }
            };

            function unhighlightAll() {
                try {
                    let network = networkService.network();
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
                try {
                    let network = networkService.network();
                    for (let node of network.nodes()) {
                        node.hide();
                    }

                    for (let link of network.links()) {
                        link.hide();
                    }

                    for (let demand of network.demands()) {
                        demand.hide();
                    }

                } catch (e) {
                    console.log(e);
                }
            };

            function showAll() {
                $scope.hidden = false;
                try {
                    let network = networkService.network();
                    for (let node of network.nodes()) {
                        node.show();
                    }

                    for (let link of network.links()) {
                        link.show();
                    }

                    for (let demand of network.demands()) {
                        demand.show();
                    }
                } catch (e) {
                    console.log(e);
                }
            };

            function hideNetworkComponents() {
                if (!$scope.hidden && $scope.loaded) {
                    try {
                        let network = networkService.network();
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
                        let network = networkService.network();
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

            function hideNetworkTraffic() {
                if ($scope.loaded) {
                    try {
                        let network = networkService.network();
                        for (let link of network.links()) {
                            try {
                                link.hideTraffic();
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    $scope.trafficVisible = false;
                }
            }

            function showNetworkTraffic() {
                if ($scope.loaded) {
                    try {
                        var network = networkService.network();
                        for (let link of network.links()) {
                            try {
                                link.showTraffic();
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    $scope.trafficVisible = true;
                }
            }

            function resetNetworkTraffic() {
                console.log("resetting network traffic...");
                let network = networkService.network();
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
                    var network = networkService.network();
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
                                    link._update();

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
        }
    ])
})()
