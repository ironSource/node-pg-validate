var SqlType = require('../../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Text

inherits(Text, SqlType)
function Text() {
	if ( !(this instanceof Text) ) return new Text()
	SqlType.call(this)
}

Text.prototype.isValidValue = function(value) {
	return typeof (value) === 'string'
}
