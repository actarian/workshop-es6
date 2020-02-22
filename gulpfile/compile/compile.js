const cssnano = require('cssnano'),
	gulpAutoprefixer = require('gulp-autoprefixer'),
	gulpConnect = require('gulp-connect'),
	gulpFilter = require('gulp-filter'),
	gulpHtmlExtend = require('gulp-html-extend'),
	gulpHtmlMin = require('gulp-htmlmin'),
	gulpIf = require('gulp-if'),
	gulpPlumber = require('gulp-plumber'),
	gulpPostcss = require('gulp-postcss'),
	gulpRename = require('gulp-rename'),
	gulpTerser = require('gulp-terser'),
	path = require('path');

const { dest, parallel, series, src, watch } = require('gulp');

const log = require('../logger/logger');
const tfsCheckout = require('../tfs/tfs');
const { sass } = require('./sass');

const { rollup, rollupInput, rollupOutput } = require('./rollup');
const { typescript, typescriptInput, typescriptOutput } = require('./typescript');

function compileScss(config, done) {
	const items = compiles(config, '.scss');
	const tasks = items.map(item => function itemTask() {
		return compileScssItem(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileScssItem(config, item) {
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(sass({
			includePaths: ['./node_modules/', __dirname + '/node_modules', 'node_modules'],
		}).on('compile:scss.error', (error) => {
			log.error('compile:scss', error);
		}))
		.pipe(gulpAutoprefixer())
		.pipe(gulpRename(item.output))
		.pipe(tfsCheckout(config))
		.pipe(dest('.', item.minify ? null : { sourcemaps: '.' }))
		.pipe(gulpFilter('**/*.css'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpIf(item.minify, gulpPostcss([
			// gulpAutoprefixer({browsers: ['last 1 version']}),
			cssnano()
		])))
		.pipe(gulpIf(item.minify, gulpRename({ extname: '.min.css' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpIf(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.css'))
		.pipe(gulpConnect.reload());
}

function compileJs(config, done) {
	const items = compiles(config, '.js');
	const tasks = items.map(item => function itemTask(done) {
		return compileJsItem(config, item, done);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileJsItem(config, item, done) {
	const tasks = [];
	const outputs = rollupOutput(item);
	outputs.forEach((output, i) => {
		// console.log(output);
		tasks.push(function itemTask(done) {
			const item_ = Object.assign({}, item, { output });
			// console.log('item_', item_);
			return compileRollup(config, item_);
		});
	});
	return tasks.length ? series(...tasks)(done) : done();
}

function compileTs(config, done) {
	const items = compiles(config, '.ts');
	const tasks = items.map(item => function itemTask(done) {
		return compileTsItem(config, item, done);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileTsItem(config, item, done) {
	const tasks = [];
	const outputs = typescriptOutput(item);
	outputs.forEach((output, i) => {
		// console.log(output);
		tasks.push(function itemTask(done) {
			const item_ = Object.assign({}, item, { output });
			// console.log('item_', item_);
			const output_ = typescriptOutput(item_)[0];
			switch (output_.format) {
				case 'iife':
				case 'umd':
					return compileRollup(config, item_);
					break;
				default:
					return compileTypescript(config, item_);
			}
			/*
			'iife': 'iife', // A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.)
			'umd': 'umd', // Universal Module Definition, works as amd, cjs and iife all in one
			'amd': 'amd', // Asynchronous Module Definition, used with module loaders like RequireJS
			'cjs': 'cjs', // CommonJS, suitable for Node and other bundlers
			'esm': 'esm', // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
			'system': 'system', // Native format of the SystemJS loader
			*/
			return compileTypescript(config, item_);
		});
	});
	return tasks.length ? series(...tasks)(done) : done();
}

function compileHtml(config, done) {
	const items = compiles(config, '.html');
	const tasks = items.map(item => function itemTask() {
		return compileHtmlItem(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function compileHtmlItem(config, item) {
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(gulpHtmlExtend({ annotations: true, verbose: false }))
		.pipe(gulpIf(item.minify, gulpHtmlMin({ collapseWhitespace: true })))
		.pipe(gulpRename(function(path) {
			return {
				dirname: item.output,
				basename: path.basename,
				extname: path.extname,
			};
		}))
		.pipe(tfsCheckout(config))
		.pipe(dest('.'))
		.on('end', () => log('Compile', item.output))
		.pipe(gulpConnect.reload());
}

function compileRollup(config, item) {
	const outputs = rollupOutput(item);
	const minify = item.minify;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(rollup(config, item))
		/*
		.pipe(gulpRename(function(file) {
			const output = outputs.find(x => {
				// console.log('file', x.file, file.basename, x.file.indexOf(file.basename));
				return x.file.indexOf(file.basename) !== -1;
			});
			file.dirname = path.dirname(output.file);
		}))
		*/
		.pipe(tfsCheckout(config))
		.pipe(dest('.', minify ? null : { sourcemaps: '.' }))
		.pipe(gulpFilter('**/*.js'))
		.on('end', () => log('Compile', outputs.map(x => x.file).join(', ')))
		.pipe(gulpIf(minify, gulpTerser()))
		.pipe(gulpIf(minify, gulpRename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !minify))
		.pipe(gulpIf(minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.js'))
		.pipe(gulpConnect.reload());
}

function compileTypescript(config, item) {
	const outputs = typescriptOutput(item);
	const minify = outputs[0].minify;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(typescript(config, item))
		/*
		// .pipe(gulpRename(item.output))
		.pipe(tfsCheckout(config))
		.pipe(dest('.', minify ? null : { sourcemaps: '.' }))
		*/
		.pipe(gulpFilter('**/*.js'))
		.on('end', () => log('Compile', outputs.map(x => x.file).join(', ')))
		/*
		.pipe(gulpIf(minify, gulpTerser()))
		.pipe(gulpIf(minify, gulpRename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !minify))
		.pipe(gulpIf(minify, dest('.', { sourcemaps: '.' })))
		*/
		.pipe(gulpFilter('**/*.js'))
		.pipe(gulpConnect.reload());
}

function compileWatcher(config) {
	const scss = watch(globs(config, '.scss'), function compileScss_(done) {
		compileScss(config, done);
	}).on('change', logWatch);
	const js = watch(globs(config, '.js'), function compileJs_(done) {
		compileJs(config, done);
	}).on('change', logWatch);
	const ts = watch(globs(config, '.ts'), function compileTs_(done) {
		compileTs(config, done);
	}).on('change', logWatch);
	const html = watch(globs(config, '.html'), function compileHtml_(done) {
		compileHtml(config, done);
	}).on('change', logWatch);
	return [scss, js, ts, html];
}

function compileCssWatcher(config) {
	const scss = watch(globs(config, '.scss'), function compileScss_(done) {
		compileScss(config, done);
	}).on('change', logWatch);
	return [scss];
}

function compileJsWatcher(config) {
	const js = watch(globs(config, '.js'), function compileJs_(done) {
		compileJs(config, done);
	}).on('change', logWatch);
	const ts = watch(globs(config, '.ts'), function compileTs_(done) {
		compileTs(config, done);
	}).on('change', logWatch);
	return [js, ts];
}

function logWatch(path, stats) {
	log('Changed', path);
}

function compiles(config, ext) {
	if (config) {
		return config.target.compile.filter((item) => {
			return new RegExp(`${ext}$`).test(item.input);
		});
	} else {
		return [];
	}
}

function globs(config, ext) {
	return compiles(config, ext).map(x => {
		return x.input.replace(/\/[^\/]*$/, '/**/*' + ext);
	});
}

module.exports = {
	compileScss,
	compileScssItem,
	compileJs,
	compileJsItem,
	compileTs,
	compileTsItem,
	compileHtml,
	compileWatcher,
	compileCssWatcher,
	compileJsWatcher
};
