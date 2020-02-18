export default class Test {

	constructor() {

		this.log('Test');

	}

	log(message) {
		console.log(message);
		const output = document.querySelector('.output');
		output.innerHTML = message;
	}

}

const test = new Test();
