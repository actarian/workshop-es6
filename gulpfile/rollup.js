const { DEFAULT_EXTENSIONS } = require('@babel/core'),
	babelPresetEnv = require('@babel/preset-env'),
	babelPresetTypescript = require('@babel/preset-typescript'),
	path = require('path'),
	rollup = require('rollup'),
	rollupPluginBabel = require('rollup-plugin-babel'),
	rollupPluginCommonJs = require('@rollup/plugin-commonjs'),
	rollupPluginSourcemaps = require('rollup-plugin-sourcemaps'),
	rollupPluginLicense = require('rollup-plugin-license'),
	rollupPluginNodeResolve = require('@rollup/plugin-node-resolve'),
	rollupPluginTypescript2 = require('rollup-plugin-typescript2'),
	// rollupPluginTypescript = require('@rollup/plugin-typescript'),
	through2 = require('through2'),
	typescript = require('typescript'),
	vinyl = require('vinyl'),
	vinylSourcemapsApply = require('vinyl-sourcemaps-apply');

function rollup_(config, item) {
	return through2.obj(function(file, enc, callback) {
		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			console.warn('Rollup, Streaming not supported');
			return callback(null, file);
		}
		const maps = file.sourceMap !== undefined;
		const originalCwd = file.cwd;
		const originalPath = file.path;
		const rollupGenerate = (bundle, output, i) => {
			return bundle.generate(output).then(result => {
				if (!result) {
					return;
				}
				const newFileName = path.basename(output.file);
				const newFilePath = output.file;
				let targetFile;
				if (i > 0) {
					const newFile = new vinyl({
						cwd: file.cwd,
						base: file.base,
						path: newFilePath,
						stat: {
							isFile: () => true,
							isDirectory: () => false,
							isBlockDevice: () => false,
							isCharacterDevice: () => false,
							isSymbolicLink: () => false,
							isFIFO: () => false,
							isSocket: () => false
						}
					});
					targetFile = newFile;
				} else {
					file.path = newFilePath;
					targetFile = file;
				}
				const generated = result.output[0];
				// Pass sourcemap content and metadata to gulp-sourcemaps plugin to handle
				// destination (and custom name) was given, possibly multiple output bundles.
				if (maps) {
					generated.map.file = path.relative(originalCwd, originalPath);
					generated.map.sources = generated.map.sources.map(source => path.relative(originalCwd, source));
				}
				// console.log(generated.map.file);
				// return bundled file as buffer
				targetFile.contents = Buffer.from(generated.code);
				// apply sourcemap to output file
				if (maps) {
					vinylSourcemapsApply(targetFile, generated.map);
				}
				if (i > 0) {
					this.push(targetFile);
				}
			}).catch(error => {
				console.log('Rollup generate error', error);
			});
		};

		rollup.rollup(rollupInput_(item)).then(bundle => {
			const outputs = rollupOutput_(item);
			// console.log(outputs);
			return Promise.all(outputs.map((output, i) => rollupGenerate(bundle, output, i))).then(complete => {
				callback(null, file);
			});
			// return bundle.write(outputs);
		}).catch(error => {
			console.log('Rollup bundle error', error);
			throw (error);
			/*
			process.nextTick(() => {
				this.emit('error', new Error('message'));
				cb(null, file)
			});
			*/
		});
	});
}

