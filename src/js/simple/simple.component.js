import Component from "../component/component";

export default class SimpleComponent extends Component {

	onInit(node) {
		node.innerHTML = `I'm a SimpleComponent!`;
		node.classList.add('card--component', 'card--component-simple');
	}

}
