var inherits = require('util').inherits
var AbstractTimestamp = require('../abstract/Timestamp')
var TimeType = require('./Time')
var DateType = require('./Date')

module.exports = RSTimestamp
inherits(RSTimestamp, AbstractTimestamp)

function RSTimestamp() {
	if ( !(this instanceof RSTimestamp) ) return new RSTimestamp()
	AbstractTimestamp.call(this, new TimeType(), new DateType())
}
