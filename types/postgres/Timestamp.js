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
