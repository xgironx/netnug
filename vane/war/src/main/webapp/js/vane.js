angular.module("vane", ["vane.pages", "ngMaterial", "ngAnimate", "ngRoute", "xeditable", "color.picker.core"]) //Disabled dependencies: "ui.bootstrap", "mgcrea.ngStrap"
.config(["$routeProvider", function($routeProvider) {
    $routeProvider
        .when("/map/mock", {
            templateUrl: "partials/map.html",
            controller: "MapController",
            activeView: "map",
            useMock: true,
        })
        .when("/map/:id", {
            templateUrl: "partials/map.html",
            controller: "MapController",
            activeView: "map",
        })
        .when("/projects", {
            templateUrl: "partials/projects.html",
            controller: "ProjectsController",
            activeView: "projects",
        })
        .when("/new", {
            templateUrl: "partials/new.html",
            controller: "NewController",
            activeView: "projects",
        })
        .when("/new/review", {
            templateUrl: "partials/review.html",
            controller: "ReviewController",
            activeView: "projects",
        })
        .when("/demands/:id", {
            templateUrl: "partials/demands.html",
            controller: "DemandController",
            activeView: "demands",
        })
        .when("/network-study/:id", {
            templateUrl: "partials/network-study.html",
            controller: "MapController",
            activeView: "study",
        })
        // .when("/queue", {
        //  templateUrl: "partials/queue.html",
        //  controller: "QueueController",
        //  activeView: "queue",
        // })
        .otherwise({
            redirectTo: "/projects"
        });
}])
.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).hover(function(){
                // on mouseenter
                // $(element).tooltip({html: true, container: 'body'});
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });

            $(element).click(function() {
                $(element).tooltip('hide');
            });
        }
    };
})
.run(function(editableOptions, editableThemes) {
    editableThemes.bs3.inputClass = 'input-sm';
    editableOptions.theme = 'bs3';
})
.controller("MenuController", ['$scope', '$rootScope', '$route', '$timeout', '$q', 'highlighterService', 'networkService', 'selectionService',
        function($scope, $rootScope, $route, $timeout, $q, highlighterService, networkService, selectionService) {
    $rootScope.autoAnalyze = true;
    $rootScope.iconSize = 'large';

    resetNotifications();
    updateSelections();

    $scope.$route = $route;
    $scope.analyzing = false;
    $scope.legendVisible = true;

    $scope.visibleNodes = {
        all: true,
        enabled: true,
        disabled: true
    };

    $scope.visibleLinks = {
        all: true,
        enabled: true,
        disabled: true,
        used: true,
        unused: true,
    };

    $scope.visibleDemands = {
        all: true,
        enabled: true,
        disabled: true,
        satisfied: true,
        unsatisfied: true,
    };

    $scope.selectDropdownOpen = $scope.deselectDropdownOpen = $scope.editDropdownOpen = false;

    $scope.analyze = function() {
        $rootScope.$broadcast("vane.analyzeNetwork");

        // toggleAnalysisState()
        // .then(function() {
        //     return updateStatus("Queueing Project " + $route.current.params.id + " for analysis...");
        // })
        // .then(function() {
        //     return networkService.analyze($route.current.params.id);
        // })
        // .then(function() {
        //     return updateStatus("Network analysis complete.", null, 'success');
        // })
        // .then(function() {

        // }, function(response){
        //     console.log("response: ", response);
        //     // $scope.$apply(function(){$rootScope.status = "Error analyzing network.";});
        //     return updateStatus("Error analyzing network.", null, 'error');
        // });

        // $timeout(function(){$rootScope.analyzing = false;}, 5000);
        // $timeout(function(){$rootScope.$broadcast("vane.toggleAnalysisState");}, 4000);

    };

    $scope.save = function() {
        updateStatus("Saving Project " + $route.current.params.id + " network state as a new project...")
        .then(function() {
            return networkService.save($route.current.params.id);
        })
        .then(function(response) {
            return updateStatus("Network state saved.", null, 'success');
        })
        .catch(function(response) {
            console.log(response);
            return updateStatus("Error saving network state.", null, 'error');
        });
    };

    $scope.enable = function() {
        enableSelection();
    };

    $scope.disable = function() {
        disableSelection();
    };

    $scope.selectAll = function() {
        $rootScope.$broadcast("vane.selectAll");
    };

    $scope.selectType = function(type) {
        $rootScope.$broadcast("vane.selectType", type);
    };

    $scope.selectState = function(state) {
        $rootScope.$broadcast("vane.selectState", state);
    };

    $scope.deselectAll = function() {
        selectionService.deselectAll(true);
        $rootScope.$broadcast("vane.deselectAll");
    };

    $scope.toggleVisibility = function(selection) {
        let visible = null;
        switch (selection) {
            case 'legend':
                visible = $scope.legendVisible = !$scope.legendVisible;
                break;
            case 'allNodes':
                visible = $scope.visibleNodes.all = $scope.visibleNodes.enabled = $scope.visibleNodes.disabled = !$scope.visibleNodes.all;
                break;
            case 'enabledNodes':
                visible = $scope.visibleNodes.enabled = !$scope.visibleNodes.enabled;
                break;
            case 'disabledNodes':
                visible = $scope.visibleNodes.disabled = !$scope.visibleNodes.disabled;
                break;
            case 'allLinks':
                visible = $scope.visibleLinks.all = $scope.visibleLinks.enabled = $scope.visibleLinks.disabled =
                            $scope.visibleLinks.used = $scope.visibleLinks.unused = !$scope.visibleLinks.all;
                break;
            case 'enabledLinks':
                visible = $scope.visibleLinks.enabled = !$scope.visibleLinks.enabled;
                break;
            case 'disabledLinks':
                visible = $scope.visibleLinks.disabled = !$scope.visibleLinks.disabled;
                break;
            case 'usedLinks':
                visible = $scope.visibleLinks.used = !$scope.visibleLinks.used;
                break;
            case 'unusedLinks':
                visible = $scope.visibleLinks.unused = !$scope.visibleLinks.unused;
                break;
            case 'allDemands':
                visible = $scope.visibleDemands.all = $scope.visibleDemands.enabled = $scope.visibleDemands.disabled =
                            $scope.visibleDemands.satisfied = $scope.visibleDemands.unsatisfied = !$scope.visibleDemands.all;
                break;
            case 'enabledDemands':
                visible = $scope.visibleDemands.enabled = !$scope.visibleDemands.enabled;
                break;
            case 'disabledDemands':
                visible = $scope.visibleDemands.disabled = !$scope.visibleDemands.disabled;
                break;
            case 'satisfiedDemands':
                visible = $scope.visibleDemands.satisfied = !$scope.visibleDemands.satisfied;
                break;
            case 'unsatisfiedDemands':
                visible = $scope.visibleDemands.unsatisfied = !$scope.visibleDemands.unsatisfied;
                break;
            default:
                console.log('unknown selection type/state: ', selection);
        }

        // $scope.visibleNodes.all = $scope.visibleNodes.enabled = $scope.visibleNodes.disabled = !$scope.visibleNodes.all;
        // $scope.visibleLinks.all = $scope.visibleLinks.enabled = $scope.visibleLinks.disabled =
        // $scope.visibleLinks.used = $scope.visibleLinks.unused = !$scope.visibleLinks.all;
        // $scope.visibleDemands.all = $scope.visibleDemands.enabled = $scope.visibleDemands.disabled =
        // $scope.visibleDemands.satisfied = $scope.visibleDemands.unsatisfied = !$scope.visibleDemands.all;
        $scope.visibleNodes.all = $scope.visibleNodes.enabled && $scope.visibleNodes.disabled;

        $scope.visibleLinks.all = $scope.visibleLinks.enabled && $scope.visibleLinks.disabled &&
        $scope.visibleLinks.used && $scope.visibleLinks.unused;

        $scope.visibleDemands.all = $scope.visibleDemands.enabled && $scope.visibleDemands.disabled &&
        $scope.visibleDemands.satisfied && $scope.visibleDemands.unsatisfied;

        $rootScope.$broadcast("vane.toggleVisibility", selection, visible);

    };

    $scope.generateReport = function(fileType) {
        switch(fileType) {
            case 'csv':
                break;
            case 'xlsx':
                break;
            case 'json':
                break;
            case 'pdf':
                break;
            default:
                console.log("Unknown filetype: " + fileType);
        }
    };

    function clearAnalysisResults() {
        // let deferred = $q.defer();
        $rootScope.$broadcast("vane.clearAnalysisResults");
    }

    function enableSelection(selection, statusMessage) {
        let deferred = $q.defer();
        let promise = deferred.promise;

        promise.then(function() {
            $rootScope.status = "Enabling selection...";
            if (selection != null) {
                for (let item of selection) {
                    item.enable();
                }
            } else {
                for (let item of selectionService._selectedObjects) {
                    item.enable();
                }
            }
        })

        deferred.resolve();

        promise
        .then(updateSelections)
        .then(clearAnalysisResults)
        .then(function() {
            updateStatus(statusMessage, 'analyze', 'warning');
        })

        return promise;
    }

    function disableSelection(selection, statusMessage) {
        let deferred = $q.defer();
        let promise = deferred.promise;

        promise.then(function() {
            $rootScope.status = "Disabling selection...";
            if (selection != null) {
                for (let item of selection) {
                    item.disable();
                }
            } else {
                for (let item of selectionService._selectedObjects) {
                    item.disable();
                }
            }
        });

        deferred.resolve();

        promise
        .then(updateSelections)
        .then(clearAnalysisResults)
        .then(function() {
            updateStatus(statusMessage, 'analyze', 'warning');
        });

        return promise;
    }

    function resetNotifications() {
        let deferred = $q.defer();
        $scope.notifications = {
            errors: null,
            warnings: null,
            success: null,
        };
        deferred.resolve();
        return deferred.promise;
    }

    function toggleAutoAnalyze() {
        let deferred = $q.defer();

        if (!$rootScope.autoAnalyze) {
            $rootScope.autoAnalyze = true;
        } else {
            $rootScope.autoAnalyze = false;
        }
        deferred.resolve();
        return deferred.promise;
    }

    function toggleAnalysisState() {
        let deferred = $q.defer();
        if (!$scope.analyzing) {
            $scope.analyzing = true;
        } else {
            $scope.analyzing = false;
        }
        deferred.resolve();
        return deferred.promise;
    }

    function updateSelections() {
        let deferred = $q.defer();
        $scope.hasSelection = selectionService.hasSelection();
        $scope.multiSelection = selectionService.hasMultiSelection();
        $scope.allEnabled = selectionService.allEnabled();
        $scope.allDisabled = selectionService.allDisabled();
        $scope.hasHighlights = highlighterService.hasHighlights();
        deferred.resolve();
        return deferred.promise;
    }

    function updateStatus(statusMessage, action, notificationLevel) {
        let deferred = $q.defer();

        if (!statusMessage) {
            statusMessage = "Network state changed.";
        }
        $rootScope.status = statusMessage;
        if (action == 'analyze') {
            if ($rootScope.autoAnalyze) {
                $scope.analyze();
            } else {
                $rootScope.status += " Re-analzye network.";
            }
        }
        resetNotifications();
        if (notificationLevel == 'success') {
            $scope.notifications.success = true;
        } else if (notificationLevel == 'warning') {
            $scope.notifications.warning = true;
        } else if (notificationLevel == 'error') {
            $scope.notifications.error = true;
        }

        deferred.resolve();
        return deferred.promise;
    }

    $scope.$on("$routeChangeSuccess", function() {
        $scope.mostRecentMap = $rootScope.mostRecentMap;
    });

    $scope.$on("vane.enableSelection", function(event, selection, statusMessage) {
        console.log("vane.enableSelection event handler triggered.");
        $timeout(enableSelection, 0, true, selection, statusMessage);
    });

    $scope.$on("vane.disableSelection", function(event, selection, statusMessage) {
        console.log("vane.disableSelection event handler triggered.");
        $timeout(disableSelection, 0, true, selection, statusMessage);
    });

    $scope.$on("vane.toggleAutoAnalyze", function() {
        console.log("vane.toggleAutoAnalyze event handler triggered.");
        $timeout(toggleAutoAnalyze, 0);
    });

    $scope.$on("vane.toggleAnalysisState", function() {
        console.log("vane.toggleAnalysisState event handler triggered.");
        $timeout(toggleAnalysisState, 0);
    });

    $scope.$on("vane.updateSelections", function() {
        console.log("vane.updateSelections event handler triggered.");
        $timeout(updateSelections, 0);
    });

    $scope.$on("vane.updateStatus", function(event, statusMessage, action, notificationLevel) {
        console.log("vane.updateStatus event handler triggered.");
        $timeout(updateStatus, 0, true, statusMessage, action, notificationLevel);
    });

}])
