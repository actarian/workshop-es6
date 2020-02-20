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
    return "<div class=\"card--component\">\n\t\t\tI'm a ButtonComponent!<br />\n\t\t\t<button type=\"button\" class=\"btn\">Click Me!</button>\n\t\t</div>";
  }

}

class SimpleComponent extends Component {
  onInit(node) {
    node.innerHTML = "I'm a SimpleComponent!";
    node.classList.add('card--component', 'card--component-simple');
  }

}

class TemplateComponent extends Component {
  render() {
    return "<div class=\"card--component\">\n\t\t\tI'm a TemplateComponent!\n\t\t</div>";
  }

}

class Main {
  constructor() {
    var components = this.addComponents();
  }

  addComponents() {
    var SELECTORS = {
      '[simple-component]': SimpleComponent,
      '[template-component]': TemplateComponent,
      '[button-component]': ButtonComponent
    };
    var instances = [];

    var _loop = function _loop(key) {
      instances = instances.concat(Array.from(document.querySelectorAll(key)).map(node => {
        var instance = new SELECTORS[key]().setNode(node);
        instance.on('click', () => {
          alert('clicked');
        });
        return instance;
      }));
    };

    for (var key in SELECTORS) {
      _loop(key);
    }

    instances.forEach(x => console.log(x));
    return instances;
  }

}
var main = new Main();

export default Main;
//# sourceMappingURL=main_es6_esm.js.map
