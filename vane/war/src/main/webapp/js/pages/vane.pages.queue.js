angular.module("vane.pages")
.controller("QueueController", ["$scope", "$http", function($scope, $http){
    
    $scope.queue = {data: []};
        
    $scope.refresh = function(){
        $scope.queue.loading = true;
        $scope.queue.error = false;
        $scope.queue.empty = true;
        
        $http({
            method: "GET",
            url: "queue"
        }).then(function(response){
            $scope.queue.data = response.data;
            $scope.queue.loading = false;
            $scope.queue.error = false;
            $scope.queue.empty = $scope.projects.data.length < 1;
            $scope.queue.message = "";
        }, function(response){
            console.log(response);
            $scope.queue.data = [];
            $scope.queue.loading = false;
            $scope.queue.error = true;
            $scope.queue.empty = false;
            if(response.statusText){
                $scope.queue.message = response.statusText;
            }else{
                $scope.queue.message = "No connection could be established. Are you connected to the Internet?"
            }
        })
    }

    $scope.refresh();
    
}])
