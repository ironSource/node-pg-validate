var moment = require('moment-timezone');
var SqlType = require('../../lib/SqlType')
var inherits = require('util').inherits

module.exports = Timestamp
inherits(Timestamp, SqlType)

function Timestamp(timeType, dateType) {
	if ( !(this instanceof Timestamp) ) return new Timestamp(timeType, dateType)
	SqlType.call(this)

	this._time = timeType
	this._date = dateType

	this._formatsBySpace = [ [], [], [] ]
	this._date.FORMATS.forEach(function(fmt){
		var numSpaces = fmt.split(' ').length - 1
		this._formatsBySpace[numSpaces].push(fmt)
	}, this)
}

Timestamp.prototype.isValidValue = function(value) {
	if (typeof value !== 'string') return false
	if (this._date.isValidSpecial(value)) return true

	// A timestamp is a concatenated Date and Time
	var parts = value.split(' ')

	for (var i = 0, l = this._formatsBySpace.length; i < l; i++) {
		var formats = this._formatsBySpace[i]
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
