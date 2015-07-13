var SqlType = require('../lib/SqlType.js')
var inherits = require('util').inherits
var BigNumber = require('bignumber.js').another({ ERRORS: false })

module.exports = Integer

inherits(Integer, SqlType)
function Integer(range) {
	if ( !(this instanceof Integer) ) return new Integer(range)
	SqlType.call(this)

	if (VALID_RANGES.indexOf(range) === -1) {
		throw new Error('invalid or unsupported range')
	}

	this._range = Integer.RANGE[range]
}

Integer.prototype.isValidValue = function(value) {
	if (this._range.bigNumber) {
		// BigNumber accepts empty strings, we don't
		if (value === '') return false

		var b = new BigNumber(value)
		return !b.isNaN() && b.lte(this._range.max) && b.gte(this._range.min)
	}

	return typeof(value) === 'number' && value <= this._range.max && value >= this._range.min
}

Integer.RANGE = {
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
		min: (new BigNumber(2)).pow(63).times(-1), // -(2^63)
		max: (new BigNumber(2)).pow(63).minus(1)  // 2^63 - 1
	},
	'128bit': {
		bigNumber: true,
		min: (new BigNumber(2)).pow(127).times(-1),
		max: (new BigNumber(2)).pow(127).minus(1)
	},
	'1024bit': {
		bigNumber: true,
		min: (new BigNumber(2)).pow(1023).times(-1),
		max: (new BigNumber(2)).pow(1023).minus(1)
	},
	'serial': {
		min: 1,
		max: Math.pow(2, 31) - 1
	},
	'bigserial': {
		bigNumber: true,
		min: 1,
		max: (new BigNumber(2)).pow(63).minus(1)
	}
}

var VALID_RANGES = Object.keys(Integer.RANGE)
