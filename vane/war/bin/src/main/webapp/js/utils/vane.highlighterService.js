(function(){
    angular.module("vane.highlighterService", []).service("highlighterService", ['$rootScope', '$timeout',
        function($rootScope, $timeout) {
            let self = this;
            self._highlightedObjects = new Set();

            self.highlight = function(object){
                object._highlight();
                self._highlightedObjects.add(object);
                // console.log("highlighted ", object);
                return this;
            };

            self.unhighlight = function(object){
                object._unhighlight();
                self._highlightedObjects.delete(object);
                // console.log("unhighlighted ", object);
                return this;
            };

            self.highlightAll = function(objects){
                console.log("highlighting all...");
                for (let object of objects){
                    object.highlight();
                }
                return this;
            };

            self.unhighlightAll = function(){
                console.log("unhighlighting all...");
                for (let object of self._highlightedObjects){
                    // object._unhighlight();
                    object.unhighlight();
                }
                self._highlightedObjects.clear();
                // $rootScope.$broadcast("vane.updateHighlighted");
                return this;
            };

            self.highlightOnly = function(item) {
                console.log("highlightOnly: ", item);
                for (let object of self._highlightedObjects) {
                    if (object != item){
                        object.unhighlight();
                        // self._highlightedObjects.delete(object);
                    }
                }
                item.toggleHighlight();
                return this;
            };

            self.isHighlighted = function(object){
                return self._highlightedObjects.has(object);
            };

            self.hasHighlights = function(){
                return self.count() > 0;
            };

            self.hasSingleHighlight = function(){
                return self.count() === 1;
            };

            self.hasMultiHighlights = function(){
                return self.count() > 1;
            };

            self.highlighted = function(){
                return self._highlightedObjects.values();
            };

            self.count = function(){
                return self._highlightedObjects.size;
            };

            self.allEnabled = function() {
                for (let object of self._highlightedObjects) {
                    if (object.isDisabled()) {
                        return false;
                    }
                }
                return true;
            };

            self.allDisabled = function() {
                for (let object of self._highlightedObjects) {
                    if (!object.isDisabled()) {
                        return false;
                    }
                }
                return true;
            };

            this[Symbol.iterator] = function(){
                return self._highlightedObjects.values();
            };

        }])
})()
