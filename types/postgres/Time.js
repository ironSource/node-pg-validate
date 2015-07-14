var inherits = require('util').inherits
var AbstractTime = require('../abstract/Time')

module.exports = PGTime
inherits(PGTime, AbstractTime)

function PGTime() {
  if ( !(this instanceof PGTime) ) return new PGTime()
  AbstractTime.call(this)

  this.SPECIALS = this.SPECIALS.concat([
    'allballs'
  ])
}
