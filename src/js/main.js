import ButtonComponent from './button/button.component';
import SimpleComponent from './simple/simple.component';
import TemplateComponent from './template/template.component';

export default class Main {

	constructor() {
		const components = this.addComponents();

		// const simpleComponents = this.addSimpleComponents();
		// const templateComponents = this.addTemplateComponents();
		// const buttonComponents = this.addButtonComponents();
	}

	addComponents() {
		const SELECTORS = {
			'[simple-component]': SimpleComponent,
			'[template-component]': TemplateComponent,
			'[button-component]': ButtonComponent,
		};
		let instances = [];
		for (let key in SELECTORS) {
			instances = instances.concat(Array.from(document.querySelectorAll(key))
				.map(node => {
					const instance = new SELECTORS[key]().setNode(node);
					instance.on('click', () => {
						alert('clicked');
					});
					return instance;
				}));
		}
		instances.forEach(x => console.log(x));
		return instances;
	}

	/*
	addSimpleComponents() {
		const instances = Array.from(document.querySelectorAll('[simple-component]'))
			.map(node => new SimpleComponent().setNode(node));
		console.log('Main.addSimpleComponents', instances);
		return instances;
	}

	addTemplateComponents() {
		const instances = Array.from(document.querySelectorAll('[template-component]'))
			.map(node => new TemplateComponent().setNode(node));

		console.log('Main.addTemplateComponents', instances);
		return instances;
	}

	addButtonComponents() {
		const instances = Array.from(document.querySelectorAll('[button-component]'))
			.map(node => {
				const instance = new ButtonComponent().setNode(node);
				instance.on('click', () => {
					alert('clicked');
				});
				return instance;
			});

		console.log('Main.addButtonComponents', instances);
		return instances;
	}
	*/

}

const main = new Main();
