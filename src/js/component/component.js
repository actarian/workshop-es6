import Emitter from "../emitter/emitter";

export default class Component extends Emitter {

	getNode() {
		if (typeof this.render === 'function') {
			const template = this.render();
			if (!template) {
				return;
			}
			const div = document.createElement("div");
			div.innerHTML = template;
			const node = div.firstElementChild;
			return node;
		}
	}

	setNode(node) {
		const template = this.getNode();
		if (template) {
			node.parentNode.replaceChild(template, node);
			node = template;
		}
		this.node = node;
		if (typeof this.onInit === 'function') {
			this.onInit(this.node);
		}
		return this;
	}

	destroy() {
		if (typeof this.onDestroy === 'function') {
			this.onDestroy(this.node);
		}
	}

	/*
	render() {
		return `<div class="card--component">
			I'm an ES6 component!
		</div>`;
	}
	*/
}
