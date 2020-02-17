var main_es5_iife = (function() {
	'use strict';

	var Main = function() {
		function Main() {
			var instances = Array.from(document.querySelectorAll('[simple-component]'))
				.map(function(node) {
					return new SimpleComponent().setNode(node);
				});
			console.log('Main.addSimpleComponents', instances);
			return instances;
		}

		return Main;
	}();

	var main = new Main();

	return Main;
}());
