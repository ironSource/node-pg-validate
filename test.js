var expect = require('chai').expect
var types = require('./types')
var validate = require('./index.js')
var _ = require('lodash')

describe('pg-validate', function() {

	describe('Boolean type', function() {
		var bool = new types.Boolean()

		it('isValidValid() returns true for valid values', function () {
			var validValues = ['TRUE', 'FALSE', 't', 'f', 'true', 'false', 'y', 'n', 'yes', 'no', 'on', 'off', '1', '0', true, false, 1, 0]

			_.forEach(validValues, function (v) {
				expect(bool.isValidValue(v)).to.be.true
			})
		})

		it('isValidValid() returns false for invalid values', function () {
			var invalidValues = ['asdasd', '', null, undefined]

			_.forEach(invalidValues, function (v) {
				expect(bool.isValidValue(v)).to.be.false
			})
		})
	})

	describe('Integer type', function () {
		it('throws exception in constructor when using invalid length', function () {
			expect(function () {
				new types.Integer('12312323')
			}).to.throw(Error, 'invalid or unsupported length for integer')
		})

		it('isValidValid() returns true for valid 16bit values', function () {
			var i = new types.Integer('16bit')
			expect(i.isValidValue(10000)).to.be.true
		})

		it('isValidValid() returns false for invalid 16bit values', function () {
			var i = new types.Integer('16bit')
			expect(i.isValidValue(65000)).to.be.false
		})

		it('isValidValid() returns true for valid 32bit values', function () {
			var i = new types.Integer('32bit')
			expect(i.isValidValue(10000)).to.be.true
		})

		it('isValidValid() returns false for invalid 32bit values', function () {
			var i = new types.Integer('32bit')
			// we are on signed 32bit so 2^32 should not be valid
			expect(i.isValidValue(Math.pow(2, 32))).to.be.false
		})
	})

	describe('Char type', function () {
		describe('throws exception in constructor when using invalid length', function () {
			it('type', function () {
				expect(function () {
					new types.Char('12312323')
				}).to.throw(Error, 'invalid length, number is required')
			})

			it('bad value', function () {
				expect(function () {
					new types.Char(0)
				}).to.throw(Error, 'invalid length must be greater than 0')
			})
		})

		it('isValidValid() returns true for valid values', function () {
			var c = new types.Char(1)
			expect(c.isValidValue('a')).to.be.true
		})

		it('isValidValid() returns false for invalid values', function () {
			var c = new types.Char(1)
			expect(c.isValidValue('aa')).to.be.false
		})
	})

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
})

// exampe of a metadata object
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
