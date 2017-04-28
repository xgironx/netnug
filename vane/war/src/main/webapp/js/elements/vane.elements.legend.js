(function(){
	angular.module("vane.elements")
	.directive("linkUtilizationLegend", function(coloring){

		let unknown, zero, main, hundred;

		function update(){
			unknown.css("background-color", coloring.color(null));
			zero.css("background", coloring.color(0));
			main.css("background", coloring.cssGradient(100));
			hundred.css("background", coloring.color(1));
		}

		return {
			template: `
			<style>
			[link-utilization-legend] table {
				border-collapse: separate;
				border-spacing: .5em .5em;
				height: 100%;
				width: 100%;
				font-size: 75%;
			}

			[link-utilization-legend] h3 {
				font-size: 1.4em;
				margin: 0px 0px 0px 0px;
                padding: 0px;
			}

			[link-utilization-legend] h4 {
				font-size: 1.2em;
			}

			[link-utilization-legend] td{
				width: 2em;
				border: none;
				border-collapse: separate;
				border-spacing: .5em .5em;
                padding: 0px;
			}

			[link-utilization-legend] tr:not(.mainrow){
				height: 2em;
				max-height: 2em;
				border: none;
				border-collapse: separate;
				border-spacing: .5em .5em;
                padding: 0px;
			}

			[link-utilization-legend] tr.mainrow{
				min-height: 2em;
				border: none;
				border-collapse: separate;
				border-spacing: .5em .5em;
                padding: 0px;
			}

			[link-utilization-legend] td#mainlabels{
				display: flex;
				flex-direction: column;
				height: 100%;
				border: none;
				border-collapse: separate;
				border-spacing: .5em .5em;
                padding: 0px;
			}

			[link-utilization-legend] td#mainlabels > div:not(.spacer) {
				height: 25%;
				display: flex;
				align-items: center;
				border: none;
				border-collapse: separate;
				border-spacing: .5em .5em;
                padding: 0px;
			}

			[link-utilization-legend] td#mainlabels > div.spacer {
				height: 12.5%;
				border-collapse: separate;
				border-spacing: .5em .5em;
                padding: 0px;
			}
			</style>

			<table>
				<tr><th colspan="2" style="border: none"><h3><strong>Link Usage</strong></h3></th></tr>
				<tr><td>Unknown</td><td id="unknown"></td></tr>
				<tr><td>0%</td><td id="zero"></td></tr>
				<tr class="mainrow">
					<td id="mainlabels">
						<div class="spacer"></div>
						<div>25%</div>
						<div>50%</div>
						<div>75%</div>
						<div class="spacer"></div>
					</td>
					<td id="main"></td>
				</tr>
				<tr><td>100%</td><td id="hundred"></td></tr>
			</table>`,
			link: function(scope, element, attrs){
				unknown = angular.element(element[0].querySelector('#unknown'));
				zero = angular.element(element[0].querySelector('#zero'));
				main = angular.element(element[0].querySelector('#main'));
				hundred = angular.element(element[0].querySelector('#hundred'));

				element.css("display", "flex");
				element.css("flex-direction", "column");

				update();

				coloring.onChange(update);
			},
		}
	})
	.directive("linkTrafficLegend", function(coloring){

		let unknown, zero, main, hundred;

		function update(){
			// unknown.css("background-color", coloring.color(null));
			// zero.css("background", coloring.color(0));
			main.css("background", coloring.cssGradient(100));
			// hundred.css("background", coloring.color(1));
		}

		return {
			template: `
			<style>
			[link-traffic-legend] table{
				border-collapse: separate;
				border-spacing: .5em .5em;
				height: 100%;
				width: 100%;
				font-size: 75%;
			}

			[link-traffic-legend] h3 {
				font-size: 1.4em;
				margin: 0px 0px 0px 0px;
			}

			[link-traffic-legend] h4 {
				font-size: 1.2em;
			}

			[link-traffic-legend] td{
				width: 2em;
			}

			[link-traffic-legend] tr:not(.mainrow){
				height: 2em;
				max-height: 2em;
			}

			[link-traffic-legend] tr.mainrow{
				min-height: 2em;
			}

			[link-traffic-legend] td#mainlabels{
				display: flex;
				flex-direction: column;
				height: 100%;
			}

			[link-traffic-legend] td#mainlabels > div:not(.spacer) {
				height: 25%;
				display: flex;
				align-items: center;
			}

			[link-traffic-legend] td#mainlabels > div.spacer {
				height: 12.5%;
			}
			</style>

			<table>
				<tr><th colspan="2"><h3><strong>Link Traffic</strong></h3></th></tr>
				<tr class="mainrow">
					<td id="mainlabels">
						<div class="spacer"></div>
						<div>0%</div>
						<div class="spacer"></div>
						<div>25%</div>
						<div>50%</div>
						<div>75%</div>
						<div class="spacer"></div>
						<div>100%</div>
						<div class="spacer"></div>
					</td>
					<td id="main"></td>
				</tr>
			</table>`,
			link: function(scope, element, attrs){
				// unknown = angular.element(element[0].querySelector('#unknown'));
				// zero = angular.element(element[0].querySelector('#zero'));
				main = angular.element(element[0].querySelector('#main'));
				// hundred = angular.element(element[0].querySelector('#hundred'));

				element.css("display", "flex");
				element.css("flex-direction", "column");

				update();

				coloring.onChange(update);
			},
		}
	})
})()
