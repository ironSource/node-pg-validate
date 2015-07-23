var inherits = require('util').inherits
var AbstractTimestamp = require('../abstract/Timestamp')
var TimeType = require('./Time')
var DateType = require('./Date')

module.exports = PGTimestamp
inherits(PGTimestamp, AbstractTimestamp)

function PGTimestamp() {
  if ( !(this instanceof PGTimestamp) ) return new PGTimestamp()
  AbstractTimestamp.call(this, new TimeType(), new DateType())
}

PGTimestamp.prototype.isValidValue = function(value) {
  if (AbstractTimestamp.prototype.isValidValue.call(this, value)) return true

  // Support "January 8 04:05:06 1999 PST"
  return this._time.isValidValue(value, ["MMMM D HH:mm:ss YYYYZZ"])
}
