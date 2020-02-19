// es5
var myProp = 1;

//es6
const myProp = 1;

let myProp = 1;

// es5
function double(value) {
	value = value == undefined ? 1 : value;
	return value * 2;
}

// es6
function double(value = 1) {
	return value * 2;
}

// es5
var bindedFunction = function(value) {
	this.value = value;
}.bind(this);

// es6
const bindedFunction = (value) => {
	this.value = value;
};
