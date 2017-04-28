(function(){
    angular.module("vane.misc", [])
    .service("misc", function($rootScope) {
        this.modelCapacityMap = {'10Gbps_Ethernet': 10e9,
                                 '10Gbps_Ethernet_int': 10e9,
                                 '10Gbps_Ethernet_adv': 10e9,
                                 '40Gbps_Ethernet': 40e9,
                                 '10BaseT': 10e6,
                                 '100BaseT': 100e6,
                                 '1000BaseX': 1e9,
                                 'T1_int': 192e3};
        this.capacityModelMap = {};
        for (var key in this.modelCapacityMap) {
            if (this.modelCapacityMap.hasOwnProperty(key)) {
                this.capacityModelMap[this.modelCapacityMap[key]] = key;
            }
        }
    })
})()
