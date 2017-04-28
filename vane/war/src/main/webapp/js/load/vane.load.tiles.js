(function(){
	angular.module("vane.load")
	.factory("mapboxTileLayer", function(leaflet){
		return function(mapToggle){
			if(mapToggle){
				return leaflet.tileLayer("https://api.mapbox.com/styles/v1/dandulaney/{mapid}/tiles/256/{z}/{x}/{y}@2x?access_token={apikey}",
				{
					mapid: "citbkstne000u2hmllbi4n6zb",
					apikey: "pk.eyJ1IjoiZGFuZHVsYW5leSIsImEiOiJjaXRia3MxMTYwNzVrMnhscXA1czhibDZ1In0.OyVo6zRnpCV4D-zBglwBaA",
					attribution: "Map Data &copy; <a href=\"http://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap Contributors</a>, Imagery &copy; <a href=\"https://www.mapbox.com/about/maps/\" target=\"_blank\">Mapbox</a>",
				})
			}
			else if(!mapToggle){
				// return leaflet.tileLayer("http://www.solidbackgrounds.com/images/1920x1200/1920x1200-light-gray-solid-color-background.jpg")
				var tiles = new leaflet.GridLayer();
				tiles.createTile = function(coords) {
					var tile = document.createElement('canvas'),
				    ctx = tile.getContext('2d');
					tile.width = tile.height = 256;
					ctx.fillStyle = 'white';
					ctx.fillRect(0, 0, 255, 255);
					// ctx.fillStyle = 'black';
					// ctx.fillText('x: ' + coords.x + ', y: ' + coords.y + ', zoom: ' + coords.z, 20, 20);
					ctx.strokeStyle = 'black';
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(255, 0);
					ctx.lineTo(255, 255);
					ctx.lineTo(0, 255);
					ctx.closePath();
					ctx.stroke();
					return tile;
				}
				return tiles;
			}
		}
	})
})()
