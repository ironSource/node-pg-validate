var SqlType = require('../../lib/SqlType')
var inherits = require('util').inherits
var BigNumber = require('bignumber.js').another({ ERRORS: false })
var Integer = require('../Integer')

module.exports = Decimal
inherits(Decimal, SqlType)

function Decimal(precision, scale, range) {
	if ( !(this instanceof Decimal) ) return new Decimal(precision, scale, range)
	SqlType.call(this)

	if (precision != null) {
		if (scale == null) scale = 0
		this.assertValidPrecision(precision)
		this.assertValidScale(scale, precision)
	} else if (scale != null) {
		throw new Error('cannot declare scale without precision')
	} else {
		precision = this.DEFAULT_PRECISION
		scale = this.DEFAULT_SCALE
	}

	if (range != null) this._range = new Integer(range)

	this._precision = precision
	this._scale = scale
}

Decimal.prototype.isValidValue = function(value) {
	if (typeof value !== 'number' && typeof value !== 'string') {
		return false
	}

	var b = new BigNumber(value)
	if (b.isNaN()) return false

	var parts = b.abs().toString(10).split('.')
		, left = parts[0] === '0' ? '' : parts[0]
		, right = parts[1] || ''
		, weight = left.length

	if (this._range != null && !this._range.isValidValue(value)) {
		return false
	}

	if (this.MAX_WEIGHT != null && weight > this.MAX_WEIGHT) {
		return false
	}

	// Coerce scale, then count digits
	var scale = Math.min(right.length, this._scale)
	var precision = weight + scale

	return precision <= this._precision
}

Decimal.prototype.assertValidScale = function(scale, precision) {
	if (scale > precision) {
		throw new Error('scale must be less than or equal to precision')
	}

	if (scale < 0) {
		throw new Error('scale must be zero or positive')
	}

	if (scale > this.MAX_SCALE) {
		throw new Error('scale exceeds maximum of ' + this.MAX_SCALE)
	}
}

Decimal.prototype.assertValidPrecision = function(precision) {
	if (precision <= 0) {
		throw new Error('precision must be positive')
	}

	if (precision > this.MAX_PRECISION) {
		throw new Error('precision exceeds maximum of ' + this.MAX_PRECISION)
	}
}
