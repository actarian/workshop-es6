/**
 * @license workshop-es6 v0.1.1
 * (c) 2020 Luca Zampetti <lzampetti@gmail.com>
 * License: MIT
 */

var pippo = 2;

class Example {
  constructor() {
    this.log('pippo', pippo);
    var a = [1, 2, 3];
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
    var text = a.join(', ');
    this.log('join', text);
    var sum = a.reduce((previous, current, index) => {
      return current + previous;
    }, 0);
    this.log('reduce', sum);
    var item = a.find(x => x === 4);
    this.log('find', item);
  }

  log(action, value) {
    console.log(action, value); // $('.output').html(value);

    document.querySelector('.output').innerHTML += action + ": " + value + "<br />";
  }

}
var example = new Example();

export default Example;
//# sourceMappingURL=example.js.map
