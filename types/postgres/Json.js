var SqlType = require('../../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Json

inherits(Json, SqlType)
function Json() {
	if ( !(this instanceof Json) ) return new Json()
	SqlType.call(this)
}

Json.prototype.isValidValue = function(value) {
	if (typeof (value) !== 'string') {
		return false
	}

	try {
		JSON.parse(value)
		return true
	} catch (e) {
		return false
	}
}
