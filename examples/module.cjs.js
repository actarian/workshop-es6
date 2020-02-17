const fs = require('fs');
const log = require('./logger');

function getObject(file) {
	if (fs.existsSync(file)) {
		const text = fs.readFileSync(file, 'utf8');
		return JSON.parse(text);
	} else {
		log.warn(`missing ${file}`);
	}
}

module.exports = {
	getObject: getObject,
};
