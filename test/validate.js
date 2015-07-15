var expect = require('chai').expect
var validate = require('../')

describe('validate object', function () {
	it('returns an array with validation errors if it finds any', function () {
		var errors = validate.object({
			foo: '123123',
			bar: 123
		}, metadata)

		expect(errors).to.have.length(3)

		expect(errors).to.contain({ field: 'foo', error: validate.ERRORS.INVALID_VALUE })
		expect(errors).to.contain({ field: 'bar', error: validate.ERRORS.INVALID_VALUE })
		expect(errors).to.contain({ field: 'created', error: validate.ERRORS.MISSING_REQUIRED_FIELD })
	})
})

// example of a metadata object
var metadata = {
	foo: {
		type: 'int4',
		length: 32,
		required: true
	},
	bar: {
		type: 'varchar',
		length: 30,
		required: true
	},
	created: {
		type: 'timestamp',
		length: null,
		required: true
	}
}
