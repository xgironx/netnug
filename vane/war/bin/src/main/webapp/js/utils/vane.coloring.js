(function(){
    angular.module("vane.coloring", ["tinycolor"])

    .service("coloring", function($rootScope, tinycolor){
        let icite = function(usage){
            if(usage === 0){
                return tinycolor("#000000");
            }else if(usage > 0 && usage < .25){
                return tinycolor("#0000ff");
            }else if(usage >= .25 && usage < .5){
                return tinycolor("#80ff00");
            }else if(usage >= .5 && usage < .75){
                return tinycolor("#ffff00");
            }else if(usage >= .75 && usage < 100){
                return tinycolor("#a20000");
            }else{
                return tinycolor("gray");
            }
        }

        let sliding = function(usage){
            if(usage !== null && usage >= 0 && usage <= 1){
                return tinycolor({h: (1 - usage) * 120, s: 1, l: .5});
            }else{
                return tinycolor("gray");
            }
        }

        this._legends = {"ICITE": icite, "Sliding": sliding};
        this._current = "ICITE";
        this._callbacks = [];

        this.color = function(usage){
            if(typeof this._current === "function") return this._current(usage);
            else return this._legends[this._current](usage);
        }

        this.options = function(){
            return Object.keys(this._legends);
        }

        this.choose = function(key){
            if(typeof this._legends[key] === "function"){
                this._current = key;
            }else if(this._legends[key]){
                this._current = key;
                for(let callback of this._callbacks){
                    callback();
                }
            }
        }

        this.cssGradient = function(count){
            let string = "linear-gradient(180deg, ";

            for(let step = 0; step < count; step++){
                let loweredge = step/count;
                let upperedge = (step + 1)/count;
                let middle = (step + step + 1)/(count + count);

                string += this.color(middle).toHexString() + " " + loweredge * 100 + "%, ";
                string += this.color(middle).toHexString() + " " + upperedge * 100 + "%, ";
            }

            string = string.slice(0, -2) + ")";

            return string;
        }

        this.onChange = function(callback){
            this._callbacks.push(callback);
        }
    })


})()
