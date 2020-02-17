/**
 * @license workshop-es6 v0.1.1
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

var main_es5_iife = (function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var Emitter =
  /*#__PURE__*/
  function () {
    function Emitter(options) {
      if (options === void 0) {
        options = {};
      }

      Object.assign(this, options);
      this.events = {};
    }

    var _proto = Emitter.prototype;

    _proto.on = function on(type, callback) {
      var _this = this;

      var event = this.events[type] = this.events[type] || [];
      event.push(callback);
      return function () {
        _this.events[type] = event.filter(function (x) {
          return x !== callback;
        });
      };
    };

    _proto.off = function off(type, callback) {
      var event = this.events[type];

      if (event) {
        this.events[type] = event.filter(function (x) {
          return x !== callback;
        });
      }
    };

    _proto.emit = function emit(type, data) {
      var event = this.events[type];

      if (event) {
        event.forEach(function (callback) {
          // callback.call(this, data);
          callback(data);
        });
      }

      var broadcast = this.events.broadcast;

      if (broadcast) {
        broadcast.forEach(function (callback) {
          callback(type, data);
        });
      }
    };

    return Emitter;
  }();

  var Component =
  /*#__PURE__*/
  function (_Emitter) {
    _inheritsLoose(Component, _Emitter);

    function Component() {
      return _Emitter.apply(this, arguments) || this;
    }

    var _proto = Component.prototype;

    _proto.getNode = function getNode() {
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
    };

    _proto.setNode = function setNode(node) {
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
    };

    _proto.destroy = function destroy() {
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
    ;

    return Component;
  }(Emitter);

  var ButtonComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(ButtonComponent, _Component);

    function ButtonComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = ButtonComponent.prototype;

    _proto.onInit = function onInit(node) {
      this.onClick = this.onClick.bind(this);
      var button = node.querySelector('.btn');
      button.addEventListener('click', this.onClick);
    };

    _proto.onDestroy = function onDestroy(node) {
      var button = node.querySelector('.btn');
      button.removeEventListener('click', this.onClick);
    };

    _proto.onClick = function onClick(event) {
      this.emit('click', event);
    };

    _proto.render = function render() {
      return (
        /* html */
        "<div class=\"card--component\">\n\t\t\tI'm a ButtonComponent!<br />\n\t\t\t<button type=\"button\" class=\"btn\">Click Me!</button>\n\t\t</div>"
      );
    };

    return ButtonComponent;
  }(Component);

  var SimpleComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(SimpleComponent, _Component);

    function SimpleComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = SimpleComponent.prototype;

    _proto.onInit = function onInit(node) {
      node.innerHTML = "I'm a SimpleComponent!";
      node.classList.add('card--component', 'card--component-simple');
    };

    return SimpleComponent;
  }(Component);

  var TemplateComponent =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(TemplateComponent, _Component);

    function TemplateComponent() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = TemplateComponent.prototype;

    _proto.render = function render() {
      return (
        /* html */
        "<div class=\"card--component\">\n\t\t\tI'm a TemplateComponent!\n\t\t</div>"
      );
    };

    return TemplateComponent;
  }(Component);

  var Main =
  /*#__PURE__*/
  function () {
    function Main() {
      var simpleComponents = this.addSimpleComponents();
      var templateComponents = this.addTemplateComponents();
      var buttonComponents = this.addButtonComponents();
      var components = this.addComponents();
    }

    var _proto = Main.prototype;

    _proto.addSimpleComponents = function addSimpleComponents() {
      var instances = Array.from(document.querySelectorAll('[simple-component]')).map(function (node) {
        return new SimpleComponent().setNode(node);
      });
      console.log('Main.addSimpleComponents', instances);
      return instances;
    };

    _proto.addTemplateComponents = function addTemplateComponents() {
      var instances = Array.from(document.querySelectorAll('[template-component]')).map(function (node) {
        return new TemplateComponent().setNode(node);
      });
      console.log('Main.addTemplateComponents', instances);
      return instances;
    };

    _proto.addButtonComponents = function addButtonComponents() {
      var instances = Array.from(document.querySelectorAll('[button-component]')).map(function (node) {
        var instance = new ButtonComponent().setNode(node);
        instance.on('click', function () {
          alert('clicked');
        });
        return instance;
      });
      console.log('Main.addButtonComponents', instances);
      return instances;
    };

    _proto.addComponents = function addComponents() {
      var SELECTORS = {
        '[simple-component]': SimpleComponent,
        '[template-component]': TemplateComponent,
        '[button-component]': ButtonComponent
      };
      var instances = [];

      var _loop = function _loop(key) {
        instances = instances.concat(Array.from(document.querySelectorAll(key)).map(function (node) {
          return new SELECTORS[key]().setNode(node);
        }));
      };

      for (var key in SELECTORS) {
        _loop(key);
      }

      console.log('Main.addComponents', instances);
      return instances;
    };

    return Main;
  }();
  var main = new Main();

  return Main;

}());
//# sourceMappingURL=main_es5_iife.js.map
