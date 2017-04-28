(function(){
    angular.module("vane.load")
    .service("newNetworkService", function($rootScope, $http, upload) {

        let self = this;

        this.new = function(name, description) {
            return new Promise(function(resolve, reject) {
                console.log("name: ", name);
                console.log("description: ", description);
                $http({
                    method: "POST",
                    url: "new",
                    data: {
                        name: name,
                        description: description,
                    },
                }).then(
                    function(response){
                        console.log("/new HTTP POST response.data: ", response.data);
                        resolve(response);
                    },
                    function(response) {
                        reject(response);
                    }
                );

            });
        };

        this.upload = function(name, description, file) {
            return new Promise(function(resolve, reject) {
                console.log("Uploading...");
                upload({
                    url: "upload",
                    method: "POST",
                    data: {
                        name: name,
                        description: description,
                        file: file,
                    }
                }).then(
                    function(response){
                        resolve(response);
                    },
                    function(response){
                        reject(response);
                    }
                );
            });
        };
    })
})()
