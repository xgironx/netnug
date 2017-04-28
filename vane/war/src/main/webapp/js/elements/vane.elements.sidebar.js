(function(){
    angular.module("vane.elements")
    .directive("vaneSidebar", ['$rootScope', '$route', '$filter', '$timeout', '$q', 'leaflet', 'highlighterService',
        'networkService', 'selectionService', 'Node', 'Link', 'Demand', 'Route',
        function($rootScope, $route, $filter, $timeout, $q, leaflet, highlighterService, networkService, selectionService,
                 Node, Link, Demand, Route) {
        return {
            template: `
            <style>
            [vane-sidebar] {
                font-size: 0.9em;
                overflow-y: scroll;
            }

            [vane-sidebar] button:focus{
                outline: none;
            }

            [vane-sidebar] h3 {
                font-size: 1.4em;
                margin: 0px 0px 0px 0px;
            }

            [vane-sidebar] h4 {
                font-size: 1.2em;
            }

            </style>

            <ul class="nav nav-tabs">
                <li class="nav-item" ng-if="activeView == 'map'">
                    <button class="nav-link" ng-click="changeTab('info')" ng-class="{active: activeTab === 'info'}">
                        <i class="fa fa-info-circle" aria-hidden="true"></i> Info
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" ng-click="changeTab('edit')" ng-class="{active: activeTab === 'edit'}">
                        <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
                    </button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" ng-click="changeTab('options')" ng-class="{active: activeTab === 'options'}">
                        <i class="fa fa-cog" aria-hidden="true"></i> Options
                    </button>
                </li>
            </ul>

            <div vane-info-tab ng-if="activeTab == 'info'"></div>
            <div vane-edit-tab ng-if="activeTab == 'edit'"></div>
            <div vane-options-tab ng-if="activeTab == 'options'"></div>

            <!--
            <md-content>
              <md-tabs md-dynamic-height md-border-bottom>
                <md-tab id="tab1" ng-click="changeTab('info')">
                    <md-tab-label><i class="fa fa-info-circle" aria-hidden="true"></i> Info</md-tab-label>
                    <md-tab-body>
                        <div vane-info-tab></div>
                    </md-tab-body>
                </md-tab>
                <md-tab id="tab2" ng-click="changeTab('edit')">
                    <md-tab-label><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit</md-tab-label>
                    <md-tab-body>
                        <div vane-edit-tab></div>
                    </md-tab-body>
                </md-tab>
                <md-tab id="tab3" ng-click="changeTab('options')">
                    <md-tab-label><i class="fa fa-cog" aria-hidden="true"></i> Options</md-tab-label>
                    <md-tab-body>
                        <div vane-options-tab></div>
                    </md-tab-body>
                </md-tab>
              </md-tabs>
            </md-content>
            -->

            `,
            link: function(scope, element, attrs){
                scope.activeView = $route.current.activeView;

                scope.changeTab = function(activeTab) {
                    if (scope.activeTab != activeTab) {
                        console.log("Setting tab from " + scope.activeTab + " to " + activeTab);
                        scope.activeTab = activeTab;

                        if (activeTab == 'edit') {
                            if (scope.activeView == 'demands') {
                                scope.editView = 'demands';
                            } else {
                                scope.editView = 'all';
                            }
                        }
                    }
                };

                if ($route.current.activeView == 'demands') {
                    scope.changeTab('edit');
                } else {
                    scope.changeTab('info');
                }

                scope.selection = null;
                scope.multiSelection = false;
                scope.singleNodeSelection = false;
                scope.singleLinkSelection = false;
                scope.singleDemandSelection = false;
                scope.multiNodeSelection = false;
                scope.duplexLinkSelection = false;
                scope.multiLinkSelection = false;
                scope.multiDemandSelection = false;
                scope.nodeSelection = false;
                scope.linkSelection = false;
                scope.demandSelection = false;
                scope.routeSelection = false;
                scope.noSelection = false;

                scope.allNodesSelected = false;
                scope.allLinksSelected = false;

                scope.addingNode = scope.editingNodes = false;
                scope.addingLink = scope.editingLinks = false;
                scope.addingDemand = scope.editingDemands = false;

                scope.fromNodes = [];
                scope.toNodes = [];

                scope.nodes = {
                    available: null,
                    selection: null,
                    equipment: ['Server', 'Router', 'Switch', 'LAN', 'Workstation', 'Cloud'],
                    edits: {
                        name: null,
                        lat: null,
                        lng: null,
                        equipment: null,
                    },
                };

                scope.links = {
                    available: null,
                    selection: null,
                    models: [{name: '10Gbps_Ethernet', bandwidth: 10e9},
                             {name: '40Gbps_Ethernet', bandwidth: 40e9},
                             {name: '10BaseT', bandwidth: 10e6},
                             {name: '100BaseT', bandwidth: 100e6},
                             {name: '1000BaseX', bandwidth: 1e9},
                             {name: 'T1_int', bandwidth: 192e3}],
                    edits: {
                        capacity: null,
                        model: null
                    },
                };

                scope.duplexLink = {
                    forwardLink: null,
                    reverseLink: null,
                    selection: null,
                    links: null,
                };

                scope.demands = {
                    available: null,
                    selection: null,
                    edits: {multiplier: null, multiplierPlaceholder: 'Enter numeric multiplier'},
                };

                scope.routes = {
                    available: null,
                    selection: null,
                };

                scope.isNumeric = function(val) {
                    var type = typeof val;
                    return (type === "number" || type === "string") && !isNaN(val - parseFloat(val));
                };

                function onMapClick(e) {
                    let latLng = e.latlng;
                    scope.newNode.latLng = latLng;
                    scope.newNode.lat = latLng.lat;
                    scope.newNode.lng = latLng.lng;
                    scope.$apply();
                }

                scope.addNewNode = function() {
                    deselectAll();
                    $timeout(function(){$rootScope.$broadcast("vane.hideNetworkTraffic");}, 0);
                    resetNewNode();
                    let map = networkService.getMap();
                    map.on('click', onMapClick);
                    scope.addingNode = true;
                };

                scope.addNode = function() {
                    let network = networkService.getNetwork();
                    let map = networkService.getMap();

                    let name = scope.newNode.name;
                    let latLng = scope.newNode.latLng;
                    let equipment = scope.newNode.equipment;

                    network.addNode(name, latLng, equipment);
                    map.off('click', onMapClick);
                    updateStatus("New node added.");

                    scope.addingNode = false;
                };

                scope.cancelAddNode = function() {
                    scope.addingNode = false;
                };

                scope.editSelectedNodes = function() {
                    scope.addingNode = false;
                    scope.editingNodes = true;
                    let selectedNodes = selectionService.getSelectedNodes();
                    if (scope.singleNodeSelection) {
                        let node = selectedNodes[0];
                        scope.nodes.edits.name = node.getName();
                        scope.nodes.edits.lat = node.getLatLng().lat;
                        scope.nodes.edits.lng = node.getLatLng().lng;
                        scope.nodes.edits.equipment = node.getEquipment();
                    } else {
                        scope.nodes.edits.equipment = null;
                    }
                };

                scope.saveNodeEdits = function() {
                    let edits = scope.nodes.edits;
                    let selectedNodes = selectionService.getSelectedNodes();
                    if (scope.singleNodeSelection) {
                        let node = selectedNodes[0];
                        node.setName(edits.name);
                        node.setLatLng(leaflet.latLng(edits.lat, edits.lng));
                        node.setEquipment(edits.equipment);

                    } else {
                        let equipment = edits.equipment;
                        for (let node of selectedNodes) {
                            node.setEquipment(equipment);
                        }
                    }
                    scope.editingNodes = false;
                    updateStatus("Node(s) modified.");
                };

                scope.cancelNodeEdits = function() {
                    scope.editingNodes = false;
                }

                scope.deleteSelectedNodes = function() {
                    scope.addingNode = scope.editingNodes = false;
                    let selectedNodes = selectionService.getSelectedNodes();
                    $timeout(function(){$rootScope.$broadcast("vane.deleteSelection", selectedNodes, "node");}, 0);
                    updateStatus("Nodes(s) removed.");
                    $timeout(updateAvailableNodes, 0);
                    deselectAll();
                };

                scope.enableSelectedNodes = function() {
                    let selectedNodes = selectionService.getSelectedNodes();
                    $rootScope.$broadcast("vane.enableSelection", selectionService.getSelectedNodes(), "Node(s) enabled.");
                };

                scope.disableSelectedNodes = function() {
                    scope.addingNode = scope.editingNodes = false;
                    $rootScope.$broadcast("vane.disableSelection", selectionService.getSelectedNodes(), "Node(s) disabled.");
                };

                scope.addNewLink = function() {
                    resetNewLink();
                    deselectAll();
                    $timeout(function(){$rootScope.$broadcast("vane.hideNetworkTraffic");}, 0);

                    updateAvailableNodes();
                    scope.addingLink = true;
                };

                scope.addLink = function() {
                    let network = networkService.getNetwork();
                    let fromNode = scope.newLink.fromNode;
                    let toNode = scope.newLink.toNode;
                    let model = scope.newLink.model.name;
                    let duplex = scope.newLink.duplex;

                    network.addLink(fromNode, toNode, model, duplex);
                    updateStatus("New link added.");
                    $rootScope.$broadcast("vane.unhighlightSelection", [fromNode, toNode]);

                    scope.addingLink = false;
                };

                scope.cancelAddLink = function() {
                    scope.addingLink = false;
                };

                scope.editSelectedLinks = function() {
                    scope.addingLink = false;
                    scope.editingLinks = true;

                };

                scope.cancelLinkEdits = function() {
                    scope.editingLinks = false;
                }

                scope.deleteSelectedLinks = function() {
                    scope.addingLink = scope.editingLinks = false;
                    let selectedLinks = selectionService.getSelectedLinks();
                    $timeout(function(){$rootScope.$broadcast("vane.deleteSelection", selectedLinks, "link");}, 0);
                    updateStatus("Links(s) removed.");
                };

                scope.addNewDemand = function() {
                    deselectAll();
                    $timeout(function(){$rootScope.$broadcast("vane.hideNetworkTraffic");}, 0);

                    resetNewDemand();
                    updateAvailableNodes();
                    scope.addingDemand = true;
                };

                scope.addDemand = function() {
                    console.log('Adding demand...');
                    let network = networkService.getNetwork();

                    let fromNode = scope.newDemand.fromNode;
                    let toNode = scope.newDemand.toNode;

                    let trafficProfileParameters = scope.newDemand.trafficProfileParameters;
                    let trafficProfileFunction = trafficProfileParameters.function;

                    let timeStep = parseInt(trafficProfileParameters.timeStep, 10);
                    let startTime = parseInt(trafficProfileParameters.startTime, 10);
                    let endTime = parseInt(trafficProfileParameters.endTime, 10);
                    let startTimeMultiple = parseInt(trafficProfileParameters.startTimeMultiple, 10);
                    let endTimeMultiple = parseInt(trafficProfileParameters.endTimeMultiple, 10);

                    let trafficProfile = null;

                    if (trafficProfileFunction == 'Constant') {
                        let constantTrafficAmount = parseInt(trafficProfileParameters.constantTrafficAmount, 10);
                        trafficProfile = Demand.prototype.generateConstantTrafficProfile(startTime, endTime, timeStep, constantTrafficAmount);
                    } else if (trafficProfileFunction == 'Random') {
                        let minTrafficAmount = parseInt(trafficProfileParameters.minTrafficAmount, 10);
                        let maxTrafficAmount = parseInt(trafficProfileParameters.maxTrafficAmount, 10);

                        trafficProfile = Demand.prototype.generateRandomTrafficProfile(startTime, endTime, timeStep, minTrafficAmount, maxTrafficAmount);

                    } else if (trafficProfileFunction == 'Parametric') {

                    } else if (trafficProfileFunction == 'Custom') {

                    }

                    console.log("trafficProfile: ", trafficProfile);

                    network.addDemand(fromNode, toNode, trafficProfile);
                    updateAvailableDemands();
                    scope.demandSelectionChange();
                    updateStatus("New demand added.");
                    // $timeout(function(){
                    //     updateAvailableDemands();
                    // }, 0);
                    scope.addingDemand = false;
                };

                scope.cancelAddDemand = function() {
                    scope.addingDemand = false;
                };

                scope.editSelectedDemands = function() {
                    scope.addingDemand = false;
                    scope.editingDemands = true;
                    scope.demandTrafficProfile = $filter("orderBy")(scope.demands.selection[0].getTrafficProfile(), 'time');
                };

                scope.saveDemandEdits = function() {
                    scope.applyMultiplier();
                    scope.addingDemand = scope.editingDemands = false;
                    updateStatus("Demand traffic modified.");
                };

                scope.cancelDemandEdits = function() {
                    scope.addingDemand = scope.editingDemands = false;
                    let selectedDemands = selectionService.getSelectedDemands();
                    if (selectedDemands) {
                        for (let demand of selectedDemands) {
                            demand.restoreOriginalTrafficProfile();
                        }
                    }
                    updateDemandTrafficChart(selectedDemands);
                };

                scope.applyMultiplier = function() {

                    if (scope.isNumeric(scope.demands.edits.multiplier)) {

                        let multiplier = parseFloat(scope.demands.edits.multiplier);

                        var selectedDemands = selectionService.getSelectedDemands();

                        if (selectedDemands) {
                            for (let demand of selectedDemands) {
                                let traffic = demand.getTrafficTimeSeries();
                                let amounts = traffic.amounts;
                                for (let i=0; i < amounts.length; i++) {
                                    amounts[i] = Math.trunc(Math.round(multiplier * amounts[i]));
                                }
                                demand._updateTrafficProfile();
                            }
                            updateDemandTrafficChart(selectedDemands);
                        }
                        updateStatus("Demand traffic modified.");
                        scope.demands.edits.multiplier = null;
                        scope.editSelectedDemands();
                    }
                };

                scope.saveTrafficProfileEdits = function() {
                    let updatedTrafficProfile = [];
                    let editedTrafficProfile = scope.demandTrafficProfile;
                    let selectedDemand = scope.demands.selection[0];
                    for (let i=0; i < editedTrafficProfile.length; i++) {
                        updatedTrafficProfile.push({'time': parseInt(editedTrafficProfile[i].time, 10),
                                                    'amount': parseInt(editedTrafficProfile[i].amount, 10)});
                    }
                    selectedDemand.setTrafficProfile(updatedTrafficProfile);
                    updateStatus("Demand traffic modified.");
                    updateDemandTrafficChart(scope.demands.selection)
                };

                scope.deleteTrafficProfileRow = function(index) {
                };

                scope.deleteSelectedDemands = function() {
                    scope.addingDemand = scope.editingDemands = false;
                    let selectedDemands = selectionService.getSelectedDemands();
                    $timeout(function(){$rootScope.$broadcast("vane.deleteSelection", selectedDemands, "demand");}, 0);
                    updateStatus("Demand(s) removed.");
                };

                scope.enableSelectedDemands = function() {
                    let selectedDemands = selectionService.getSelectedDemands();
                    for (let demand of selectedDemands) {
                        demand.enable();
                    }
                    updateStatus("Demand(s) enabled.");
                    scope.demandSelectionChange();
                };

                scope.disableSelectedDemands = function() {
                    let selectedDemands = selectionService.getSelectedDemands();
                    scope.addingDemand = scope.editingDemands = false;
                    for (let demand of selectedDemands) {
                        demand.disable();
                    }
                    $timeout(function(){updateStatus("Demand(s) disabled.");}, 0);
                    updateSelections();
                };

                var chartColorMap = ['#00ADF9', '#DF1404', '#803690', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#DCDCDC'];

                // Link capacity slider setup/config
                function capacitySliderUpdate() {
                    if (scope.singleLinkSelection) {
                        scope.selection.capacity(scope.capacitySlider.value);
                        // scope.selection.update();
                    } else if (scope.duplexLinkSelection) {
                        scope.duplexLink.forwardLink.setCapacity(scope.capacitySlider.value);
                    } else if (scope.multiLinkSelection) {
                        for (let link of selectionService.getSelectedLinks()) {
                            if (link.getDirection() == 'Forward') {
                                link.setCapacity(scope.capacitySlider.value);
                            }
                        }
                    }
                    updateStatus("Link bandwidth changed.");
                }

                scope.capacitySlider = {
                    options: {
                        scale: .9,
                        translate: function(value) {return $filter("capacityUnits")(value);},
                        onChange: capacitySliderUpdate,
                        onEnd: capacitySliderUpdate,
                        showTicksValues: true,
                        stepsArray: [
                            {value: 192e3},
                            {value: 10e6},
                            {value: 100e6},
                            {value: 1e9},
                            {value: 10e9},
                            {value: 40e9},
                        ]
                    },
                    value: 0,
                };

                function formatUtilizationPercent(value, index, values) {
                    if (value == 0.0) {
                        return value;
                    } else if (value < 0.1) {
                        return value.toExponential(1);
                    } else if (value < 1) {
                        return value.toFixed(2);
                    } else {
                        return value.toFixed(1);
                    }
                }

                scope.linkUsageChartOptions = {
                    elements: {
                        line: {
                            tension: 0,
                            fill: false,
                        }
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "Time (seconds)"
                            },
                            ticks: {
                                beginAtZero: true,
                                callback: function(value, index, values) {
                                    return value.toString();
                                }
                            }
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "Utilization (%)"
                            },
                            ticks: {
                                beginAtZero: true,
                                callback: formatUtilizationPercent,
                            }
                        }],
                    },
                    legend: {
                        display: true,
                    }
                };

                scope.fromNodeSelectionChange = function() {
                    let selectedFromNode = null;
                    let selectedToNode = null;
                    if (scope.addingLink) {
                        selectedFromNode = scope.newLink.fromNode;
                        selectedToNode = scope.newLink.toNode;
                    } else {
                        selectedFromNode = scope.newDemand.fromNode;
                        selectedToNode = scope.newDemand.toNode;
                    }
                    highlightSelection([selectedFromNode, selectedToNode], true);
                };

                scope.toNodeSelectionChange = function() {
                    let selectedFromNode = null;
                    let selectedToNode = null;
                    if (scope.addingLink) {
                        selectedFromNode = scope.newLink.fromNode;
                        selectedToNode = scope.newLink.toNode;
                    } else {
                        selectedFromNode = scope.newDemand.fromNode;
                        selectedToNode = scope.newDemand.toNode;
                    }
                    highlightSelection([selectedFromNode, selectedToNode], true);
                };

                function refreshNetworkLayers() {
                    let deferred = $q.defer();
                    let promise = deferred.promise;

                    promise
                    .then(function() {
                        return $rootScope.$broadcast("vane.hideAll");
                        // return;
                    })
                    .then(function() {
                        return $rootScope.$broadcast("vane.showNetworkComponents");
                    })
                    .then(function() {
                        return $rootScope.$broadcast("vane.showNetworkTraffic");
                    });

                    deferred.resolve();
                    return promise;
                }

                // function openPopup(singleSelectionOnly) {
                //     if (singleSelectionOnly) {
                //         if (selectionService.hasSingleSelection()) {
                //             selectionService
                //         }
                //     }
                // }

                scope.nodeSelectionChange = function() {
                    console.log('NODE SELECTION CHANGE...');
                    scope.addingNode = scope.editingNodes = false;
                    resetSelectedLinks();
                    resetSelectedDemands();
                    selectionService.deselectAll().setSelectedNodes(scope.nodes.selection);
                    updateSelections();
                };

                scope.linkSelectionChange = function() {
                    console.log('LINK SELECTION CHANGE...');
                    scope.addingLink = scope.editingLinks = false;
                    resetSelectedNodes();
                    resetSelectedDemands();
                    selectionService.deselectAll().setSelectedLinks(scope.links.selection);
                    updateSelections();
                };

                //Watch for Duplex Link Selection Dropdown Changes
                scope.duplexLinkSelectionChange = function() {
                    console.log("DUPLEX LINK DIRECTION CHANGE...");
                    // resetSelectedDemands();
                    let link = scope.duplexLink.selection;
                    link.bringToFront();
                    $q.when()
                    .then(function() {
                        return resetSelectedDemands();
                    })
                    .then(function() {
                        return updateAvailableDemands();
                    });
                    // .then(function() {
                    //     return scope.demandSelectionChange();
                    // });
                };

                //Watch for when Demands Dropdown changes
                scope.demandSelectionChange = function() {
                    console.log('DEMAND SELECTION CHANGE...');
                    // $rootScope.$broadcast("vane.unhighlightAll");
                    scope.addingDemand = scope.editingDemands = false;
                    // resetSelectedNodes();
                    // resetSelectedLinks();


                    // let deferred = $q.defer();
                    // deferred.resolve(highlighterService.unhighlightAll());
                    // $q.when(deferred.promise)
                    $q.when()
                    .then(function() {
                        return $rootScope.$broadcast("vane.hideNetworkDemands");
                    })
                    .then(function() {
                        return $rootScope.$broadcast("vane.hideNetworkTraffic");
                    })
                    .then(function() {
                        let deferred = $q.defer();
                        let selectedDemands = selectionService.setSelectedDemands(scope.demands.selection).getSelectedDemands();
                        deferred.resolve(selectedDemands);
                        $q.when(deferred.promise)
                        .then(function(selectedDemands) {
                            console.log("selectedDemands: ", selectedDemands);
                            if (selectedDemands) {
                                $q.when()
                                .then(function() {
                                    return updateAvailableRoutes(selectedDemands);
                                })
                                .then(function() {
                                    // return $rootScope.$broadcast("vane.showSelection", selectedDemands, true);
                                    return $rootScope.$broadcast("vane.highlightSelection", selectedDemands, true);
                                })
                            } else {
                                let deferred = $q.defer();
                                let availableDemands = networkService.getAvailableDemands();
                                deferred.resolve(availableDemands);
                                $q.when(deferred.promise)
                                .then(function(availableDemands) {
                                    console.log("availableDemands: ", availableDemands);
                                    $q.when()
                                    .then(function() {
                                        return $rootScope.$broadcast("vane.showNetworkTraffic", availableDemands);
                                    })
                                    .then(function() {
                                        // return $rootScope.$broadcast("vane.showNetworkDemands", availableDemands, true);
                                        return $rootScope.$broadcast("vane.highlightSelection", availableDemands, true);
                                    });
                                });
                            }
                        })
                        .then(function() {
                            updateSelections();
                        });
                    });
                };

                //Watch for when Routes Dropdown Changes
                scope.routeSelectionChange = function() {
                    console.log("ROUTE SELECTION CHANGE...");
                    let selectedDemands = selectionService.getSelectedDemands();
                    // console.log("routes.selection: ", scope.routes.selection);
                    let deferred = $q.defer();
                    deferred.resolve(selectedDemands);

                    $q.when(deferred.promise)
                    .then(function(selectedDemands) {
                        let selection = [];
                        if (selectedDemands) {
                            let selectedRoutes = selectionService.selectedRoutes(scope.routes.selection);
                            let deferred = $q.defer();
                            deferred.resolve(selectedRoutes);
                            $q.when(deferred.promise)
                            .then(function(selectedRoutes) {
                                if (selectedRoutes) {
                                    for (let route of selectedRoutes) {
                                        selection = [...selection, ...route.links(), ...route.nodes()];
                                        route.highlight();
                                    }
                                }
                                let selectionSet = new Set(selection);
                                selection = [...selectionSet, ...selectedDemands];
                                $rootScope.$broadcast("vane.highlightSelection", selection, true);
                                updateDemandTrafficChart(selectedDemands, selectedRoutes);
                            });
                        }
                        // $rootScope.$broadcast("vane.highlightSelection", selectedDemands);
                        // updateDemandTrafficChart(selectedDemands, selectedRoutes);
                    });
                };

                function highlightSelection(selection, exclusive, hideExcluded) {
                    $rootScope.$broadcast("vane.highlightSelection", selection, exclusive, hideExcluded);
                }

                function updateStatus(statusMessage) {
                    $timeout(function(){$rootScope.$broadcast("vane.updateStatus", statusMessage, 'analyze', 'warning');}, 0);
                }

                function updateDemandTrafficChart(selectedDemands, selectedRoutes) {
                    $rootScope.$broadcast("vane.updateDemandTrafficChart", selectedDemands, selectedRoutes);
                }

                function updateLinkUtilizationChart(selectedLinks) {

                    var linkUsageChartData = [];
                    var linkUsageChartSeries = [];
                    var linkUsageChartColors = [];
                    var linkUsageChartLabels = [];

                    if (selectedLinks) {
                        let colorMapIndex = 0;
                        for (let link of selectedLinks) {
                            let usageTimeSeries = link.getBandwidthUtilizationTimeSeries();
                            let usages = usageTimeSeries.usages;
                            let times = usageTimeSeries.times;
                            if (usages != null) {
                                linkUsageChartData.push(usages);
                                linkUsageChartLabels.push(times);
                                linkUsageChartColors.push(chartColorMap[colorMapIndex % chartColorMap.length]);
                                linkUsageChartSeries.push(link.direction());
                                colorMapIndex++;
                            }
                        }
                    }
                    scope.linkUsageChartColors = linkUsageChartColors;
                    scope.linkUsageChartData = linkUsageChartData;
                    scope.linkUsageChartLabels = linkUsageChartLabels[0];
                    scope.linkUsageChartSeries = linkUsageChartSeries;
                }

                function resetNewNode() {
                    scope.newNode = {
                        latLng: null,
                        lat: null,
                        lng: null,
                        name: null,
                        equipment: null,
                    };
                }

                function resetNewLink() {
                    scope.newLink = {
                        fromNode: null,
                        toNode: null,
                        name: null,
                        model: null,
                        capacity: null,
                        duplex: true,
                    };
                }

                function resetNewDemand() {
                    scope.newDemand = {
                        fromNode: null,
                        toNode: null,
                        trafficProfileParameters: {
                            function: null,
                            functions: ['Constant', 'Random', 'Parametric', 'Custom'],
                            parametricFunctions: ['sin(t)', 'cos(t)'],
                            timeStep: null,
                            timeStepPlaceholder: 'Enter profile time step (seconds)',
                            startTime: null,
                            startTimePlaceholder: 'Enter profile start time (seconds)',
                            endTime: null,
                            endTimePlaceholder: 'Enter profile end time (seconds)',
                            startTimeMultiple: null,
                            startTimeMultiplePlaceholder: 'Enter start time-time step multiple',
                            endTimeMultiple: null,
                            endTimeMultiplePlaceholder: 'Enter end time-time step multiple',
                            minTrafficAmount: null,
                            minTrafficAmountPlaceholder: 'Enter minimum traffic amount (b/s)',
                            maxTrafficAmount: null,
                            maxTrafficAmountPlaceholder: 'Enter maximum traffic amount (b/s)',
                            constantTrafficAmount: null,
                            constantTrafficAmountPlaceholder: 'Enter constant traffic amount (b/s)',
                        },
                        // validTrafficProfileParameters: false,
                    };


                    // scope.newDemand.createTrafficProfile = function() {

                    //     let trafficProfileFunction = scope.newDemand.trafficProfileParameters.function;
                    //     console.log('trafficProfileFunction: ', trafficProfileFunction);
                    //     if (trafficProfileFunction == 'Constant') {
                    //     } else if (trafficProfileFunction == 'Random') {

                    //     } else if (trafficProfileFunction == 'Parametric') {

                    //     } else if (trafficProfileFunction == 'Custom') {

                    //     }
                    // };
                }

                function resetSelectedNodes() {
                    scope.nodes.selection = null;
                    selectionService.resetSelectedNodes();
                }

                function resetSelectedLinks() {
                    scope.links.selection = null;
                    selectionService.resetSelectedLinks();
                }

                function resetSelectedDemands() {
                    console.log("Resetting selected demands...");
                    scope.demands.selection = null;
                    selectionService.resetSelectedDemands();
                    // updateDemandTrafficChart();
                    resetSelectedRoutes();
                }

                function resetSelectedRoutes() {
                    console.log("Resetting selected demands...");
                    scope.routes.selection = null;
                    selectionService.resetSelectedRoutes();
                    updateDemandTrafficChart(selectionService.getSelectedDemands());
                }

                function deselectAll() {
                    console.log("DESELECTING ALL...");
                    $timeout(function(){selectionService.deselectAll();}, 0);
                    // $timeout(function(){$rootScope.$broadcast("vane.hideAll");}, 0);
                    $timeout(function(){$rootScope.$broadcast("vane.unhighlightAll");}, 0);
                    // $timeout(function(){$rootScope.$broadcast("vane.hideNetworkTraffic");}, 0);

                    $timeout(function(){resetSelectedNodes();}, 0);
                    $timeout(function(){resetSelectedLinks();}, 0);
                    $timeout(function(){resetSelectedDemands();}, 0);
                    updateSelections();
                    updateDemandTrafficChart();
                }

                function updateAvailableNodes() {
                    let deferred = $q.defer();
                    let availableNodes = networkService.getAvailableNodes();
                    deferred.resolve(availableNodes);

                    $q.when(deferred.promise)
                    .then(function(availableNodes) {
                        scope.nodes.available = availableNodes;
                        scope.fromNodes = availableNodes;
                        scope.toNodes = availableNodes;
                        scope.nodesListSize = availableNodes ? Math.max(Math.min(availableNodes.length, 5), 5) : 0;
                    })

                    let selectedFromNode = null;
                    let selectedToNode = null;
                    if (scope.addingLink) {
                        selectedFromNode = scope.newLink.fromNode;
                        selectedToNode = scope.newLink.toNode;
                    } else {
                        selectedFromNode = scope.newDemand.fromNode;
                        selectedToNode = scope.newDemand.toNode;
                    }
                    // scope.fromNodes = availableNodes;
                    // scope.toNodes = availableNodes;

                    // if (selectedFromNode == null && selectedToNode == null) {
                    //     scope.fromNodes.available = availableNodes;
                    //     scope.toNodes.available = availableNodes;
                    // }
                }

                function updateAvailableLinks() {
                    let deferred = $q.defer();
                    let availableLinks = $filter('filter')(networkService.getAvailableLinks(), function(value, index, array) {return value.getDirection() == "Forward";});
                    deferred.resolve(availableLinks);

                    $q.when(deferred.promise)
                    .then(function(links) {
                        scope.links.available = availableLinks;
                        scope.linksListSize = availableLinks ? Math.max(Math.min(availableLinks.length, 5), 5) : 0;
                    })
                }

                function updateAvailableDemands() {
                    console.log('UPDATING AVAILABLE DEMANDS...');

                    $q.when()
                    .then(function() {
                        return $rootScope.$broadcast("vane.hideNetworkDemands");
                    })
                    .then(function() {
                        return $rootScope.$broadcast("vane.hideNetworkTraffic");
                    })
                    .then(function() {

                        let deferred = $q.defer();
                        let availableDemands = null;
                        if (scope.activeTab == 'info') {
                            if (scope.multiSelection) {
                                console.log("updating multi selection demands...");
                                if (scope.duplexLinkSelection) {
                                    console.log('updating duplex link demands...');
                                    try {
                                        availableDemands = scope.duplexLink.selection.getAssociatedDemands();
                                    } catch (e) {
                                        console.log(e);
                                    }
                                } else {
                                    availableDemands = new Set();
                                    for (let obj of selectionService.selection()) {
                                        for (let demand of obj.getAssociatedDemands()) {
                                            availableDemands.add(demand);
                                        }
                                    }
                                    availableDemands = [...availableDemands];
                                }
                            } else if (scope.singleLinkSelection || scope.singleNodeSelection) {
                                availableDemands = scope.selection.getAssociatedDemands();
                            } else {
                                availableDemands = networkService.getAvailableDemands();
                            }
                        } else {
                            availableDemands = networkService.getAvailableDemands();
                        }

                        deferred.resolve(availableDemands);

                        $q.when(deferred.promise)
                        .then(function(demands) {
                            console.log("availableDemands: ", availableDemands);
                            scope.demands.available = availableDemands;
                            scope.demandsListSize = availableDemands ? Math.max(Math.min(availableDemands.length, 5), 5) : 0;

                            if (availableDemands) {
                                $q.when()
                                .then(function() {
                                    return $rootScope.$broadcast("vane.showNetworkTraffic", availableDemands);
                                })
                                .then(function() {
                                    // return $rootScope.$broadcast("vane.showNetworkDemands", availableDemands, true);
                                    return $rootScope.$broadcast("vane.highlightSelection", availableDemands, true);
                                });
                            }
                        });
                    });
                }

                function updateAvailableRoutes(demands) {
                    console.log("UPDATING AVAILABLE ROUTES...");
                    let deferred = $q.defer();
                    let availableRoutes = networkService.getAvailableRoutes(demands);
                    deferred.resolve(availableRoutes);

                    $q.when(deferred.promise)
                    .then(function(availableRoutes) {
                        console.log("availableRoutes: ", availableRoutes);
                        scope.routes.available = availableRoutes;
                        scope.routesListSize = availableRoutes ? Math.min(availableRoutes.length, 5) : 0;
                        if (availableRoutes) {
                            let selection = [];
                            for (let route of availableRoutes) {
                                selection = [...selection, ...route.links()];
                            }
                            console.log("calling vane.showSelection");
                            $q.when(selection)
                            .then(function() {
                                return $rootScope.$broadcast("vane.showSelection", selection);
                            });
                        }
                    });
                }

                function updateSelections() {
                    console.log("UPDATING SELECTIONS...");

                    let selectedNodes = selectionService.getSelectedNodes();
                    let selectedLinks = selectionService.getSelectedLinks();
                    let selectedDemands = selectionService.getSelectedDemands();
                    let selectedRoutes = selectionService.getSelectedRoutes();

                    scope.hasSelection = selectionService.hasSelection();
                    scope.singleSelection = selectionService.hasSingleSelection();
                    scope.multiSelection = selectionService.hasMultiSelection();
                    scope.noSelection = !scope.hasSelection;

                    if (selectedDemands !== null && selectedDemands.length > 0) {
                        scope.demandSelection = true;
                        scope.singleDemandSelection = selectedDemands.length == 1;
                        scope.multiDemandSelection = selectedDemands.length > 1;
                        scope.allSelectedDemandsEnabled = $filter('allEnabled')(selectedDemands);
                        scope.allSelectedDemandsDisabled = $filter('allDisabled')(selectedDemands);

                        if (scope.activeTab == 'info') {
                            if (scope.singleDemandSelection) {
                                scope.demands.selection = selectedDemands[0];
                            } else {
                                scope.demandSelection = false;
                                resetSelectedDemands();
                            }
                        } else {
                            scope.demands.selection = selectedDemands;
                        }
                    } else {
                        scope.demandSelection = false;
                    }

                    if (selectedRoutes !== null && selectedRoutes.length > 0) {
                        scope.routeSelection = true;
                        scope.singleRouteSelection = selectedRoutes.length == 1;
                        scope.multiRouteSelection = selectedRoutes.length > 1;

                        if (scope.activeTab == 'info') {
                            if (scope.singleRouteSelection) {
                                scope.routes.selection = selectedRoutes[0];
                            } else {
                                scope.routes.selection = null;
                            }
                        } else {
                            scope.routes.selection = selectedRoutes;
                        }
                    } else {
                        scope.routeSelection = false;
                    }

                    updateDemandTrafficChart(selectedDemands, selectedRoutes);

                    // scope.noSelection = !scope.duplexLinkSelection && !scope.nodeSelection && !scope.linkSelection; // && !scope.demandSelection && !scope.routeSelection;

                    if (scope.hasSelection) {
                        let selection = selectionService.selection();

                        scope.nodeSelection = (scope.singleSelection && selection instanceof Node) || (selectedNodes !== null);
                        scope.linkSelection = (scope.singleSelection && selection instanceof Link) || (selectedLinks !== null);

                        scope.nodes.selection = selectedNodes;
                        scope.links.selection = selectedLinks;

                        if (selectedNodes) {
                            scope.allSelectedNodesEnabled = $filter("allEnabled")(selectedNodes);
                            scope.allSelectedNodesDisabled = $filter("allDisabled")(selectedNodes);
                            scope.singleNodeSelection = selectedNodes.length == 1;
                            scope.multiNodeSelection = selectedNodes.length > 1;
                        } else {
                            scope.singleNodeSelection = scope.multiNodeSelection = false;
                        }

                        if (selectedLinks) {
                            scope.allSelectedLinksEnabled = $filter("allEnabled")(selectedLinks);
                            scope.allSelectedLinksDisabled = $filter("allDisabled")(selectedLinks);
                            scope.singleLinkSelection = selectedLinks.length == 1;
                            scope.multiLinkSelection = selectedLinks.length > 1;
                        } else {
                            scope.singleLinkSelection = false;
                            scope.multiLinkSelection = false;
                        }

                        scope.allNodesSelected = selectionService.allNodesSelected();
                        scope.allLinksSelected = selectionService.allLinksSelected();

                        if (scope.multiSelection) {
                            scope.allEnabled = selectionService.allEnabled();
                            scope.allDisabled = selectionService.allDisabled();

                            if (selectionService.count() == 2) {
                                let selection = selectionService.selection();

                                let item1 = selection.next().value;
                                let item2 = selection.next().value;

                                if (item1 instanceof Link && item1.duplex() &&
                                    item2 instanceof Link && item2.duplex() && item1 === item2.reverseLink()) {
                                    let links = null;
                                    if (item1.direction() == "Forward") {
                                        links = [item1, item2];
                                    } else {
                                        links = [item2, item1];
                                    }

                                    if (scope.duplexLinkSelection && scope.duplexLink.links != null &&
                                        ($filter('arraysEqual')(scope.duplexLink.links, links))) {
                                        console.log("duplex link already selected.");
                                    } else {
                                        let forwardLink = scope.duplexLink.forwardLink = links[0];
                                        let reverseLink = scope.duplexLink.reverseLink = links[1];
                                        scope.duplexLink.links = links;

                                        if (reverseLink.highlighted() ||
                                            (reverseLink.getUsage() != null && forwardLink.getUsage() == null) ||
                                            (scope.singleDemandSelection && reverseLink.getAssociatedDemands().includes(scope.demands.selection))) {
                                            scope.duplexLink.selection = links[1];
                                        } else {
                                            scope.duplexLink.selection = links[0];
                                        }
                                        scope.duplexLink.selection.bringToFront();
                                        scope.duplexLink.selection.unbindPopup().openPopup();
                                        if (links != null) {
                                            scope.duplexLinkSelection = true;
                                            scope.links.selection = links;
                                            // scope.selection = scope.duplexLink.selection;
                                        }

                                        if (scope.duplexLink.forwardLink != null) {
                                            scope.capacitySlider.value = scope.duplexLink.forwardLink.capacity();
                                        }
                                    }
                                }

                            } else {
                                scope.duplexLinkSelection = false;
                                scope.duplexLink.links = null;
                            }

                        } else {
                            let selection = selectionService.selection();
                            scope.selection = selection;
                            scope.isDisabled = selection.isDisabled();
                            scope.multiNodeSelection = false;
                            scope.multiLinkSelection = false;
                            scope.duplexLinkSelection = false;
                            // scope.nodeSelection = scope.linkSelection = false;

                            if (selection instanceof Node) {
                                console.log("Node selected.");
                                scope.singleNodeSelection = true;
                                scope.singleLinkSelection = false;
                                // scope.nodes.selection = selection;
                                scope.nodes.selection = [selection];
                                resetSelectedLinks();
                            } else {
                                console.log("Link selected");
                                scope.singleNodeSelection = false;
                                scope.singleLinkSelection = true;
                                scope.capacitySlider.value = selection.capacity();
                                scope.links.selection = [selection];
                                resetSelectedNodes();
                            }
                            selection.unbindPopup().openPopup();
                        }
                    } else {
                        resetSelectedNodes();
                        resetSelectedLinks();
                        scope.nodeSelection = scope.linkSelection = false;
                        scope.singleNodeSelection = scope.multiNodeSelection = false;
                        scope.singleLinkSelection = scope.multiLinkSelection = scope.duplexLinkSelection = false;
                    }

                    updateLinkUtilizationChart(scope.links.selection);

                    updateAvailableNodes();
                    updateAvailableLinks();
                    updateAvailableDemands();

                }

                resetNewNode();
                resetNewLink();
                resetNewDemand();

                resetSelectedNodes();
                resetSelectedLinks();
                resetSelectedDemands();

                updateSelections();


                scope.$on("vane.deselectAll", function() {
                    console.log("vane.elements.sidebar.deselectAll event");
                    $timeout(deselectAll, 0);
                });

                scope.$on("vane.updateSelections", function() {
                    console.log("vane.elements.sidebar.updateSelections event");
                    $timeout(function() {updateSelections();}, 0);
                });
            }
        }
    }])
})()
