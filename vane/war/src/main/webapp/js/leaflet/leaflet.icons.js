(function(){
    angular.module("leaflet")

    // This factory lets you look up icons by name
    // It yields icon objects
    // Currently, there is only one icon object it can yield
    .factory("iconLookup", ["leaflet", function(leaflet){

        // This is the default icon
        let workstationIcon = leaflet.icon({
            iconUrl: 'img/Workstation-1.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        let cloudIcon = leaflet.icon({
            iconUrl: 'img/Cloud-1.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        let lanIcon = leaflet.icon({
            iconUrl: 'img/LAN-1.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        let routerIcon = leaflet.icon({
            iconUrl: 'img/Router-2.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        let serverIcon = leaflet.icon({
            iconUrl: 'img/Server-4.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        let switchIcon = leaflet.icon({
            iconUrl: 'img/Switch-1.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        let defaultIcon = serverIcon;

        // These are all the recognized icons
        // Very... sparse
        let icons = {
            cloud: cloudIcon,
            lan: lanIcon,
            router: routerIcon,
            server: serverIcon,
            switch: switchIcon,
            workstation: workstationIcon,
            lookup: function(name) {
                switch (name) {
                    case "wkstn":
                        return workstationIcon;
                    default:
                        return defaultIcon;
                }
            }
        };

        // If you get an icon you recognize, return it
        // Otherwise return defaultIcon
        return function iconLookup(name){
            if(icons[name]) return icons[name];
            else return icons.lookup(name);
        }
    }])
})()
