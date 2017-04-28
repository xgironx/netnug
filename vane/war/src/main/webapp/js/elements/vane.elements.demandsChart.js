(function(){
    angular.module("vane.elements")
    .directive("vaneDemandsChart", ['$rootScope', '$route', '$filter', '$timeout', 'highlighterService', 'selectionService', 'networkService', 'Node', 'Link', 'Demand', 'Route',
        function($rootScope, $route, $filter, $timeout, highlighterService, selectionService, networkService, Node, Link, Demand, Route) {
        return {
            transclude: true,
            scope: {},
            template: `
                <canvas id="line" class="chart chart-line" height="{{chartHeight}}"
                chart-data="demandChartData" chart-labels="demandChartLabels"
                chart-options="demandChartOptions" chart-series="demandChartSeries"
                chart-colors="demandChartColors"></canvas>
                `
            ,
            link: function(scope, element, attrs) {
                scope.activeView = $route.current.activeView;

                if (scope.activeView == 'edit-demands') {
                    scope.chartHeight = "600px";
                } else {
                    scope.chartHeight = "250px";
                }

                var chartColorMap = ['#00ADF9', '#DF1404', '#803690', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#DCDCDC'];

                function formatTrafficAmount(value, index, values) {
                    if (value < 10000) {
                        return value;
                    }
                    return value.toExponential(1).toString().replace('+', '');
                }

                scope.demandChartOptions = {
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
                                autoSkip: true,
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

                function fillArray(value, len) {
                    let arr = [];
                    for (let i = 0; i < len; i++) {
                        arr.push(value);
                    }
                    return arr;
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
                            let statistics = demand.getStatistics();
                            let amounts = traffic.amounts;
                            let times = traffic.times;
                            if (amounts != null) {
                                demandChartData.push(amounts);
                                demandChartLabels.push(times);
                                demandChartColors.push(chartColorMap[colorMapIndex % chartColorMap.length]);
                                demandChartSeries.push(demand.name());

                                // Overlay demand traffic statistics
                                p95 = statistics.p95;
                                demandChartData.push(fillArray(p95, amounts.length));
                                demandChartLabels.push(times);
                                demandChartColors.push('#ff2100');
                                demandChartSeries.push("P(95): " + demand.name());

                                avg = statistics.mean;
                                demandChartData.push(fillArray(avg, amounts.length));
                                demandChartLabels.push(times);
                                demandChartColors.push('#898989');
                                demandChartSeries.push("Avg: " + demand.name());

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

                    scope.demandChartColors = demandChartColors;
                    scope.demandChartData = demandChartData;
                    scope.demandChartLabels = demandChartLabels[0];
                    scope.demandChartSeries = demandChartSeries;
                }

                scope.$on("vane.updateDemandTrafficChart", function(event, selectedDemands, selectedRoutes) {
                    console.log("vane.elements.updateDemandTrafficChart. event");
                    $timeout(updateDemandTrafficChart, 0, true, selectedDemands, selectedRoutes);
                });

            },
        };
    }]);
})()
