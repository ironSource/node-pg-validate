var moment = require('moment-timezone');
var SqlType = require('../../lib/SqlType')
var inherits = require('util').inherits

module.exports = DateType
inherits(DateType, SqlType)

const FORMATS = [
	"MMMM D, YYYY",
	"YYYYMMDD",
	"YYYY-MM-DD",
	"YYYY-MMM-DD",
	"DD-MMM-YYYY",
	"YYMMDD",
	"YYYY.DDD",
	"MMM-DD-YYYY"
]

const SPECIALS = [
	'now',
	'today',
	'tomorrow',
	'yesterday'
]

function DateType() {
	if ( !(this instanceof DateType) ) return new DateType()
	SqlType.call(this)

	this.FORMATS = FORMATS
	this.SPECIALS = SPECIALS
}

DateType.prototype.isValidValue = function(value) {
	if (typeof value !== 'string') return false
	if (this.isValidSpecial(value)) return true

	var m = moment(value, this.FORMATS, true) // strict
	return m.isValid()
}

DateType.prototype.isValidSpecial = function(value) {
	return this.SPECIALS.indexOf(value) >= 0
}
