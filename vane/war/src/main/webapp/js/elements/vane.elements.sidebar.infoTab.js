(function(){
    angular.module("vane.elements")
    .directive("vaneInfoTab", ['$rootScope', '$filter', '$timeout', 'networkService', 'highlighterService', 'selectionService',
        function($rootScope, $filter, $timeout, networkService, highlighterService, selectionService) {
        return {
            template: `
                <style>
                [vane-info-tab] {
                    padding: 1em;
                }
                </style>

                <div ng-if="activeTab == 'info'">

                    <div ng-if="singleNodeSelection">
                        <h3><strong>Node Selection</strong></h3>
                        <div><strong>Name: </strong>{{selection.getPrettifiedName()}}</div>
                        <div><strong>ID: </strong>{{selection.getId()}}</div>
                        <div><strong>Latitude: </strong>{{selection.latLng().lat.toFixed(2)}}</div>
                        <div><strong>Longitude: </strong>{{selection.latLng().lng.toFixed(2)}}</div>
                        <div><strong>Equipment: </strong>{{selection.getModel()}}</div>
                        <hr>
                    </div>

                    <div ng-if="duplexLinkSelection || singleLinkSelection">

                        <div ng-if="duplexLinkSelection">
                            <h3><strong>Duplex Link Selection</strong></h3>

                            <div class="inline-flex-container">
                                <label class="label-style-tweaks" for="duplexLinkDirectionDropdown">Direction:&nbsp;</label>
                                <select class="form-control single-select-style-tweaks"
                                name="duplexLinkDirectionDropdown" id="duplexLinkDirectionDropdown"
                                ng-options="link.direction() for link in duplexLink.links"
                                ng-change="duplexLinkSelectionChange()" ng-model="duplexLink.selection"></select>
                            </div>
                        </div>

                        <div ng-if="singleLinkSelection">
                            <h3><strong>Link Selection</strong></h3>
                        </div>

                        <div><strong>Link: </strong> {{duplexLinkSelection ? duplexLink.selection.getPrettifiedName() : selection.getPrettifiedName()}}</div>
                        <div><strong>From: </strong> {{duplexLinkSelection ? duplexLink.selection.fromNode().getPrettifiedName() : selection.fromNode().getPrettifiedName()}}</div>
                        <div><strong>To: </strong> {{duplexLinkSelection ? duplexLink.selection.toNode().getPrettifiedName() : selection.toNode().getPrettifiedName()}}</div>
                        <div><strong>ID: </strong> {{duplexLinkSelection ? duplexLink.selection.id() : selection.id()}}</div>
                        <div><strong>Model: </strong> {{duplexLinkSelection ? duplexLink.selection.model() : selection.model()}}</div>
                        <div><strong>Demands: </strong> {{duplexLinkSelection ? duplexLink.selection.demands().length : selection.demands().length}}</div>
                        <strong>Max Usage:</strong> {{duplexLinkSelection ? duplexLink.selection.getUsage() : selection.getUsage() | percent:3}}

                        <!--
                        <div>
                            <strong>Capacity: </strong> {{duplexLinkSelection ? duplexLink.selection.capacity() : selection.capacity() | capacityUnits}}
                            <rzslider style="position:relative;left:1em;" class="custom-slider"
                            rz-slider-options="capacitySlider.options" rz-slider-model="capacitySlider.value"></rzslider>
                        </div>
                        -->

                        <hr>

                        <div ng-if="linkUsageChartLabels != null">
                            <h4><strong>Link Utilization Chart</strong></h4>
                            <canvas id="line" class="chart chart-line" height="250"
                            chart-data="linkUsageChartData" chart-labels="linkUsageChartLabels"
                            chart-options="linkUsageChartOptions" chart-series="linkUsageChartSeries"
                            chart-colors="linkUsageChartColors"></canvas>
                            <hr>
                        </div>
                    </div>

                    <div class="form-group form-group-style-tweaks">
                        <label class="label-style-tweaks" for="availableDemandsDropdown">
                            <h3><strong>{{demands.available.length}}
                            <span ng-if="singleNodeSelection">Node</span>
                            <span ng-if="duplexLinkSelection || singleLinkSelection">Link</span>
                            {{'Demand' | pluralize:demands.available.length}}: </strong></h3>
                        </label>
                        <select class="form-control single-select-style-tweaks"
                            name="availableDemandsDropdown" id="availableDemandsDropdown"
                            ng-options="demand.getPrettifiedName() for demand in demands.available"
                            ng-change="demandSelectionChange()" ng-model="demands.selection">
                            <option value="">Select a Demand</option>
                        </select>
                    </div>

                    <strong>ID: </strong>{{demands.selection.getId()}}<br>
                    <strong>From Node: </strong>{{demands.selection.fromNode().getPrettifiedName()}}<br>
                    <strong>To Node: </strong>{{demands.selection.toNode().getPrettifiedName()}}<br>
                    <strong>Satisfied: </strong>{{demands.selection.isSatisfied() | demandSatisfied}}<br>

                    <label class="label-style-tweaks" for="availableRoutesDropdown">
                        {{routes.available.length}} {{'Route' | pluralize:routes.available.length}}:
                    </label>
                    <select class="form-control single-select-style-tweaks"
                        name="availableRoutesDropdown" id="availableRoutesDropdown"
                        ng-options="route.linkIds() for route in routes.available"
                        ng-change="routeSelectionChange()" ng-model="routes.selection">
                        <option value="">Select a Route</option></select>

                    <div vane-demands-chart></div>
                </div>
                `
            ,
            link: function(scope, element, attrs){
                $timeout(function(){$rootScope.$broadcast("vane.updateSelections");}, 0);
            },
        };
    }]);
})()
