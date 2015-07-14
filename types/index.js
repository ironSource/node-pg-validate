exports.Boolean = require('./Boolean')
exports.Integer = require('./Integer')
exports.Char = require('./Char')

exports.postgres = {
	Decimal: require('./postgres/Decimal'),
	Float: require('./postgres/Float'),
	Text: require('./postgres/Text'),
	Date: require('./postgres/Date'),
	Time: require('./postgres/Time'),
	Timestamp: require('./postgres/Timestamp')
}

exports.redshift = {
	Decimal: require('./redshift/Decimal'),
	Text: exports.Char,
	Date: require('./redshift/Date'),
	Time: require('./redshift/Time'),
	Timestamp: require('./redshift/Timestamp')
}
