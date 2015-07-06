var SqlType = require('../lib/SqlType.js')
var inherits = require('util').inherits
var BigNumber = require('big-number').n

module.exports = Integer

inherits(Integer, SqlType)
function Integer(length) {
	if ( !(this instanceof Integer) ) return new Integer(length)
	SqlType.call(this)

	if (VALID_LENGTHS.indexOf(length) === -1) {
		throw new Error('invalid or unsupported length for integer')
	}
	
	this._length = INT_LENGTH[length]
}

Integer.prototype.isValidValue = function(value) {
	if (this._length.bigNumber) {
		// BigNumber accepts empty strings, we don't
		if (value === '') return false

		var b = BigNumber(value)
		return b.toString() !== "Invalid Number" && b.lte(this._length.max) && b.gte(this._length.min)
	}

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
	},
	'64bit': {
		bigNumber: true,
		min: BigNumber(2).pow(63).mult(-1), // -(2^63)
		max: BigNumber(2).pow(63).minus(1)  // 2^63 - 1
	}
}

var VALID_LENGTHS = Object.keys(INT_LENGTH)
