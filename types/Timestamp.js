var moment = require('moment-timezone');
var SqlType = require('../lib/SqlType')
var inherits = require('util').inherits

module.exports = Timestamp
inherits(Timestamp, SqlType)

const dateFormats = [
	moment.ISO_8601
]

function Timestamp() {
	if ( !(this instanceof Timestamp) ) return new Timestamp()
	SqlType.call(this)
}

Timestamp.prototype.isValidValue = function(value) {
	var m = moment(value, dateFormats, true) // strict
	return m.isValid()
}
