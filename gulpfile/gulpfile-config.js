const path = require('path');
const { parallel, series } = require('gulp');
const { compile, compileScss, compileJs, compileTs, compileHtml } = require('./compile/compile');
const { bundle, bundleCss, bundleJs, bundleResource } = require('./bundle/bundle');
const { serve } = require('./serve/serve');
const { watchEntries, setEntry } = require('./watch/watch');

const log = require('./logger/logger');
const { service, CONFIG_PATH, getConfig } = require('./config/config');
let config = getConfig();

// COMPILE
const compileTask = parallel(compileScss, compileJs, compileTs, compileHtml); // compilePartials, compileSnippets

const compileCssTask = parallel(compileScss);

const compileJsTask = parallel(compileJs, compileTs);

// BUNDLE
const bundleTask = parallel(bundleCss, bundleJs, bundleResource);

// WATCH
function watchTask(done, filters) {
	setEntry(CONFIG_PATH, CONFIG_PATH);
	watchEntries((path_, entry, done) => {
		if (entry === CONFIG_PATH) {
			config = getConfig();
			return series(compileTask, bundleTask)(done);
		}
		config.target.compile.forEach(x => {
			// console.log(entry, x.input);
			if (entry.indexOf(x.input) !== -1) {
				const ext = path.extname(entry);
				if (!filters || filters.indexOf(ext) !== -1) {
					log('Watch', path_, '>', entry);
					// console.log('compile', ext, x);
					compile(x, ext, done);
				}
			}
		});
		config.target.bundle.forEach(x => {
			const inputs = Array.isArray(x.input) ? x.input : [x.input];
			const item = inputs.find(x => path_.indexOf(x) !== -1);
			if (item) {
				const ext = path.extname(entry);
				if (!filters || filters.indexOf(ext) !== -1) {
					log('Watch', path_, '>', entry);
					// console.log('bundle', ext, x);
					bundle(x, ext, done);
				}
			}
		});
	});
	return done();
}

function watchCssTask(done) {
	return watchTask(node, ['.scss', '.css']);
}

function watchJsTask(done) {
	return watchTask(node, ['.js', '.mjs', '.ts', '.tsx']);
}

/*
let watchers = [];

function watchAllTask(done) {
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
		return series(compileCssTask, bundleCss, watchCssTask)(done);
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
		return series(compileJsTask, bundleJs, watchTask)(done);
	});
	watchers = [].concat(compileJsWatcherSubTask, bJsWatcher, configWatcherTask);
	done();
}
*/

// SERVE

exports.compile = compileTask;
exports.bundle = bundleTask;
exports.watch = watchTask;
exports.serve = serve;
exports.build = series(compileTask, bundleTask);
exports.buildCss = series(compileCssTask, bundleCss);
exports.buildCssAndWatch = series(compileCssTask, bundleCss, watchCssTask);
exports.buildJs = series(compileJsTask, bundleJs);
exports.buildJsAndWatch = series(compileJsTask, bundleJs, watchJsTask);
exports.buildAndWatch = series(compileTask, bundleTask, watchTask);
exports.buildWatchAndServe = series(compileTask, bundleTask, watchTask, serve);
