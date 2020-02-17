/**
 * @license workshop-es6 v0.1.1
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

class Emitter {
  constructor(options) {
    if (options === void 0) {
      options = {};
    }

    Object.assign(this, options);
    this.events = {};
  }

  on(type, callback) {
    var event = this.events[type] = this.events[type] || [];
    event.push(callback);
    return () => {
      this.events[type] = event.filter(x => x !== callback);
    };
  }

  off(type, callback) {
    var event = this.events[type];

    if (event) {
      this.events[type] = event.filter(x => x !== callback);
    }
  }

  emit(type, data) {
    var event = this.events[type];

    if (event) {
      event.forEach(callback => {
        // callback.call(this, data);
        callback(data);
      });
    }

    var broadcast = this.events.broadcast;

    if (broadcast) {
      broadcast.forEach(callback => {
        callback(type, data);
      });
    }
  }

}

class Component extends Emitter {
  getNode() {
    if (typeof this.render === 'function') {
      var template = this.render();

      if (!template) {
        return;
      }

      var div = document.createElement("div");
      div.innerHTML = template;
      var node = div.firstElementChild;
      return node;
    }
  }

  setNode(node) {
    var template = this.getNode();

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

class ButtonComponent extends Component {
  onInit(node) {
    this.onClick = this.onClick.bind(this);
    var button = node.querySelector('.btn');
    button.addEventListener('click', this.onClick);
  }

  onDestroy(node) {
    var button = node.querySelector('.btn');
    button.removeEventListener('click', this.onClick);
  }

  onClick(event) {
    this.emit('click', event);
  }

  render() {
    return (
      /* html */
      "<div class=\"card--component\">\n\t\t\t<button type=\"button\" class=\"btn\">Click Me!</button>\n\t\t</div>"
    );
  }

}

class SimpleComponent extends Component {
  onInit(node) {
    node.innerHTML = "I'm a SimpleComponent!";
    console.log(node);
    node.classList.add('card--component', 'card--component-simple');
  }

}

class TemplateComponent extends Component {
  render() {
    return (
      /* html */
      "<div class=\"card--component\">\n\t\t\tI'm a TemplateComponent!\n\t\t</div>"
    );
  }

}

class Main {
  constructor() {
    var simpleComponents = this.addSimpleComponents();
    var templateComponents = this.addTemplateComponents();
    var buttonComponents = this.addButtonComponents();
    var components = this.addComponents();
  }

  addSimpleComponents() {
    var instances = Array.from(document.querySelectorAll('[simple-component]')).map(node => new SimpleComponent().setNode(node));
    console.log('Main.addSimpleComponents', instances);
    return instances;
  }

  addTemplateComponents() {
    var instances = Array.from(document.querySelectorAll('[template-component]')).map(node => new TemplateComponent().setNode(node));
    console.log('Main.addTemplateComponents', instances);
    return instances;
  }

  addButtonComponents() {
    var instances = Array.from(document.querySelectorAll('[button-component]')).map(node => {
      var instance = new ButtonComponent().setNode(node);
      instance.on('click', () => {
        alert('clicked');
      });
      return instance;
    });
    console.log('Main.addButtonComponents', instances);
    return instances;
  }

  addComponents() {
    var SELECTORS = {
      '[simple-component]': SimpleComponent,
      '[template-component]': TemplateComponent,
      '[button-component]': ButtonComponent
    };
    var instances = [];

    var _loop = function _loop(key) {
      instances = instances.concat(Array.from(document.querySelectorAll(key)).map(node => new SELECTORS[key]().setNode(node)));
    };

    for (var key in SELECTORS) {
      _loop(key);
    }

    console.log('Main.addComponents', instances);
    return instances;
  }

}
var main = new Main();

export default Main;
//# sourceMappingURL=main.es6.js.map
