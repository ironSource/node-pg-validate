var moment = require('moment-timezone');
var SqlType = require('../lib/SqlType')
var inherits = require('util').inherits
var PGDate = require('./Date')
var Time = require('./Time')

module.exports = Timestamp
inherits(Timestamp, SqlType)

function Timestamp() {
	if ( !(this instanceof Timestamp) ) return new Timestamp()
	SqlType.call(this)

	this._time = new Time()
}

Timestamp.prototype.isValidValue = function(value) {
	if (typeof value !== 'string') return false

	// A timestamp is a concatenated Date and Time
	var parts = value.split(' ')

	for (var i = 0, l = formatsBySpace.length; i < l; i++) {
		var formats = formatsBySpace[i]
		var subvalue = parts.slice(0, i + 1).join(' ')

		if (moment(subvalue, formats, true).isValid()) {
			var remainder = value.slice(subvalue.length).trim()

			// Date without time is valid.
			if (!remainder.length) return true

			if (this._time.isValidValue(remainder)) return true
		}
	}

	return false
}

var formatsBySpace = [ [], [], [] ]

PGDate.FORMATS.forEach(function(fmt){
	var numSpaces = fmt.split(' ').length - 1
	formatsBySpace[numSpaces].push(fmt)
})
