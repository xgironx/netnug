(function(){
    angular.module("vane.pages")
    .controller("NewController", ['$scope', '$location', 'newNetworkService', function($scope, $location, newNetworkService) {

        $scope.project_name = "";
        $scope.project_description = "";
        $scope.project_file = null;

        $scope.newProject = function() {
            newNetworkService
            .new($scope.project_name, $scope.project_description)
            .then(
                function(response){
                    // console.log(response);
                    $location.path("/");
                    $scope.$apply();
                },
                function(response){
                    console.error(response);
                }
            )
        };

        $scope.uploadFile = function() {
            newNetworkService
            .upload($scope.project_name, $scope.project_description, $scope.project_file)
            .then(
                function(response){
                    console.log(response);
                    $location.path("/");
                    $scope.$apply();
                },
                function(response){
                    console.error(response);
                }
            )
        };
    }])
    .directive('fileUpload', [function() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function($scope, element, attrs, ngModel) {

                element.bind("change", function(event) {
                    ngModel.$setViewValue(event.target.files[0]);
                    $scope.$apply();
                });

                $scope.$watch(function() {
                    return ngModel.$viewValue;
                }, function(value) {
                    if (!value) {
                        element.val("");
                    }
                });
            }
        };
    }])
})()
