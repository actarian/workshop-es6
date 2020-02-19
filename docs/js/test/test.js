/**
 * @license workshop-es6 v0.1.1
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

var value = 1;

class Test {
  constructor() {
    this.log(value);
  }

  log(message) {
    console.log(message);
    var output = document.querySelector('.output');
    output.innerHTML = message;
  }

}
var test = new Test();

export default Test;
//# sourceMappingURL=test.js.map
