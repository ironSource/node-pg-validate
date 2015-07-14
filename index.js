var _ = require('lodash')
var types = require('./types')
var introspect = require('introspect')

var ERRORS = exports.ERRORS = {
	MISSING_REQUIRED_FIELD: 'missing required field',
	INVALID_VALUE: 'invalid value'
}

var PLATFORM = {
	POSTGRES: 1,
	REDSHIFT: 2
}

Object.keys(PLATFORM).forEach(function(k){
	exports[k] = PLATFORM[k]
})

// Shortcuts
exports.redshift = {
	object: function(obj, metadata) {
		return exports.object(obj, metadata, { platform: PLATFORM.REDSHIFT })
	},
	validatorFor: function(fieldMetadata) {
		return validatorFor(fieldMetadata, PLATFORM.REDSHIFT)
	}
}

exports.pg = {
	object: function(obj, metadata) {
		return exports.object(obj, metadata, { platform: PLATFORM.POSTGRES })
	},
	validatorFor: function(fieldMetadata) {
		return validatorFor(fieldMetadata, PLATFORM.POSTGRES)
	}
}

exports.object = function (obj, metadata, opts) {
	var errors = []
	var platform = opts && opts.platform

	_.forEach(metadata, function (fieldMetadata, field) {

		var value = obj[field]

		// we might miss zeros here, so 
		if (value === undefined || value === null) {
			if (fieldMetadata.required) {
				errors.push({
					field: field,
					error: ERRORS.MISSING_REQUIRED_FIELD
				})
			}

			return
		}

		var validator = validatorFor(fieldMetadata, platform)
		
		if (!validator.isValidValue(value)) {
			errors.push({
				field: field,
				error: ERRORS.INVALID_VALUE
			})
		}
	})

	return errors
}

function validatorFor (fieldMetadata, platform) {
	if (!platform) platform = PLATFORM.POSTGRES

	var type = fieldMetadata.type
	var validators = platformValidators(platform)

	if (type in validators) {
		var validator = validators[type]

		if (typeof validator === 'function') {
			// Has user-specified type options(s)
			var options = _.values(_.pick(fieldMetadata, introspect(validator)))
			validator = validator.apply(null, options)
		}

		return validator
	}

	throw new Error('missing validator for type ' + type)
}

/*
	these are validators that can be reused
*/
var staticValidators = {}
var platformAgnostic = {
	boolean:     new types.Boolean(),
	char:        types.Char,
	int2:        new types.Integer('16bit'),
	int4:        new types.Integer('32bit'),
	int8:        new types.Integer('64bit'),
	serial:      new types.Integer('serial'),
	bigserial:   new types.Integer('bigserial')
}

var ALIAS = {
	smallint:    'int2',
	integer:     'int4',
	bigint:      'int8',
	varchar:     'char',
	numeric:     'decimal',
	float4:      'real',
	float8:      'double_precision',
	timestamptz: 'timestamp',
	timetz:      'time',
	bpchar:      'char'
}

function platformValidators(platform) {
	if (staticValidators[platform]) return staticValidators[platform]

	var validators = staticValidators[platform] = _.assign({}, platformAgnostic)

	if (platform === PLATFORM.POSTGRES) {
		var platformTypes = types.postgres
	} else if (platform === PLATFORM.REDSHIFT) {
		platformTypes = types.redshift
	} else {
		throw new Error('Invalid platform: ' + platform)
	}

	validators.decimal = platformTypes.Decimal
	validators.text = platformTypes.Text
	validators.date = new platformTypes.Date
	validators.time = new platformTypes.Time
	validators.timestamp = new platformTypes.Timestamp

	// Inexact. Maximum precision is advisory and *at least* 6.
	validators.real = new platformTypes.Decimal(null, null, '128bit')

	// Inexact. Maximum precision is advisory and *at least* 15.
	validators.double_precision = new platformTypes.Decimal(null, null, '1024bit')

	if (platform === PLATFORM.POSTGRES) {
		validators.float = types.postgres.Float.factory(validators)
	} else {
		validators.float = validators.double_precision
	}

	for(var alias in ALIAS) {
		validators[alias] = validators[ALIAS[alias]]
	}

	staticValidators[platform] = validators
	return validators
}

exports.validatorFor = validatorFor
