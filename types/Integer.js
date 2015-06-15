var SqlType = require('../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Integer

inherits(Integer, SqlType)
function Integer(length) {
	if ( !(this instanceof Integer) ) return new Integer()
	SqlType.call(this)

	if (VALID_LENGTHS.indexOf(length) === -1) {
		throw new Error('invalid or unsupported length for integer')
	}
	
	this._length = INT_LENGTH[length]
}

Integer.prototype.isValidValue = function(value) {
	return typeof(value) === 'number' && value <= this._length.max && value >= this._length.min
}

var INT_LENGTH = {
	'16bit': {
		min: Math.pow(2, 15) * -1,
		max: Math.pow(2, 15) - 1
	},
	'32bit': {
		min: Math.pow(2, 31) * -1,
		max: Math.pow(2, 31) - 1
	}
}

var VALID_LENGTHS = Object.keys(INT_LENGTH)

var NUMERIC_TYPES = {
	int: '32bit',
	int4: '32bit',
	integer: '32bit',
	int2: '16bit',
	smallint: '16bit'
}