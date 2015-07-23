var SqlType = require('../lib/SqlType.js')
var inherits = require('util').inherits

module.exports = Char

inherits(Char, SqlType)
function Char(length) {
	if ( !(this instanceof Char) ) return new Char(length)
	SqlType.call(this)

	if (typeof (length) !== 'number') {
		throw new Error('invalid length, number is required')
	}

	if (length < 1) {
		throw new Error('invalid length must be greater than 0')
	}

	this._length = length
}

Char.prototype.isValidValue = function(value) {
	return typeof (value) === 'string' && Buffer.byteLength(value) <= this._length
}