function rollupInput_(item) {
	let babelTargets;
	if ((typeof item.output === 'object' && item.output.format === 'esm') || item.target === 'esm') {
		babelTargets = {
			"esmodules": true
		};
	} else {
		babelTargets = item.target; // 'last 2 version, ie 11';
	}
	const tsconfigDefaults = {
		compilerOptions: {
			target: 'esNext',
			module: 'esNext',
			lib: ["dom", "es2015", "es2016", "es2017"],
			allowJs: true,
			declaration: false,
			sourceMap: true,
			removeComments: true,
		},
		exclude: [
			"./node_modules/*",
			".npm"
		]
	};
	const tsconfigOverride = {
		compilerOptions: {
			target: 'esNext',
			module: 'esNext',
			lib: ["dom", "es2015", "es2016", "es2017"],
			allowJs: true,
			declaration: false,
			sourceMap: true,
			removeComments: true,
		},
		exclude: [
			"./node_modules/*",
			".npm"
		]
	};
	// const watchGlob = path.dirname(input) + '/**/*' + path.extname(input);
	// console.log('watchGlob', watchGlob);
	const plugins = [
		// Resolve source maps to the original source
		rollupPluginSourcemaps(),
		/*
		// Allow node_modules resolution, so you can use 'external' to control
		// which external modules to include in the bundle
		// https://github.com/rollup/rollup-plugin-node-resolve#usage
		// import node modules
		rollupPluginNodeResolve(),
		*/
		/*
		// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
		// import commonJs require;
		rollupPluginCommonJs({
			include: 'node_modules/**',
			exclude: ['node_modules/rxjs/**'],
		}),
		*/
		// Compile TypeScript files
		path.extname(item.input) === '.ts' ? rollupPluginTypescript2({
			typescript: typescript,
			tsconfigDefaults: tsconfigDefaults,
			tsconfig: 'tsconfig.json',
			tsconfigOverride: tsconfigOverride,
			rollupCommonJSResolveHack: true,
			clean: true,
			check: false,
		}) : null,
		true ? rollupPluginBabel({
			extensions: [
				...DEFAULT_EXTENSIONS,
				'.ts',
				'.tsx'
			],
			presets: [
				[babelPresetEnv, {
					modules: false,
					loose: true,
					targets: babelTargets
				}],
				// [babelPresetTypescript, { modules: false, loose: true }]
			],
			plugins: [
				'@babel/plugin-proposal-class-properties',
				'@babel/plugin-proposal-object-rest-spread'
			],
			exclude: 'node_modules/**', // only transpile our source code
			// babelrc: false,
		}) : null,
		true ? rollupPluginLicense({
			banner: `@license <%= pkg.name %> v<%= pkg.version %>
			(c) <%= moment().format('YYYY') %> <%= pkg.author %>
			License: <%= pkg.license %>`,
		}) : null,
	].filter(x => x);
	input = {
		input: item.input,
		plugins: plugins,
		external: item.external || [],
		/*
		watch: {
			include: watchGlob,
		},
		*/
	};
	return input;
}

function rollupOutput_(item) {
	const input = item.input;
	const output = item.output;
	const outputs = Array.isArray(output) ? output : [output];
	const default_ = {
		format: 'iife',
		name: item.name || null,
		globals: (typeof output === 'object' && output.globals) || item.globals || {},
		sourcemap: true,
		minify: item.minify || false,
	};
	return outputs.map(x => {
		let output = Object.assign({}, default_);
		if (typeof x === 'string') {
			output.file = x;
		} else if (typeof x === 'object') {
			output = Object.assign(output, x);
		}
		output.name = output.name || path.basename(output.file, '.js');
		/*
		const plugins = [
			path.extname(input) === '.ts' ? rollupPluginTypescript2({
				target: output.format === 'es' ? 'ESNext' : 'ES5',
				module: output.format === 'es' ? 'ES6' : 'ES5',
				moduleResolution: output.format === 'iife' ? 'classic' : 'node',
				declaration: true
			}) : null,
		].filter(x => x);
		output.plugins = plugins;
		*/
		let babelTargets;
		if (output.format === 'esm' || item.target === 'esm') {
			babelTargets = {
				"esmodules": true
			};
		} else {
			babelTargets = item.target;
		}
		output.plugins = [
			false ? rollupPluginBabel({
				extensions: [
					...DEFAULT_EXTENSIONS,
					'.ts',
					'.tsx'
				],
				presets: [
					[babelPresetEnv, {
						modules: false,
						loose: true,
						targets: babelTargets
					}],
					// [babelPresetTypescript, { modules: false, loose: true }]
				],
				plugins: [
					'@babel/plugin-proposal-class-properties',
					'@babel/plugin-proposal-object-rest-spread'
				],
				exclude: 'node_modules/**', // only transpile our source code
				// babelrc: false,
			}) : null,
			false ? rollupPluginLicense({
				banner: `@license <%= pkg.name %> v<%= pkg.version %>
				(c) <%= moment().format('YYYY') %> <%= pkg.author %>
				License: <%= pkg.license %>`,
			}) : null
		].filter(x => x);
		return output;
	});
}

module.exports = {
	rollup_,
	rollupInput_,
	rollupOutput_,
};
