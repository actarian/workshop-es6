const { DEFAULT_EXTENSIONS } = require('@babel/core'),
	rollup = require('rollup'),
	rollupPluginBabel = require('rollup-plugin-babel');

// only with version "rollup-plugin-babel": "5.0.0-alpha.1",

function testRollup() {

	rollup.rollup({
			input: process.cwd() + '/src/js/_examples/es6/example.js'
		}).then(bundle => {
			const outputs = [{
				name: 'test',
				file: process.cwd() + '/docs/js/examples/test/test.js',
				format: 'esm',
				plugins: [rollupPluginBabel.generated({
					presets: [
						['@babel/preset-env', {
							modules: 'umd',
							loose: true,
							/*
							targets: {
								esmodules: true
							}
							*/
						}],
						// ['@babel/preset-typescript', { modules: false, loose: true }]
					],
					plugins: [
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-object-rest-spread'
					],
					comments: false,
					// babelrc: false,
				})]
			}];
			/*
			return Promise.all(outputs.map((output, i) => bundle.generate(output).then(result => {
				return result;
			})));
			*/
			return bundle.write(outputs[0]);
		})
		.then((results) => {
			results.forEach(x => {
				const outputs = x.output;
				outputs.forEach(x => {
					const modules = Object.keys(x.modules);
					console.log(modules);
					// console.log('output', x);
				});
			});
		})
		.catch(error => {
			console.log('Rollup bundle error', error);
		});
}

module.exports = {
	testRollup,
};
