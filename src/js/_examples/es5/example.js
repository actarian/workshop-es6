function Example() {

	var self = this;

	var a = [1, 2, 3];
	this.log('array', a);

	a.push(1);
	a.push(2);
	a.push(3);
	this.log('push', a);

	a.forEach(function(x) {
		self.log('forEach', x);
	});

	a = a.map(function(x) {
		return x * 2;
	});
	this.log('map', a);

	a = a.filter(function(x) {
		return x === 4;
	});
	this.log('filter', a);

	var text = a.join(', ');
	this.log('join', text);

	const sum = a.reduce(function(previous, current, index) {
		return current + previous;
	}, 0);
	this.log('reduce', sum);

	var item = a.find(function(x) {
		return x === 4;
	});
	this.log('find', item);

}

Example.prototype = {
	log: function(action, value) {
		console.log(action, value);
		document.querySelector('.output').innerHTML += action + ': ' + value + '<br />';
	}
}

var example = new Example();
