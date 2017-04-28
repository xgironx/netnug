(function(){
    angular.module("vane.elements")
    .directive("vaneEditTab", ['$rootScope', '$route', '$filter', '$timeout', 'highlighterService', 'selectionService', 'networkService',
        function($rootScope, $route, $filter, $timeout, highlighterService, selectionService, networkService) {
        return {
            template: `
                <style>
                [vane-edit-tab] {
                    padding: 1em;
                }

                [vane-edit-tab] .btn {
                    padding: 4px 6px;
                }

                [vane-edit-tab] .btn-sm {
                    padding: 2px 4px;
                }

                [vane-edit-tab] table, th, td {
                    border: 1px solid grey;
                    border-collapse: collapse;
                    padding: 5px;
                }

                [vane-edit-tab] th {
                    text-align: center;
                }

                [vane-edit-tab] td {
                    text-align: right;
                }

                [vane-edit-tab] table tr:nth-child(odd) {
                    background-color: #f2f2f2;
                }

                [vane-edit-tab] table tr:nth-child(even) {
                    background-color: #ffffff;
                }

                </style>

                <div ng-if="activeTab == 'edit'">

                    <!-- Nodes -->

                    <div ng-if="editView == 'nodes' || editView == 'all'">
                        <div class="form-group form-group-style-tweaks">
                            <label class="label-style-tweaks" for="availableNodes">
                                <h3><strong>{{nodes.available.length}} {{'Node' | pluralize:nodes.available.length}}:</strong></h3>
                            </label>
                            <select class="form-control multi-select-style-tweaks" data-ng-attr-size="{{nodesListSize}}"
                             name="availableNodes" id="availableNodes" multiple
                             ng-options="node.getPrettifiedName() for node in nodes.available"
                             ng-change="nodeSelectionChange()" ng-model="nodes.selection"></select>

                            <button ng-if="!addingNode && !editingNodes" class="btn btn-primary" ng-click="addNewNode()">Add</button>

                            <span ng-if="nodeSelection && !addingNode && !editingNodes">
                                <button class="btn btn-warning" ng-click="editSelectedNodes()">Edit</button>
                                <button class="btn btn-danger" ng-click="deleteSelectedNodes()">Delete</button>
                                <button ng-if="allSelectedNodesDisabled" class="btn btn-success" ng-click="enableSelectedNodes()">Enable</button>
                                <button ng-if="allSelectedNodesEnabled" class="btn btn-warning" ng-click="disableSelectedNodes()">Disable</button>
                                <div class="btn-group btn-group" ng-if="multiNodeSelection && !allSelectedNodesEnabled && !allSelectedNodesDisabled">
                                  <button class="btn btn-success" ng-click="enableSelectedNodes()">Enable</button>
                                  <button class="btn btn-warning" ng-click="disableSelectedNodes()">Disable</button>
                                </div>
                            </span>

                            <button ng-if="editingNodes" class="btn btn-primary" ng-click="saveNodeEdits()">Save</button>
                            <button ng-if="editingNodes" class="btn btn-secondary" ng-click="cancelNodeEdits()">Cancel</button>
                        </div>

                        <div ng-if="addingNode">
                            <hr>
                            <h4><strong>New Node Settings</strong></h4>
                            <div class="inline-flex-container">
                                <label class="label-style-tweaks" for="newNodeName">Name:&nbsp;</label>
                                <a href='#' id="newNodeName" editable-text="newNode.name">{{newNode.name || 'Set Name'}}</a>
                            </div>

                            <div class="inline-flex-container">
                                <strong>Latitude:&nbsp;</strong>
                                <span ng-if="!newNode.latLng" style="font-style: italic; color: #dd1144">Click Map to Set Location</span>{{newNode.lat.toFixed(2)}}
                            </div>
                            <div class="inline-flex-container">
                                <strong>Longitude:&nbsp;</strong>
                                <span ng-if="!newNode.latLng" style="font-style: italic; color: #dd1144">Click Map to Set Location</span>{{newNode.lng.toFixed(2)}}
                            </div>

                            <div class="inline-flex-container" style="margin-bottom: 10px">
                                <label class="label-style-tweaks" for="newNodeEquipment">Equipment:&nbsp;</label>
                                 <a href='#' id="newNodeEquipment" editable-select="newNode.equipment"
                                 e-ng-options="equipment for equipment in nodes.equipment">
                                 {{newNode.equipment || 'Select Node Equipment'}}</a>
                            </div>

                            <button ng-if="newNode.name && newNode.latLng && newNode.equipment"
                             class="btn btn-primary" ng-click="addNode()">Add</button>

                            <button class="btn btn-warning" ng-click="cancelAddNode()">Cancel</button>
                        </div>

                        <div ng-if="editingNodes">
                            <hr>
                            <h4><strong>Edit Node Properties</strong></h4>
                            <div ng-if="singleNodeSelection" class="inline-flex-container">
                                <label class="label-style-tweaks" for="editNodeName">Name:&nbsp;</label>
                                <a href='#' id="editNodeName" editable-text="nodes.edits.name">{{nodes.edits.name || 'Set Name'}}</a>
                            </div>

                            <div ng-if="singleNodeSelection" class="inline-flex-container">
                                <strong>Latitude:&nbsp;</strong>{{nodes.edits.lat.toFixed(2)}}
                            </div>
                            <div ng-if="singleNodeSelection" class="inline-flex-container">
                                <strong>Longitude:&nbsp;</strong>{{nodes.edits.lng.toFixed(2)}}
                            </div>

                            <div class="inline-flex-container" style="margin-bottom: 10px">
                                <label class="label-style-tweaks" for="editNodeEquipment">Equipment:&nbsp;</label>
                                 <a href='#' id="editNodeEquipment" editable-select="nodes.edits.equipment"
                                 e-ng-options="equipment for equipment in nodes.equipment">
                                 {{nodes.edits.equipment || 'Edit Node Equipment'}}</a>
                            </div>

                        </div>

                    </div>

                    <!-- Links -->

                    <div ng-if="editView == 'links' || editView == 'all'">

                        <div ng-if="editView == 'all'">
                            <hr>
                        </div>

                        <div class="form-group form-group-style-tweaks">
                            <label class="label-style-tweaks" for="availableLinks">
                                <h3><strong>{{links.available.length}} {{'Link' | pluralize:links.available.length}}:</strong></h3>
                            </label>
                            <select class="form-control multi-select-style-tweaks" data-ng-attr-size="{{linksListSize}}"
                             name="availableLinks" id="availableLinks" multiple
                             ng-options="link.getPrettifiedName() for link in links.available"
                             ng-change="linkSelectionChange()" ng-model="links.selection"></select>

                            <button ng-if="!addingLink && !editingLinks" class="btn btn-primary" ng-click="addNewLink()">Add</button>

                            <span ng-if="linkSelection && !addingLink && !editingLinks">
                                <button class="btn btn-warning" ng-click="editSelectedLinks()">Edit</button>
                                <button class="btn btn-danger" ng-click="deleteSelectedLinks()">Delete</button>
                                <button ng-if="allSelectedLinksDisabled" class="btn btn-success" ng-click="enableSelectedLinks()">Enable</button>
                                <button ng-if="allSelectedLinksEnabled" class="btn btn-warning" ng-click="disableSelectedLinks()">Disable</button>
                                <div class="btn-group btn-group" ng-if="multiLinkSelection && !allSelectedLinksEnabled && !allSselectedLinksDisabled">
                                  <button class="btn btn-success" ng-click="enableSelectedLinks()">Enable</button>
                                  <button class="btn btn-warning" ng-click="disableSelectedLinks()">Disable</button>
                                </div>
                            </span>

                            <button ng-if="editingLinks" class="btn btn-primary" ng-click="saveLinkEdits()">Save</button>
                            <button ng-if="editingLinks" class="btn btn-secondary" ng-click="cancelLinkEdits()">Cancel</button>
                        </div>

                        <div ng-if="duplexLinkSelection" class="form-group form-group-style-tweaks">
                            <div class="inline-flex-container">
                                <label class="label-style-tweaks" for="duplexLinkDirectionDropdown">Direction:&nbsp;</label>
                                <select class="form-control single-select-style-tweaks"
                                name="duplexLinkDirectionDropdown" id="duplexLinkDirectionDropdown"
                                ng-options="link.direction() for link in duplexLink.links"
                                ng-change="duplexLinkSelectionChange()" ng-model="duplexLink.selection"></select>
                            </div>
                        </div>

                        <div ng-if="linkSelection">
                            <hr>
                            <strong>Capacity: </strong> {{duplexLinkSelection ? duplexLink.selection.capacity() : selection.capacity() | capacityUnits}}
                            <rzslider style="position:relative;left:1em;" class="custom-slider"
                            rz-slider-options="capacitySlider.options" rz-slider-model="capacitySlider.value"></rzslider>
                        </div>

                        <div ng-if="linkUsageChartLabels != null">
                            <hr>
                            <h4><strong>Link Utilization Chart</strong></h4>
                            <canvas id="line" class="chart chart-line" height="250"
                            chart-data="linkUsageChartData" chart-labels="linkUsageChartLabels"
                            chart-options="linkUsageChartOptions" chart-series="linkUsageChartSeries"
                            chart-colors="linkUsageChartColors"></canvas>
                            <hr>
                        </div>

                        <div ng-if="addingLink">
                            <hr>
                            <h4><strong>New Link Settings</strong></h4>

                            <div class="form-group form-group-style-tweaks">
                                <label class="label-style-tweaks" for="fromNodeDropdown">From&nbsp;Node: &nbsp;</label>
                                <select class="form-control single-select-style-tweaks" name="fromNodeDropdown" id="fromNodeDropdown"
                                ng-options="node.getPrettifiedName() for node in fromNodes"
                                ng-change="fromNodeSelectionChange()" ng-model="newLink.fromNode">
                                <option value="">Select From Node</option></select>
                            </div>

                            <!--
                            <div class="inline-flex-container">
                                <label class="label-style-tweaks" for="fromNodeDropdown">From Node: &nbsp;</label>
                                 <a href='#' id="fromNodeDropdown" editable-select="newLink.fromNode"
                                 e-ng-options="node.getPrettifiedName() for node in fromNodes"
                                 e-ng-change="fromNodeSelectionChange()">
                                 {{newLink.fromNode.getPrettifiedName() || 'Select From Node'}}</a>
                            </div>
                            -->

                            <div class="form-group form-group-style-tweaks">
                                <label class="label-style-tweaks" for="toNodeDropdown">To&nbsp;Node: &nbsp;</label>
                                <select class="form-control single-select-style-tweaks" name="toNodeDropdown" id="toNodeDropdown"
                                ng-options="node.getPrettifiedName() for node in toNodes"
                                ng-change="toNodeSelectionChange()" ng-model="newLink.toNode">
                                <option value="">Select To Node</option></select>
                            </div>

                            <!--
                            <div class="inline-flex-container">
                                <label class="label-style-tweaks" for="toNodeDropdown">To Node: &nbsp;</label>
                                 <a href='#' id="toNodeDropdown" editable-select="newLink.toNode"
                                 e-ng-options="node.getPrettifiedName() for node in toNodes"
                                 onbeforesave="toNodeSelectionChange()">
                                 {{newLink.toNode.getPrettifiedName() || 'Select To Node'}}</a>
                            </div>
                            -->

                            <div class="inline-flex-container" style="margin-bottom: 10px;">
                                <label class="label-style-tweaks" for="newLinkModel">Model: &nbsp;</label>
                                <a href='#' id="newLinkModel" editable-select="newLink.model"
                                 e-ng-options="model.name for model in links.models">
                                {{newLink.model.name || 'Select Link Model'}}</a>
                            </div>

                            <div class="inline-flex-container" style="margin-bottom: 10px;">
                                <label class="label-style-tweaks">Duplex:
                                    <input type="checkbox" ng-model="newLink.duplex">
                                </label>
                            </div>

                            <button ng-if="newLink.fromNode && newLink.toNode && newLink.model"
                             class="btn btn-primary" ng-click="addLink()">Add</button>
                            <button class="btn btn-warning" ng-click="cancelAddLink()">Cancel</button>
                        </div>
                    </div>

                    <!-- Demands -->

                    <div ng-if="editView == 'demands' || editView == 'all'">

                        <div ng-if="editView == 'all'">
                            <hr>
                        </div>

                        <div class="form-group form-group-style-tweaks">
                            <label class="label-style-tweaks" for="availableDemands">
                                <h3><strong>{{demands.available.length}} {{'Demand' | pluralize:demands.available.length}}:</strong></h3>
                            </label>
                            <select multiple class="form-control multi-select-style-tweaks" data-ng-attr-size="{{demandsListSize}}"
                             name="availableDemands" id="availableDemands"
                             ng-options="demand.getPrettifiedName() for demand in demands.available"
                             ng-change="demandSelectionChange()" ng-model="demands.selection"></select>

                            <button ng-if="!addingDemand && !editingDemands" class="btn btn-primary" ng-click="addNewDemand()">Add</button>

                            <span ng-if="demandSelection && !addingDemand && !editingDemands">
                                <button class="btn btn-warning" ng-click="editSelectedDemands()">Edit</button>
                                <button class="btn btn-danger" ng-click="deleteSelectedDemands()">Delete</button>
                                <button ng-if="allSelectedDemandsDisabled" class="btn btn-success" ng-click="enableSelectedDemands()">Enable</button>
                                <button ng-if="allSelectedDemandsEnabled" class="btn btn-warning" ng-click="disableSelectedDemands()">Disable</button>
                                <div class="btn-group btn-group" ng-if="multiDemandSelection && !allSelectedDemandsEnabled && !allSselectedDemandsDisabled">
                                  <button class="btn btn-success" ng-click="enableSelectedDemands()">Enable</button>
                                  <button class="btn btn-warning" ng-click="disableSelectedDemands()">Disable</button>
                                </div>
                            </span>

                            <button ng-if="editingDemands" class="btn btn-primary" ng-click="saveDemandEdits()">Save</button>
                            <button ng-if="editingDemands" class="btn btn-secondary" ng-click="cancelDemandEdits()">Cancel</button>

                        </div>

                        <div ng-if="addingDemand">
                            <hr>
                            <h4><strong>New Demand Settings</strong></h4>

                            <div class="form-group form-group-style-tweaks">
                                <label class="label-style-tweaks" for="fromNodeDropdown">From Node: &nbsp;</label>
                                <select class="form-control single-select-style-tweaks" name="fromNodeDropdown" id="fromNodeDropdown"
                                ng-options="node.getPrettifiedName() for node in fromNodes"
                                ng-change="fromNodeSelectionChange()" ng-model="newDemand.fromNode">
                                <option value="">Select From Node</option></select>
                            </div>

                            <div class="form-group form-group-style-tweaks">
                                <label class="label-style-tweaks" for="toNodeDropdown">To Node: &nbsp;</label>
                                <select class="form-control single-select-style-tweaks" name="toNodeDropdown" id="toNodeDropdown"
                                ng-options="node.getPrettifiedName() for node in toNodes"
                                ng-change="toNodeSelectionChange()" ng-model="newDemand.toNode">
                                <option value="">Select To Node</option></select>
                            </div>

                            <div class="inline-flex-container">
                                <label class="label-style-tweaks" for="trafficProfileFunction">Traffic Profile:&nbsp;</label>
                                 <a href='#' id="trafficProfileFunction" editable-select="newDemand.trafficProfileParameters.function"
                                 e-ng-options="function for function in newDemand.trafficProfileParameters.functions">
                                 {{newDemand.trafficProfileParameters.function || 'Select Traffic Profile'}}</a>
                            </div>

                            <div ng-if="newDemand.trafficProfileParameters.function">
                                <form>
                                    <div class="inline-flex-container">
                                        <label class="label-style-tweaks" for="timeStep">Time&nbsp;Step:&nbsp;</label>
                                        <input class="form-control" style="line-height: 1.0;" type="text" name="timeStep" id="timeStep"
                                        ng-model="newDemand.trafficProfileParameters.timeStep"
                                        placeholder="{{newDemand.trafficProfileParameters.timeStepPlaceholder}}" />
                                    </div>

                                    <div class="inline-flex-container">
                                        <label class="label-style-tweaks" for="startTime">Start&nbsp;Time:&nbsp;</label>
                                        <input class="form-control" style="line-height: 1.0;" type="text" name="startTime" id="startTime"
                                        ng-model="newDemand.trafficProfileParameters.startTime"
                                        placeholder="{{newDemand.trafficProfileParameters.startTimePlaceholder}}" />
                                    </div>

                                    <div class="inline-flex-container">
                                        <label class="label-style-tweaks" for="endTime">End&nbsp;Time:&nbsp;</label>
                                        <input class="form-control" style="line-height: 1.0;" type="text" name="endTime" id="endTime"
                                        ng-model="newDemand.trafficProfileParameters.endTime"
                                        placeholder="{{newDemand.trafficProfileParameters.endTimePlaceholder}}" />
                                    </div>

                                    <div ng-if="newDemand.trafficProfileParameters.function == 'Constant'" class="inline-flex-container">
                                        <label class="label-style-tweaks" for="constantTrafficAmount">Constant&nbsp;Traffic&nbsp;Amount:&nbsp;</label>
                                        <input class="form-control" style="line-height: 1.0;" type="text"
                                        name="constantTrafficAmount" id="constantTrafficAmount"
                                        ng-model="newDemand.trafficProfileParameters.constantTrafficAmount"
                                        placeholder="{{newDemand.trafficProfileParameters.constantTrafficAmount}}" />
                                    </div>

                                    <div ng-if="newDemand.trafficProfileParameters.function == 'Random'">

                                        <div class="inline-flex-container">
                                            <label class="label-style-tweaks" for="minTrafficAmount">Minimum&nbsp;Traffic:&nbsp;</label>
                                            <input class="form-control" style="line-height: 1.0;" type="text" name="minTrafficAmount" id="minTrafficAmount"
                                            ng-model="newDemand.trafficProfileParameters.minTrafficAmount"
                                            placeholder="{{newDemand.trafficProfileParameters.minTrafficAmountPlaceholder}}" />
                                        </div>

                                        <div class="inline-flex-container">
                                            <label class="label-style-tweaks" for="maxTrafficAmount">Maximum&nbsp;Traffic:&nbsp;</label>
                                            <input class="form-control" style="line-height: 1.0;" type="text" name="maxTrafficAmount" id="maxTrafficAmount"
                                            ng-model="newDemand.trafficProfileParameters.maxTrafficAmount"
                                            placeholder="{{newDemand.trafficProfileParameters.maxTrafficAmountPlaceholder}}" />
                                        </div>

                                    </div>

                                    <div ng-if="newDemand.trafficProfileParameters.function == 'Parametric'">

                                    </div>

                                    <div ng-if="newDemand.trafficProfileParameters.function == 'Custom'">

                                    </div>

                                </form>

                            </div>


                            <button ng-if="newDemand.fromNode != null && newDemand.toNode != null &&
                                           isNumeric(newDemand.trafficProfileParameters.timeStep) &&
                                           isNumeric(newDemand.trafficProfileParameters.startTime) &&
                                           isNumeric(newDemand.trafficProfileParameters.endTime) &&
                                           ((newDemand.trafficProfileParameters.function == 'Constant' && isNumeric(newDemand.trafficProfileParameters.constantTrafficAmount)) ||
                                            (newDemand.trafficProfileParameters.function == 'Random' && isNumeric(newDemand.trafficProfileParameters.minTrafficAmount) && isNumeric(newDemand.trafficProfileParameters.maxTrafficAmount)) ||
                                            (newDemand.trafficProfileParameters.function == 'Parametric') ||
                                            (newDemand.trafficProfileParameters.function == 'Custom'))"
                             class="btn btn-primary" ng-click="addDemand()">Add</button>

                            <button class="btn btn-warning" ng-click="cancelAddDemand()">Cancel</button>

                        </div>

                        <div ng-if="editingDemands">
                            <hr>
                            <h4><strong>Edit Traffic Profile</strong></h4>

                            <div class="inline-flex-container" style="margin-bottom: 10px;">
                                <label class="label-style-tweaks" for="multiplier">Multiplier:&nbsp;</label>
                                <input class="form-control" style="line-height: 1.0; margin-right: 5px;" type="text" name="multiplier" id="multiplier"
                                ng-model="demands.edits.multiplier" placeholder="{{demands.edits.multiplierPlaceholder}}" />
                                <input ng-if="isNumeric(demands.edits.multiplier)" type="button" class="btn btn-primary btn-sm"
                                 ng-click="applyMultiplier()" value="Apply" />
                            </div>

                            <div style="display: flex;">
                                <table ng-if="singleDemandSelection" style="margin-left: auto; margin-right: auto">
                                    <tr>
                                        <th><strong>Time (seconds)</strong></th>
                                        <th><strong>Amount (bits/s)</strong></th>
                                        <th><strong>Edit</strong></th>
                                    </tr>
                                    <tr ng-repeat="profile in demandTrafficProfile">
                                        <td>
                                            <span editable-text="profile.time" e-name="time" e-form="rowform">
                                                {{profile.time}}
                                            </span>
                                        </td>
                                        <td>
                                            <span editable-text="profile.amount" e-name="amount" e-form="rowform">
                                                {{profile.amount}}
                                            </span>
                                        </td>

                                        <td style="white-space: nowrap">
                                            <!-- form -->
                                            <form editable-form name="rowform" onaftersave="saveTrafficProfileEdits()" ng-show="rowform.$visible" class="form-buttons form-inline" shown="inserted == profile">
                                                <button type="submit" ng-disabled="rowform.$waiting" class="btn btn-primary btn-sm">
                                                    save
                                                </button>
                                                <button type="button" ng-disabled="rowform.$waiting" ng-click="rowform.$cancel()" class="btn btn-default btn-sm">
                                                    cancel
                                                </button>
                                            </form>

                                            <div class="buttons" ng-show="!rowform.$visible">
                                                <button type="button" class="btn btn-primary btn-sm" ng-click="rowform.$show()">edit</button>
                                                <!-- <button type="button" class="btn btn-danger btn-sm" ng-click="deleteTrafficProfileRow($index)">del</button> -->
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div ng-if="demandSelection && !addingDemand && !editingDemands">
                            <hr>
                            <div class="form-group form-group-style-tweaks">
                                <label class="label-style-tweaks-txt-lg" for="availableRoutesDropdown">
                                    {{routes.available.length}} {{'Route' | pluralize:routes.available.length}}:
                                </label>
                                <select multiple class="form-control multi-select-style-tweaks"
                                    name="availableRoutesDropdown" id="availableRoutesDropdown"
                                    data-ng-attr-size="{{routesListSize}}"
                                    ng-options="route.linkIds() for route in routes.available"
                                    ng-change="routeSelectionChange()" ng-model="routes.selection">
                                </select>
                            </div>

                            <hr>
                            <div ng-if="activeView == 'map'" vane-demands-chart></div>
                        </div>
                    </div>

                </div>
                `
            ,
            link: function(scope, element, attrs) {
                // scope.activeView = $route.current.activeView;
                // console.log("scope.activeView: ", scope.activeView);
                $timeout(function(){$rootScope.$broadcast("vane.updateSelections");}, 0);
            },
        };
    }]);
})()
