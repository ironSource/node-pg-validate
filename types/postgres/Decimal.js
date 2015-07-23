var Decimal = require('../abstract/Decimal')
var inherits = require('util').inherits

function PGDecimal(precision, scale, range) {
	if ( !(this instanceof PGDecimal) ) return new PGDecimal(precision, scale, range)

	// Per PostgreSQL 9.4
	this.MAX_SCALE = 16383
	this.MAX_WEIGHT = 131072
	this.MAX_PRECISION = this.MAX_WEIGHT + this.MAX_SCALE

	// For the sake of validation at least
	this.DEFAULT_PRECISION = this.MAX_PRECISION
	this.DEFAULT_SCALE = this.MAX_SCALE

	Decimal.call(this, precision, scale, range)
}

inherits(PGDecimal, Decimal)
module.exports = PGDecimal
