(function(){
    angular.module("vane.pages").controller("NetworkStudyController", ['$scope', '$route', '$rootScope', '$filter',
    '$timeout', '$location', 'networkService', 'selectionService', function($scope, $route, $rootScope, $filter, $timeout, $location, networkService, selectionService) {

        $rootScope.$broadcast("vane.updateStatus", "Select study and follow prompts...", null, 'success');

        $scope.studyData = {};

        $scope.updateStudyData = function() {

        };

        $scope.isNumeric = function(val) {
            var type = typeof val;
            return (type === "number" || type === "string") && !isNaN(val - parseFloat(val));
        };

        $scope.toggleAccordion = function(accordionName) {
            console.log("toggleAccordion: " + accordionName);
            switch (accordionName) {
                case 'demandStudyTypeSelection':
                    $scope.demandStudy.studyType.accordionContentVisible =
                        !$scope.demandStudy.studyType.accordionContentVisible;
                    break;
                case 'demandStudyDemandSelection':
                    $scope.demandStudy.demandSelection.accordionContentVisible =
                        !$scope.demandStudy.demandSelection.accordionContentVisible;
                    break;
                case 'demandStudyParameters':
                    $scope.demandStudy.parameters.accordionContentVisible =
                        !$scope.demandStudy.parameters.accordionContentVisible;
                    break;
                case 'demandStudyTerminationConditions':
                    $scope.demandStudy.terminationConditions.accordionContentVisible =
                        !$scope.demandStudy.terminationConditions.accordionContentVisible;
                    break;
                case 'demandStudyOutputOptions':
                    $scope.demandStudy.outputOptions.accordionContentVisible =
                        !$scope.demandStudy.outputOptions.accordionContentVisible;
                    break;
            }
        };

        // $scope.toggleCheckbox = function(obj, array) {
        //     var idx = array.indexOf(obj);
        //     if (idx > -1) {
        //         array.splice(idx, 1);
        //     } else {
        //         array.push(obj);
        //     }
        // };

        $scope.toggleCheckbox = function(obj, array) {
            obj.isChecked = !obj.isChecked;
            var idx = array.indexOf(obj);
            if (idx > -1) {
                array.splice(idx, 1);
            } else {
                array.push(obj);
            }
        };

        $scope.exists = function(obj, array) {
            return array.indexOf(obj) > -1;
        };

        $scope.isValidInput = function(array, predicate) {
            return $filter('allTrue')(array, function(obj) {
                return predicate(obj.value);
                // if (expectedType == 'numeric') {
                //     return $filter('isNumeric')(obj.value);
                // } else {
                //     return false;
                // }
                // if (typeof expression === "object") {
                //     for (let property of expression) {
                //         if (!obj.hasOwnProperty(property) || obj[property] != e)
                //     }
                // }
            });
        };

        $scope.outputFormatOptions = {
            available: [
                {label: 'CSV', value: 'csv', isChecked: false, isDisabled: true},
                {label: 'Excel', value: 'xlsx', isChecked: false, isDisabled: true},
                {label: 'JSON', value: 'json', isChecked: false},
                {label: 'PDF', value: 'pdf', isChecked: false, isDisabled: true},
            ],
            selected: [],
        };

        $scope.demandStudy = {
            accordionContentVisible: false,
            studyType: {
                accordionContentVisible: false,
                types: [
                    {label: 'Demand Failure'},
                    {label: 'Demand Study X', isDisabled: true},
                    {label: 'Demand Study Y', isDisabled: true},
                    {label: 'Demand Study Z', isDisabled: true},
                ],
                selected: null,
            },
            demandSelection: {
                accordionContentVisible: false,
                availableDemands: null,
                selectedDemands: null,
            },
            parameters: {
                accordionContentVisible: false,
                selected: [],
            },
            terminationConditions: {
                accordionContentVisible: false,
                selected: [],
            },
            outputOptions: {
                accordionContentVisible: false,
                selected: [],
            },
        };

        $scope.demandFailureStudy = {
            trafficParameters: {
                available: [
                    {label: 'Contant Amount (bits/second)', key: 'constant', value: null, placeholder: 'Enter traffic amount (bits/second)'},
                    {label: 'Percent of Peak Traffic (%)', key: 'percent', value: null, placeholder: 'Enter percent of maximum initial traffic (%)'},
                ],
                selected: null,
                finalize: function() {
                    $scope.demandFailureStudy.trafficParameters.selected.value =
                        parseFloat($scope.demandFailureStudy.trafficParameters.selected.value);
                },
            },
            terminationConditions: {
                available: [
                    {isChecked: false, label: 'Maximum Iteration Steps', key: 'maxSteps', value: null, placeholder: 'Enter maximum iteration steps'},
                    {isChecked: false, label: 'Maximum Failed Demands', key: 'maxFailed', value: null, placeholder: 'Enter maximum failed demands'},
                    {isChecked: false, label: 'Condition X', isDisabled: true},
                    {isChecked: false, label: 'Condition Y', isDisabled: true},
                    {isChecked: false, label: 'Condition Z', isDisabled: true},
                ],
                selected: [],
                finalize: function() {
                    let selected = $scope.demandFailureStudy.terminationConditions.selected;
                    for (var i=0; i < selected.length; i++) {
                        selected[i] = {[selected[i].key]: parseFloat(selected[i].value)};
                    }
                    console.log('selected: ', selected);
                },
            },
            outputOptions: {
                available: [
                    {isChecked: true, label: 'Demand Name', value: 'name', isDisabled: true},
                    {isChecked: true, label: 'Demand ID', value: 'id', isDisabled: true},
                    {isChecked: true, label: 'Demand Status', value: 'status', isDisabled: true},
                ],
                selected: ['name', 'id', 'status'],
            },
            finalize: function() {
                $scope.demandFailureStudy.trafficParameters.finalize();
                $scope.demandFailureStudy.terminationConditions.finalize();
            },
        };

        $scope.demandSelectionChange = function() {
            console.log($scope.demandStudy.demandSelection.selectedDemands.length + " demands selected.");
            let selectedDemands = selectionService.selectedDemands($scope.demandStudy.demandSelection.selectedDemands);
            let demandIds = [];
            for (let demand of selectedDemands) {
                demandIds.push(demand.getId());
            }
            $scope.studyData.demands = demandIds;
        };

        function getKeyValuePairsArray(arrayOfObjects) {
            let arrayOfKeyValuePairs = [];
            for (let obj of arrayOfObjects) {
                arrayOfKeyValuePairs.push({[obj.key]: obj.value});
            }
            return arrayOfKeyValuePairs;
        }

        $scope.runStudy = function(studyName) {
            console.log('running network ' + studyName + ' study...');

            switch (studyName) {
                case 'demand':
                    let studyType = $scope.demandStudy.studyType.selected;
                    $scope.studyData.studyType = studyType;

                    switch (studyType) {
                        case 'Demand Failure':
                            $scope.demandFailureStudy.finalize();
                            // $scope.studyData.increaseTrafficBy = $scope.demandFailureStudy.increaseTrafficBy;
                            // let trafficAmount = $scope.demandFailureStudy.trafficAmount;
                            // let initialTrafficPercentMax = $scope.demandFailureStudy.initialTrafficPercentMax;
                            // $scope.studyData.trafficAmount = trafficAmount != null ? parseFloat(trafficAmount) : null;
                            // $scope.studyData.initialTrafficPercentMax = initialTrafficPercentMax != null ? parseFloat(initialTrafficPercentMax) : null;

                            // let terminationConditions = [];
                            // for (let condition of $scope.demandFailureStudy.terminationConditions.selected) {
                            //     for (let option of $scope.demandFailureStudy.terminationConditions.available) {
                            //         if (condition == option.value) {
                            //             terminationConditions.push({[condition]: option.value != null ? parseInt(option.value, 10) : 0});
                            //         }
                            //     }
                            // }

                            $scope.studyData.trafficParameters =
                                $scope.demandFailureStudy.trafficParameters.selected;

                            $scope.studyData.terminationConditions =
                                $scope.demandFailureStudy.terminationConditions.selected;

                            $scope.studyData.outputAttributes = $scope.demandFailureStudy.outputOptions.selected;

                            break;
                    }

                    break;
            }

            $scope.studyData.outputFormats = $scope.outputFormatOptions.selected;

            console.log("$scope.studyData: ", $scope.studyData);

            networkService.runStudy($route.current.params.id, studyName, $scope.studyData).then(function(response) {
                $rootScope.$broadcast("vane.updateStatus", "Network " + studyName + " study complete.", null, 'success');
                networkService.getNetwork().addLinkTraffic();
                // $timeout(function(){applyPostAnalysisUpdate();}, 1000);
                $rootScope.$broadcast("vane.applyPostAnalysisUpdate");
            }, function(response){
                console.log("response: ", response);
                // $scope.$apply(function(){$rootScope.status = "Error analyzing network.";});
                $rootScope.$broadcast("vane.updateStatus", "Error running network study.", null, 'error');
            });
            // $timeout(function(){$rootScope.$broadcast("vane.toggleAnalysisState");}, 3000);
        };

        if ($rootScope.currentNetwork && $route.current.params.id == $rootScope.mostRecentMap) {
            $timeout(function(){
                networkService._network = $rootScope.currentNetwork;
                updateAvailableDemands();
            }, 0);
            // $scope.$apply();
        } else {
            $rootScope.mostRecentMap = $route.current.params.id;
            networkService.load($route.current.params.id).then(function(){
                updateAvailableDemands();
            }, function(response){
                console.log(response);
                statusMessage = "Failure loading network data. Server responded with status "
                    + response.status + " (" + response.statusText + ")";

                if (response.data && response.data.message) {
                    statusMessage += " due to " + response.data.message;
                }
                $rootScope.$broadcast("vane.updateStatus", statusMessage, null, 'error');
            });
        }

        function updateAvailableDemands() {
            let availableDemands = networkService.getAvailableDemands();
            if (availableDemands) {
                $scope.demandStudy.demandSelection.availableDemands = availableDemands;
                $scope.demandsListSize = Math.max(Math.min(availableDemands.length, 5), 5);
            }
        }

        // updateAvailableDemands();


    }]);
})()
