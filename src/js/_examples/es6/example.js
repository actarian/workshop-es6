import { pippo } from './module';

export default class Example {

	constructor() {

		this.log('pippo', pippo);

		let a = [1, 2, 3];
		this.log('array', a);

		a.push(1);
		a.push(2);
		a.push(3);
		this.log('push', a);

		a.forEach(x => this.log('forEach', x));

		a = a.map(x => x * 2);
		this.log('map', a);

		a = a.filter(x => x === 4);
		this.log('filter', a);

		const text = a.join(', ');
		this.log('join', text);

		const sum = a.reduce((previous, current, index) => {
			return current + previous;
		}, 0);
		this.log('reduce', sum);

		const item = a.find(x => x === 4);
		this.log('find', item);

	}

	log(action, value) {
		console.log(action, value);
		// $('.output').html(value);
		document.querySelector('.output').innerHTML += `${action}: ${value}<br />`;
	}

}

const example = new Example();
