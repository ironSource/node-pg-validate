module.exports = SqlType

function SqlType() {

}

SqlType.prototype.isValidValue = function(value) {
	throw new Error('must implement')
}