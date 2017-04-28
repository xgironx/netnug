(function(){
	angular.module("vane.pages")
	.controller("ReviewController", function($scope, newNetworkService, leaflet, mapboxTileLayer){
		$scope.reviewMap = leaflet.map("review-map").setView([39.124668, -75], 3);
		$scope.tiles = mapboxTileLayer().addTo($scope.reviewMap);
		
		$scope.network = newNetworkService.network;
				
		$scope.$watch(() => {return newNetworkService.network}, function(){
			$scope.network = newNetworkService.network;
			console.log("newNetworkService.network has name " + newNetworkService.network.name());
			console.log("$scope.network has name " + $scope.network.name());
		}, true)
		
		$scope.$watch(() => {return $scope.network}, function(){
			newNetworkService.network = $scope.network;
		}, true)
		
		$scope.refresh = function(){
			newNetworkService.refresh();
		}
		
		$scope.remoteChange = function(){
			newNetworkService.change();
		}
		
		$scope.localChange = function(){
			$scope.network.name("Locally set name");
		}
		
		$scope.refresh();
	})
})()