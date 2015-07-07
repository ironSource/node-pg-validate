exports.Boolean = require('./Boolean')
exports.Integer = require('./Integer')
exports.Char = require('./Char')

exports.postgres = {
	Decimal: require('./postgres/Decimal'),
	Float: require('./postgres/Float'),
}

exports.redshift = {
	Decimal: require('./redshift/Decimal'),
}

exports.Decimal = exports.postgres.Decimal
