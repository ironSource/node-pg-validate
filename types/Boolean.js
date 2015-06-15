var SqlType = require('../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Boolean

inherits(Boolean, SqlType)
function Boolean() {
	if ( !(this instanceof Boolean) ) return new Boolean()
	SqlType.call(this)
}

Boolean.prototype.isValidValue = function(value) {
	return BOOLEAN_VALUES.indexOf(value) > -1
}

var BOOLEAN_VALUES = ['TRUE', 'FALSE', 't', 'f', 'true', 'false', 'y', 'n', 'yes', 'no', 'on', 'off', '1', '0', true, false, 1, 0]
