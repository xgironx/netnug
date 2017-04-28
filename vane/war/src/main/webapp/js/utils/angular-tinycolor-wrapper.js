(function(window){
	angular.module("tinycolor", [])
	.service("tinycolor", function(){
		let t = window.tinycolor;
		delete window.tinycolor;
		return t;
	})
})(window)