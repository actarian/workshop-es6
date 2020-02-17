import Component from "../component/component";

export default class ButtonComponent extends Component {

	onInit(node) {
		this.onClick = this.onClick.bind(this);
		const button = node.querySelector('.btn');
		button.addEventListener('click', this.onClick);
	}

	onDestroy(node) {
		const button = node.querySelector('.btn');
		button.removeEventListener('click', this.onClick);
	}

	onClick(event) {
		this.emit('click', event);
	}

	render() {
		return /* html */ `<div class="card--component">
			<button type="button" class="btn">Click Me!</button>
		</div>`;
	}

}
