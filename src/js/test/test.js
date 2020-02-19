import value from './module';

export default class Test {

	constructor() {

		this.log(value);

	}

	log(message) {
		console.log(message);
		const output = document.querySelector('.output');
		output.innerHTML = message;
	}

}

const test = new Test();
