var isValidInterval = require('./Interval-asm').cwrap('isValidInterval', 'boolean', ['string'])
var SqlType = require('../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Interval

inherits(Interval, SqlType)
function Interval() {
  if ( !(this instanceof Interval) ) return new Interval()
  SqlType.call(this)
}

Interval.prototype.isValidValue = function(value) {
  if (typeof value !== 'string' || value === '') return false
  return !!isValidInterval(value)
}
