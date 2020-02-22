const path = require('path');
const { parallel, series } = require('gulp');
const { compileScss, compileJs, compileTs, compileHtml, compileWatcher, compileCssWatcher, compileJsWatcher } = require('./compile/compile');
const { bundleCss, bundleJs, bundleResource, bundleWatcher, bundleCssWatcher, bundleJsWatcher } = require('./bundle/bundle');
const { serve } = require('./serve/serve');
const { getConfig, configWatcher } = require('./config/config');
const { watchEntries } = require('./watch/watch');

let config = getConfig();

// COMPILERS
function compileScssSubTask(done) {
	return compileScss(config, done);
}

function compileJsSubTask(done) {
	return compileJs(config, done);
}

function compileTsSubTask(done) {
	return compileTs(config, done);
}

function compileHtmlSubTask(done) {
	return compileHtml(config, done);
}

const compileTask = parallel(compileScssSubTask, compileJsSubTask, compileTsSubTask, compileHtmlSubTask); // compilePartials, compileSnippets

const compileCssTask = parallel(compileScssSubTask);

const compileJsTask = parallel(compileJsSubTask, compileTsSubTask);

// BUNDLERS
function bundleCssTask(done) {
	return bundleCss(config, done);
}

function bundleJsTask(done) {
	return bundleJs(config, done);
}

function bundleResourceTask(done) {
	return bundleResource(config, done);
}

const bundleTask = parallel(bundleCssTask, bundleJsTask, bundleResourceTask);

// WATCH

const watchTask = false ? watchTask_1 : watchTask_2;

function watchTask_1(done) {
	watchEntries((entry, done) => {
		config.target.compile.forEach(x => {
			if (entry.indexOf(x.input) !== -1) {
				const ext = path.extname(entry);
				console.log('compile', ext, x);
			}
		});
		config.target.bundle.forEach(x => {
			if (entry.indexOf(x.output) !== -1) {
				const ext = path.extname(entry);
				console.log('bundle', ext, x);
			}
		});
	});
	return done();
}

let watchers = [];

function watchTask_2(done) {
	while (watchers.length) {
		const w = watchers.shift();
		if (typeof w.close === 'function') {
			w.close();
		}
	}
	const compileWatcherTask = compileWatcher(config);
	const bundleWatcherTask = bundleWatcher(config);
	const configWatcherTask = configWatcher(function(done) {
		config = getConfig();
		return series(compileTask, bundleTask, watchTask)(done);
	});
	watchers = [].concat(compileWatcherTask, bundleWatcherTask, configWatcherTask);
	done();
}

function watchCssTask(done) {
	while (watchers.length) {
		const w = watchers.shift();
		if (typeof w.close === 'function') {
			w.close();
		}
	}
	const compileCssWatcherTask = compileCssWatcher(config);
	const bundleCssWatcherTask = bundleCssWatcher(config);
	const configWatcherTask = configWatcher(function(done) {
		return series(compileCssTask, bundleCssTask, watchCssTask)(done);
	});
	watchers = [].concat(compileCssWatcherTask, bundleCssWatcherTask, configWatcherTask);
	done();
}

function watchJsTask(done) {
	while (watchers.length) {
		const w = watchers.shift();
		if (typeof w.close === 'function') {
			w.close();
		}
	}
	const compileJsWatcherSubTask = compileJsWatcher(config);
	const bJsWatcher = bundleJsWatcher(config);
	const configWatcherTask = configWatcher(function(done) {
		return series(compileJsTask, bundleJsTask, watchTask)(done);
	});
	watchers = [].concat(compileJsWatcherSubTask, bJsWatcher, configWatcherTask);
	done();
}

// SERVE
function serveTask(done) {
	return serve(config, done);
}

// UTILS
/*
function watchAll() {
	watch(['***.*', '!node_modules***.*'], function watch(done) {
		done();
	}).on('change', (path) => {
		logWatch(...arguments);
	});
}

function logWatch(path, stats) {
	log('Changed', path);
}
*/

exports.compile = compileTask;
exports.bundle = bundleTask;
exports.watch = watchTask;
exports.serve = serveTask;
exports.build = series(compileTask, bundleTask);
exports.buildCss = series(compileCssTask, bundleCssTask);
exports.buildCssAndWatch = series(compileCssTask, bundleCssTask, watchCssTask);
exports.buildJs = series(compileJsTask, bundleJsTask);
exports.buildJsAndWatch = series(compileJsTask, bundleJsTask, watchJsTask);
exports.buildAndWatch = series(compileTask, bundleTask, watchTask);
exports.buildWatchAndServe = series(compileTask, bundleTask, watchTask, serveTask);
