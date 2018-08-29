var SqlType = require('../../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Uuid

inherits(Uuid, SqlType)
function Uuid() {
	if ( !(this instanceof Uuid) ) return new Uuid()
	SqlType.call(this)
}

Uuid.prototype.isValidValue = function(value) {
	return typeof (value) === 'string' && /[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/i.test(value)
}
