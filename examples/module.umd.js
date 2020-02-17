(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global = global || self, global.main_es5_umd = factory());
}(this, (function() {
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

})));
