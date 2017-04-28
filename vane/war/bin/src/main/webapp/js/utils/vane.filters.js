(function(){
    angular.module("vane.filters", [])
    .filter("siPrefix", function(){
        return function(input){
            if (input != null) {
                if(input < 1e3) {
                    return input + " ";
                }else if(input < 1e6) {
                    return Math.round(input/1e3) + " k";
                }else if(input < 1e9) {
                    return Math.round(input/1e6) + " M";
                }else if(input < 1e12) {
                    return Math.round(input/1e9) + " G";
                }else if(input < 1e15) {
                    return Math.round(input/1e12) + " T";
                }else{
                    return Math.round(input/1e15) + " P";
                }
            } else {
                return null;
            }
        }
    })
    .filter('split', function(){
        return function(input, splitChar, splitIndex){
            if (input != undefined){
                return input.split(splitChar)[splitIndex];
            }
        }
    })
    .filter('capitalize', function() {
        return function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
    })
    .filter('toTitleCase', function($filter) {
        return function(string, separator) {
            if (separator == null) {
                separator = ' ';
            }
            return string.toLowerCase().split(separator).map($filter('capitalize')).join(' ');
        };
    })
    .filter("objectNameArray", function() {
        return function(objectArray) {
            let names = [];
            for (let obj of objectArray) {
                names.push(obj.name());
            }
            return names;
        };
    })
    .filter("capacityUnits", function($filter) {
        return function(capacity) {
            capacity = $filter("siPrefix")(capacity);
            if (capacity != null) {
                return capacity + "b/s";
            } else {
                return capacity;
            }
        };
    })
    .filter("percent", function($filter){

        return function(input, digits) {
            if ($filter('isNumeric')(input)) {
                if(!digits) digits = 0;
                input = input * 100;
                return input.toFixed(digits) + "%";
            } else {
                return 'None';
            }
        };
    })
    .filter('isNumeric', function() {
        return function(val) {
            var type = typeof val;
            return (type === "number" || type === "string") && !isNaN(val - parseFloat(val));
        };
    })
    .filter('splitString', function(){
        return function(input, splitChar, splitIndex){
            if (input != undefined){
                return input.split(splitChar)[splitIndex];
            }
        };
    })
    .filter("demandSatisfied", function() {
        return function(input) {
            if (input == true) {
                return "Yes";
            } else if (input == false) {
                return "No";
            } else {
                return null;
            }
        };
    })
    .filter("copyTrafficProfile", function() {
        return function(trafficProfile) {
            let copy = [];
            for (let obj of trafficProfile) {
                copy.push({'time': obj.time, 'amount': obj.amount});
            }
            return copy;
        };
    })
    .filter("parseTrafficProfileFromTimeSeries", function() {
        return function(trafficTimeSeries) {
            let amounts = trafficTimeSeries.amounts;
            let times = trafficTimeSeries.times;
            let trafficProfile = [];
            for (let i = 0; i < amounts.length; i++) {
                trafficProfile.push({'time': times[i], 'amount': amounts[i]});
            }
            return trafficProfile;
        };
    })
    .filter("parseTrafficTimeSeries", function($filter) {
        return function(trafficProfile) {
            try {
                let traffic = $filter('orderBy')(trafficProfile, 'time', false);
                let amounts = [];
                let times = [];
                for (let point of traffic) {
                    amounts.push(point.amount);
                    times.push(point.time);
                }
                return {'amounts': amounts, 'times': times};
            } catch (e) {
                // console.log(e);
                return {'amounts': null, 'times': null};
            }
        };
    })
    .filter("parseUsageTimeSeries", function($filter) {
        return function(trafficProfile, capacity) {
            try {
                let traffic = $filter('orderBy')(trafficProfile, 'time', false);
                let usages = [];
                let times = [];
                for (let point of traffic) {
                    usages.push(point.amount / capacity * 100.0);
                    times.push(point.time);
                }
                return {'usages': usages, 'times': times};
            } catch (e) {
                return {'usages': null, 'times': null};
            }
        };
    })
    .filter("computeAverage", function() {
        return function(data) {
            return data.reduce(function(sum, value) {return sum + value;}, 0) / data.length;
        };
    })
    .filter("computeStd", function($filter) {
        return function(data) {
            let avg = $filter("computeAverage")(data);
            let diffSquared = data.map(function(value) {
                let diff = value - avg;
                let diffSquared = diff * diff;
                return diffSquared;
            });
            let diffSquaredAvg = $filter("computeAverage")(diffSquared);
            return Math.sqrt(diffSquaredAvg);
        };
    })
    .filter("computePercentile", function($filter) {
        return function(data, percentile) {
            let sorted = data.slice().sort(function(a, b) {return a - b;});
            let index = data.length * percentile / 100.0 + 0.5;
            let k = Math.trunc(index);
            let f = index % 1;
            return (1 - f) * sorted[k - 1] + f * sorted[k];
        };
    })
    .filter('allTrue', function() {
        return function(array, predicate) {
            for (let obj of array) {
                if (!predicate(obj)) {
                    return false;
                }
            }
            return true;
        };
    })
    .filter('anyTrue', function() {
        return function(array, predicate) {
            for (let obj of array) {
                if (predicate(obj)) {
                    return true;
                }
            }
            return false;
        };
    })
    .filter("allEnabled", function() {
        return function(iterable) {
            for (let obj of iterable) {
                if (obj.isDisabled()) {
                    return false;
                }
            }
            return true;
        };
    })
    .filter("allDisabled", function() {
        return function(iterable) {
            for (let obj of iterable) {
                if (!obj.isDisabled()) {
                    return false;
                }
            }
            return true;
        };
    })
    .filter("enabled", function() {
        return function(iterable) {
            let enabledObjs = [];
            for (let obj of iterable) {
                if (!obj.isDisabled()) {
                    enabledObjs.push(obj);
                }
            }
            return enabledObjs;
        };
    })
    .filter("disabled", function() {
        return function(iterable) {
            let disabledObjs = [];
            for (let obj of iterable) {
                if (obj.isDisabled()) {
                    disabledObjs.push(obj);
                }
            }
            return disabledObjs;
        };
    })
    .filter("visible", function() {
        return function(iterable) {
            let visible = [];
            for (let obj of iterable) {
                if (!obj.hidden()) {
                    visible.push(obj);
                }
            }
            return visible;
        };
    })
    .filter("hidden", function() {
        return function(iterable) {
            let hidden = [];
            for (let obj of iterable) {
                if (obj.hidden()) {
                    hidden.push(obj);
                }
            }
            return hidden;
        };
    })
    .filter("pluralize", function() {
        return function(string, count) {
            if (count == 1) return string;

            if (string.endsWith('y')) return string.slice(0, string.length - 1) + 'ies';
            return string + 's';
        };
    })
    .filter("arraysEqual", function() {
        return function(a, b) {
            if (a === b) return true;
            if (a == null || b == null) {
                return false;
            }
            if (a.length != b.length) {
                return false;
            }

            // If you don't care about the order of the elements inside
            // the array, you should sort both arrays here.

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) {
                    return false;
                }
                return true;
            }
        };
    })
})()
