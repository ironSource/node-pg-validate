var inherits = require('util').inherits
var AbstractTime = require('../abstract/Time')

module.exports = RSTime
inherits(RSTime, AbstractTime)

function RSTime() {
	if ( !(this instanceof RSTime) ) return new RSTime()
	AbstractTime.call(this)
}

RSTime.prototype.supportsNamedTimezones = function() {
  return false
}
