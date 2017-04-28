(function(){
    angular.module("vane.elements")
    .directive("vaneOptionsTab", ['$rootScope', '$route', '$filter', '$timeout', 'networkService', 'Node', 'Link', 'Demand',
        function($rootScope, $route, $filter, $timeout, networkService, Node, Link, Demand) {
        return {
            template: `
                <style>
                [vane-options-tab] {
                padding: 1em;
                }
                </style>

                <h3><strong>General Options</strong></h3><br>

                <div>
                    <strong>Selection Outline Color: </strong>
                    <select name="selectionColorDropdown" id="selectionColorDropdown"
                    ng-model="selectionColorSelection"
                    ng-options="color.name for color in selectionColorOptions"
                    ng-change="selectionColorChange()"></select><br>

                    <!-- <color-picker></color-picker> -->
                </div>

                <hr>

                <h3><strong>Modeler Options</strong></h3><br>

                <div>
                    <label><strong>Auto-Analyze: </strong></label>
                    <input type="checkbox" ng-model="autoAnalyze" name="AutoAnalyze"
                     [ng-true-value=""] [ng-false-value=""] ng-change="toggleAutoAnalyze()"><br>

                    <label for="legendDropdown"><strong>Legend: </strong></label>
                    <select name="legendDropdown" id="legendDropdown"
                    ng-model="legendDropdownSelection"
                    ng-options="legend for legend in legendDropdownOptions"
                    ng-change="legendOptionChange()"></select><br>

                    <label for="protocolDropdown"> <strong>Routing Protocol: </strong></label>
                    <select name="protocolDropdown" id="protocolDropdown" ng-model="protocolSelection"
                    ng-options="protocol.type for protocol in protocols"
                    ng-change="protocolSelectionChange()"></select>
                </div>

                <!--

                <hr>

                <h3><strong>Visualization Options</strong></h3><br>

                <div>
                <label for="duplexLinkStyleDropdown"><strong>Duplex Link Style: </strong></label>
                <select name="duplexLinkStyleDropdown" id="duplexLinkStyleDropdown"
                ng-model="duplexLinkStyleSelection"
                ng-options="style for style in duplexLinkStyleOptions"
                ng-change="duplexLinkStyleChange()"></select><br>
                </div>

                -->

                <!--

                <hr>

                <h4><strong>Traffic Flow Animation Settings</strong></h4>
                <div>

                -->

                <!--
                <label for="trafficAnimationSpeedDropdown">Animation Speed: </label>
                <select name="trafficAnimationSpeedDropdown" id="trafficAnimationSpeedDropdown"
                ng-model="trafficAnimationSpeedSelection"
                ng-options="speed for speed in trafficAnimationSpeedOptions"
                ng-change="trafficAnimationSpeedSelectionChange()"></select><br>
                -->

                <!--
                <label for="trafficMarkerDropdown">Marker Symbol: </label>
                <select name="trafficMarkerDropdown" id="trafficMarkerDropdown"
                ng-model="trafficMarkerSelection"
                ng-options="trafficMarker.shape for trafficMarker in trafficMarkerOptions"
                ng-change="trafficMarkerSelectionChange()"></select><br>
                -->

                <!--
                <label for="trafficMarkerColorDropdown">Marker Color: </label>
                <select name="trafficMarkerColorDropdown" id="trafficMarkerColorDropdown"
                ng-model="trafficMarkerColorSelection"
                ng-options="trafficMarkerColor.color for trafficMarkerColor in trafficMarkerColorOptions"
                ng-change="trafficMarkerColorSelectionChange()"></select><br>
                -->

                <!--
                <label for="trafficMarkerSizeDropdown">Marker Size: </label>
                <select name="trafficMarkerSizeDropdown" id="trafficMarkerSizeDropdown"
                ng-model="trafficMarkerSizeSelection"
                ng-options="size for size in trafficMarkerSizeOptions"
                ng-change="trafficMarkerSizeSelectionChange()"></select><br>
                -->

                <!--
                <label for="trafficMarkerSpacingDropdown">Marker Spacing: </label>
                <select name="trafficMarkerSpacingDropdown" id="trafficMarkerSpacingDropdown"
                ng-model="trafficMarkerSpacingSelection"
                ng-options="spacing for spacing in trafficMarkerSpacingOptions"
                ng-change="trafficMarkerSpacingSelectionChange()"></select><br>
                -->

                </div>
                `,
            link: function(scope, element, attrs) {

                scope.activeView = $route.current.activeView

                // scope.visualOptions = {
                //  trafficMarkerColorOptions:
                // }

                scope.selectionColorOptions = [
                    {name: 'Default', hex: '#3388ff'},
                    {name: 'Black', hex: '#000000'},
                    {name: 'Red', hex: '#ff0000'},
                    {name: 'Orange', hex: '#ffaa00'},
                    {name: 'Yellow', hex: '#ffee00'},
                    {name: 'Green', hex: '#15ff00'},
                    {name: 'Blue', hex: '#0061ff'},
                    {name: 'Pink', hex: '#ff00cb'}
                ];
                scope.selectionColorSelection = scope.selectionColorOptions[0];
                scope.selectionColorChange = function() {
                    try {
                        let network = networkService.network();
                        let newColor = scope.selectionColorSelection.hex;

                        for (let node of network.nodes()) {
                            node._highlighter.setStyle({color: newColor});
                            node._highlighter._update();
                        }

                        for (let link of network.links()) {
                            link._highlighter.setStyle({color: newColor});
                            link._highlighter._update();
                        }

                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.protocols = [{type: 'OSPF'},
                                   {type: 'RIP'},
                                   {type: 'BGP'}];
                scope.protocolSelection = scope.protocols[0];

                //Watch for protocol dropdown changes
                scope.protocolSelectionChange = function(){
                  //logic for changing routing protocol goes here
                };

                scope.autoAnalyze = $rootScope.autoAnalyze;
                scope.toggleAutoAnalyze = function() {
                  $rootScope.$broadcast("vane.toggleAutoAnalyze");
                };

                // scope.duplexLinkStyleOptions = ['Default', 'OPNET'];
                scope.duplexLinkStyleOptions = ['Default'];
                scope.duplexLinkStyleSelection = scope.duplexLinkStyleOptions[0];
                scope.duplexLinkStyleChange = function() {
                    let duplexLinkStyle = scope.duplexLinkStyleSelection;
                    try {
                        network = networkService.network();
                        networkLinks = network.links();
                        for (let link of networkLinks) {
                            link._trafficFlow.setStyle({duplexLinkStyle: duplexLinkStyle});
                        }
                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.trafficMarkerColorOptions = [
                    {color: 'Black', hex: '#000'},
                    {color: 'White', hex: '#fff'},
                    {color: 'Red', hex: '#ff0000'},
                    {color: 'Orange', hex: '#ffaa00'},
                    {color: 'Yellow', hex: '#ffee00'},
                    {color: 'Green', hex: '#15ff00'},
                    {color: 'Blue', hex: '#0061ff'},
                    {color: 'Pink', hex: '#ff00cb'}
                ];
                scope.trafficMarkerColorSelection = scope.trafficMarkerColorOptions[0];

                scope.trafficMarkerOptions = [
                    {shape: 'Circle'},
                    {shape: 'Dash'},
                    {shape: 'None'}
                ];
                scope.trafficMarkerSelection = scope.trafficMarkerOptions[0];

                scope.legendDropdownOptions = ['ICITE'];
                scope.legendDropdownSelection = scope.legendDropdownOptions[0];

                scope.trafficAnimationSpeedOptions = [];
                scope.trafficMarkerSizeOptions = [];
                scope.trafficMarkerSpacingOptions = [];
                for (var i=0; i < 11; i++) {
                    scope.trafficAnimationSpeedOptions.push(2 * i);
                    scope.trafficMarkerSizeOptions.push(i);
                    scope.trafficMarkerSpacingOptions.push(5 * i);
                }
                scope.trafficAnimationSpeedSelection = scope.trafficAnimationSpeedOptions[0];
                scope.trafficMarkerSizeSelection = scope.trafficMarkerSizeOptions[0];
                scope.trafficMarkerSpacingSelection = scope.trafficMarkerSpacingOptions[0];

                scope.trafficMarkerColorSelectionChange = function() {
                    let trafficMarkerColorSelection = scope.trafficMarkerColorSelection;
                    try {
                        network = networkService.network();
                        networkLinks = network.links();
                        for (let link of networkLinks) {
                            link._trafficFlow.setStyle({color: trafficMarkerColorSelection.hex});
                        }
                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.trafficMarkerSelectionChange = function() {
                    let trafficMarkerSelection = scope.trafficMarkerSelection;
                    try {
                        network = networkService.network();
                        networkLinks = network.links();
                        // for (let link of networkLinks) {
                        // link._trafficFlow.setStyle({color: trafficMarkerColorSelection.hex});
                        // }
                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.trafficAnimationSpeedSelectionChange = function() {
                    let trafficAnimationSpeedSelection = scope.trafficAnimationSpeedSelection;
                    try {
                        network = networkService.network();
                        networkLinks = network.links();
                        for (let link of networkLinks) {
                            link._trafficFlow.setStyle({speed: trafficAnimationSpeedSelection});
                        }
                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.trafficMarkerSizeChange = function() {
                    let trafficMarkerSizeSelection = scope.trafficMarkerSizeSelection;
                    try {
                        network = networkService.network();
                        networkLinks = network.links();
                        for (let link of networkLinks) {
                            link._trafficFlow.setStyle({weight: trafficMarkerSizeSelection});
                        }
                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.trafficMarkerSpacingChange = function() {
                    let trafficMarkerSpacingSelection = scope.trafficMarkerSpacingSelection;
                    try {
                        network = networkService.network();
                        networkLinks = network.links();
                        for (let link of networkLinks) {
                            link._trafficFlow.setStyle({spacing: trafficMarkerSpacingSelection});
                        }
                    } catch (e) {
                        console.log(e);
                    }
                };

                scope.legendSelectionChange = function() {
                    let legendSelection = scope.legendDropdownSelection;
                };

            },
        };
    }]);
})()
