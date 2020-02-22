const cssnano = require('cssnano'),
	gulpFilter = require('gulp-filter'),
	gulpIf = require('gulp-if'),
	gulpPlumber = require('gulp-plumber'),
	gulpPostcss = require('gulp-postcss'),
	gulpRename = require('gulp-rename'),
	gulpTerser = require('gulp-terser'),
	gulpConcat = require('gulp-concat');

const { dest, parallel, src, watch } = require('gulp');

const log = require('../logger/logger');
const tfsCheckout = require('../tfs/tfs');
const { setEntry } = require('../watch/watch');

// BUNDLE CSS
function bundleCss(config, done) {
	const items = bundles(config, '.css');
	const tasks = items.map(item => function itemTask(done) {
		setEntry(item.output, item.input);
		return bundleCssItem(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleCssItem(config, item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	const plugins = [
		// autoprefixer({browsers: ['last 1 version']}),
		cssnano()
	];
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(gulpIf(!skip, gulpConcat(item.output)))
		.pipe(tfsCheckout(config, skip))
		.pipe(gulpIf(!skip, dest('.')))
		.on('end', () => log('Bundle', item.output))
		.pipe(gulpIf(item.minify, gulpPostcss(plugins)))
		.pipe(gulpIf(item.minify, gulpRename({ extname: '.min.css' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpIf(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.css'));
}

// BUNDLE JS
function bundleJs(config, done) {
	const items = bundles(config, '.js');
	const tasks = items.map(item => function itemTask(done) {
		setEntry(item.output, item.input);
		return bundleJsItem(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleJsItem(config, item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: true })
		.pipe(gulpPlumber())
		.pipe(gulpIf(!skip, gulpConcat(item.output)))
		.pipe(tfsCheckout(config, skip))
		.pipe(gulpIf(!skip, dest('.')))
		.on('end', () => log('Bundle', item.output))
		.pipe(gulpIf(item.minify, gulpTerser()))
		.pipe(gulpIf(item.minify, gulpRename({ extname: '.min.js' })))
		.pipe(tfsCheckout(config, !item.minify))
		.pipe(gulpIf(item.minify, dest('.', { sourcemaps: '.' })))
		.pipe(gulpFilter('**/*.js'));
}

// BUNDLE RESOURCE
function bundleResource(config, done) {
	const items = resources(config);
	const tasks = items.map(item => function itemTask(done) {
		return bundleResourceItem(config, item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function bundleResourceItem(config, item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: false })
		.pipe(gulpPlumber())
		.pipe(gulpRename({ dirname: item.output }))
		.pipe(gulpIf(!skip, dest('.')))
		.pipe(tfsCheckout(config, skip))
		.on('end', () => log('Bundle', item.output));
}

function bundleWatcher(config) {
	const css = bundles(config, '.css').map((item) => {
		return watch(item.input, function bundleCss_(done) {
			return bundleCssItem(config, item);
		}).on('change', logWatch);
	});
	const js = bundles(config, '.js').map((item) => {
		return watch(item.input, function bundleJs_(done) {
			return bundleJsItem(config, item);
		}).on('change', logWatch);
	});
	const resource = resources(config).map((item) => {
		return watch(item.input, function bundleResource_(done) {
			return bundleResourceItem(config, item);
		}).on('change', logWatch);
	});
	return [css, js, resource];
}

function bundleCssWatcher(config) {
	const css = bundles(config, '.css').map((item) => {
		return watch(item.input, function bundleCss_(done) {
			return bundleCssItem(config, item);
		}).on('change', logWatch);
	});
	return [css];
}

function bundleJsWatcher(config) {
	const js = bundles(config, '.js').map((item) => {
		return watch(item.input, function bundleJs_(done) {
			return bundleJsItem(config, item);
		}).on('change', logWatch);
	});
	return [js];
}

function logWatch(path, stats) {
	log('Changed', path);
}

function bundles(config, ext) {
	if (config.target) {
		return config.target.bundle.filter((item) => {
			if (ext && item.output) {
				return new RegExp(`${ext}$`).test(item.output);
			} else {
				return ext === 'resource' && !item.output;
			}
		});
	} else {
		return [];
	}
}

function resources(config) {
	if (config.target) {
		return config.target.resource || [];
	} else {
		return [];
	}
}

module.exports = {
	bundleCss,
	bundleCssItem,
	bundleJs,
	bundleJsItem,
	bundleResource,
	bundleResourceItem,
	bundles,
	resources,
	bundleWatcher,
	bundleCssWatcher,
	bundleJsWatcher
};
