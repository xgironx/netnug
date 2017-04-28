(function(){
    angular.module("vane.pages").controller("DemandController", ['$scope', '$route', '$rootScope', '$filter',
    '$timeout', '$location', 'leaflet', 'mapboxTileLayer', 'coloring', 'networkService', 'LinkTraffic',
    'selectionService', 'Demand', 'Route', function($scope, $route, $rootScope, $filter, $timeout, $location,
        leaflet, mapboxTileLayer, coloring, networkService, LinkTraffic, selectionService, Demand, Route) {

        var chartColorMap = ['#00ADF9', '#DF1404', '#803690', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#DCDCDC'];

        $scope.viewDropdownOpen = false;
        // $scope.chartHeight = "800px";

        //Traffic chart setup/config
        function formatTrafficAmount(value, index, values) {
            if (value < 10000) {
                return value;
            }
            return value.toExponential(1).toString().replace('+', '');
        }

        $scope.demandChartOptions = {
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
                        labelString: "Traffic (bps)"
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: formatTrafficAmount,
                    }
                }],
            },
            legend: {
                display: true,
            }
        };

        if ($rootScope.currentNetwork && $route.current.params.id == $rootScope.mostRecentMap) {
            $timeout(function(){
                networkService._network = $rootScope.currentNetwork;
            }, 0);
            // $scope.$apply();
        } else {
            $rootScope.mostRecentMap = $route.current.params.id;
            networkService.load($route.current.params.id).then(function(){
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

        function demandSelectionChange() {
            updateDemandTrafficChart(selectionService.selectedDemands());
        }

        function updateDemandTrafficChart(selectedDemands, selectedRoutes) {
            var demandChartData = [];
            var demandChartSeries = [];
            var demandChartColors = [];
            var demandChartLabels = [];

            if (selectedDemands) {
                let colorMapIndex = 0;
                for (let demand of selectedDemands) {
                    let traffic = demand.getTrafficTimeSeries();
                    let amounts = traffic.amounts;
                    let times = traffic.times;
                    if (amounts != null) {
                        demandChartData.push(amounts);
                        demandChartLabels.push(times);
                        demandChartColors.push(chartColorMap[colorMapIndex % chartColorMap.length]);
                        demandChartSeries.push("Demand: " + demand.name());
                        colorMapIndex++;
                    }
                }

                if (selectedRoutes) {
                    for (let route of selectedRoutes) {
                        let traffic = route.getTrafficTimeSeries();
                        demandChartData.push(traffic.amounts);
                        demandChartSeries.push(route.linkIds());
                        demandChartColors.push(chartColorMap[colorMapIndex % chartColorMap.length]);
                    }
                }
            }

            $scope.demandChartColors = demandChartColors;
            $scope.demandChartData = demandChartData;
            $scope.demandChartLabels = demandChartLabels[0];
            $scope.demandChartSeries = demandChartSeries;
        }

        $scope.$on("vane.demandSelectionChange", function() {
            console.log("vane.demandSelectionChange event broadcast");
            $timeout(demandSelectionChange, 0);
        });

        $scope.$on("vane.updateDemandTrafficChart", function(event, selectedDemands, selectedRoutes) {
            console.log("vane.updateDemandTrafficChart event broadcast");
            $timeout(updateDemandTrafficChart, 0, true, selectedDemands, selectedRoutes);
        });

    }]);
})()
