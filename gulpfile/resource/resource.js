const gulpIf = require('gulp-if'),
	gulpPlumber = require('gulp-plumber'),
	gulpRename = require('gulp-rename');

const { dest, parallel, src, watch } = require('gulp');

const log = require('../logger/logger');
const { service } = require('../config/config');
const tfsCheckout = require('../tfs/tfs');
const { setEntry } = require('../watch/watch');

function resource(item, ext, done) {
	// console.log('resource', ext, item);
	let task;
	switch (ext) {
		default:
			task = resourceItemTask(item);
	}
	return task ? task : (typeof done === 'function' ? done() : null);
}

function resourceTask(done) {
	const items = resources(service.config);
	const tasks = items.map(item => function itemTask(done) {
		return resourceItemTask(item);
	});
	return tasks.length ? parallel(...tasks)(done) : done();
}

function resourceItemTask(item) {
	const skip = item.input.length === 1 && item.input[0] === item.output;
	return src(item.input, { base: '.', allowEmpty: true, sourcemaps: false })
		.pipe(gulpPlumber())
		.pipe(gulpRename({ dirname: item.output }))
		.pipe(gulpIf(!skip, dest('.')))
		.pipe(tfsCheckout(skip))
		.on('end', () => log('Bundle', item.output));
}

function resources() {
	if (service.config) {
		return service.config.resource || [];
	} else {
		return [];
	}
}

module.exports = {
	resource,
	resourceTask,
	resourceItemTask,
	resources,
};
