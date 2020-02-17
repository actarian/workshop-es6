import SimpleComponent from './simple/simple.component';

export default class Main {

	constructor() {

		const instances = Array.from(document.querySelectorAll('[simple-component]'))
			.map(node => new SimpleComponent().setNode(node));

	}

}

const main = new Main();
