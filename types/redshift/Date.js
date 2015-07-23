var inherits = require('util').inherits
var AbstractDate = require('../abstract/Date')

module.exports = RSDate
inherits(RSDate, AbstractDate)

function RSDate() {
	if ( !(this instanceof RSDate) ) return new RSDate()
	AbstractDate.call(this)

	this.FORMATS = this.FORMATS.concat([
		// Redshift only (supported by PostgreSQL, but ambiguously)
		"M/D/YYYY",
		"MM/DD/YY"
	])
}
