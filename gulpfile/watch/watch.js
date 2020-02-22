const { watch } = require('gulp');

const log = require('../logger/logger');

const entries = {};

const cwd = process.cwd();

function setEntry(entry, imports) {
	// console.log(entry, imports);
	imports = Array.isArray(imports) ? imports : [imports];
	entry = entry.replace(cwd, '');
	imports = imports.map(x => x.replace(cwd, ''));
	entries[entry] = imports;
	// log('watch', entry, imports);
}

let watcher;

function watchEntries(callback) {
	if (watcher && typeof watcher.close === 'function') {
		watcher.close();
	}
	let complete;
	watcher = watch(['**/*.*', '!node_modules/**/*.*'], function watch(done) {
		complete = done;
		// console.log('done');
	}).on('change', (path) => {
		const entry = Object.keys(entries).reduce((p, key) => {
			const imports = entries[key];
			const found = imports.find(i => {
				// console.log(i, path);
				return i.indexOf(path) !== -1;
			}) || key.indexOf(path) !== -1;
			if (found) {
				return key;
			} else {
				return p;
			}
		}, null);
		if (entry) {
			console.log('entry', entry);
			log('watch.changed', path, '>', entry);
			if (typeof callback === 'function') {
				callback(entry, complete);
			}
		} else {
			if (typeof complete === 'function') {
				return complete();
			}
			// console.log('change');
		}
	});
}

module.exports = {
	setEntry,
	watchEntries
};
