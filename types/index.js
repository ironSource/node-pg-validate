exports.Boolean = require('./Boolean')
exports.Integer = require('./Integer')
exports.Char = require('./Char')
exports.Timestamp = require('./Timestamp')
exports.Time = require('./Time')
exports.Date = require('./Date')

exports.postgres = {
	Decimal: require('./postgres/Decimal'),
	Float: require('./postgres/Float'),
	Text: require('./postgres/Text')
}

exports.redshift = {
	Decimal: require('./redshift/Decimal'),
}

exports.Decimal = exports.postgres.Decimal
