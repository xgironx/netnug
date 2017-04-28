angular.module("vane.pages")
.controller("ProjectsController", ["$scope", "$http", function($scope, $http){

	$scope.projects = {loading: false, error: false, message: false, data: []};

	$scope.refresh = function(){
		$scope.projects.loading = true;
		$scope.projects.error = false;
		$scope.projects.empty = true;

		$http({
			method: "GET",
			url: "projects"
		}).then(function(response){
			$scope.projects.data = response.data;
			$scope.projects.loading = false;
			$scope.projects.error = false;
			$scope.projects.empty = $scope.projects.data.length < 1;
			$scope.projects.message = "";
		}, function(response){
			$scope.projects.data = [];
			$scope.projects.loading = false;
			$scope.projects.error = true;
			$scope.projects.empty = false;
			if(response.statusText){
				$scope.projects.message = response.statusText;
			}else{
				$scope.projects.message = "No connection could be established. Are you connected to the Internet?";
			}
		});
	}

	$scope.remove = function(id){
        $http({
            method: "POST",
            url: "remove?id=" + id,
        }).then(function(){
        	$scope.refresh();
        });
    };

	$scope.refresh();

}])
