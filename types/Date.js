var moment = require('moment-timezone');
var SqlType = require('../lib/SqlType')
var inherits = require('util').inherits

module.exports = PGDate
inherits(PGDate, SqlType)

const dateFormats = PGDate.FORMATS = [
	"MMMM D, YYYY",
	"YYYYMMDD",
	"YYYY-MM-DD",
	"YYYY-MMM-DD",
	"DD-MMM-YYYY",
	"YYMMDD",
	"YYYY.DDD"
]

function PGDate() {
	if ( !(this instanceof PGDate) ) return new PGDate()
	SqlType.call(this)
}

PGDate.prototype.isValidValue = function(value) {
	if (typeof value !== 'string') return false
	var m = moment(value, dateFormats, true) // strict
	return m.isValid()
}
