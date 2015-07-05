var _ = require('lodash')
var types = require('./types')

var ERRORS = module.exports.ERRORS = {
	MISSING_REQUIRED_FIELD: 'missing required field',
	INVALID_VALUE: 'invalid value'
}

module.exports.object = function (obj, metadata) {

	var errors = []

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

		var validator = validatorFor(fieldMetadata)
		
		if (!validator.isValidValue(value)) {
			errors.push({
				field: field,
				error: ERRORS.INVALID_VALUE
			})
		}
	})

	return errors
}

function validatorFor (fieldMetadata) {
	var type = fieldMetadata.type

	if (type in staticValidators) {
		return staticValidators[type]
	}

	if (type === 'varchar' || type === 'char') {
		return new types.Char(fieldMetadata.length)
	}

	throw new Error('missing validator for type ' + type)
}

/*
	these are validators that can be reused
*/
var staticValidators = {}

staticValidators.int2 = new types.Integer('16bit')
staticValidators.smallint = staticValidators.int2
staticValidators.int4 = new types.Integer('32bit')
staticValidators.integer = staticValidators.int4

module.exports.validatorFor = validatorFor