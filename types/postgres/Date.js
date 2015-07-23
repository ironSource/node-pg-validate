var inherits = require('util').inherits
var AbstractDate = require('../abstract/Date')

module.exports = PGDate
inherits(PGDate, AbstractDate)

function PGDate() {
	if ( !(this instanceof PGDate) ) return new PGDate()
	AbstractDate.call(this)

	this.SPECIALS = this.SPECIALS.concat([
		'epoch',
		'infinity',
		'-infinity'
	])
}
