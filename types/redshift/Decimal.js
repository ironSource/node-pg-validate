var Decimal = require('../abstract/Decimal')
var inherits = require('util').inherits

function RSDecimal(precision, scale, range) {
	if ( !(this instanceof RSDecimal) ) return new RSDecimal(precision, scale, range)

	// Redshift supports numbers up to 128 bits.
	this.MAX_PRECISION = 38
	this.MAX_SCALE = this.MAX_PRECISION - 1

	// 64bit numbers. Applied if no precision was declared
	this.DEFAULT_PRECISION = 18
	this.DEFAULT_SCALE = 18

	Decimal.call(this, precision, scale, range)
}

inherits(RSDecimal, Decimal)
module.exports = RSDecimal
