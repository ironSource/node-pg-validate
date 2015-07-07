var expect = require('chai').expect
var types = require('./types')
var validate = require('./index.js')
var _ = require('lodash')

describe('pg-validate', function() {

	describe('Boolean type', function() {
		var bool = new types.Boolean()

		it('isValidValue() returns true for valid values', function () {
			var validValues = ['TRUE', 'FALSE', 't', 'f', 'true', 'false', 'y', 'n', 'yes', 'no', 'on', 'off', '1', '0', true, false, 1, 0]

			_.forEach(validValues, function (v) {
				expect(bool.isValidValue(v)).to.be.true
			})
		})

		it('isValidValue() returns false for invalid values', function () {
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

		it('isValidValue() returns true for valid 16bit values', function () {
			var i = new types.Integer('16bit')
			expect(i.isValidValue(10000)).to.be.true
		})

		it('isValidValue() returns false for invalid 16bit values', function () {
			var i = new types.Integer('16bit')
			expect(i.isValidValue(65000)).to.be.false
		})

		it('isValidValue() returns true for valid 32bit values', function () {
			var i = new types.Integer('32bit')
			expect(i.isValidValue(10000)).to.be.true
		})

		it('isValidValue() returns false for invalid 32bit values', function () {
			var i = new types.Integer('32bit')
			// we are on signed 32bit so 2^32 should not be valid
			expect(i.isValidValue(Math.pow(2, 32))).to.be.false
		})

		it('isValidValue() returns true for valid serial values', function () {
			var i = new types.Integer('serial')
			expect(i.isValidValue(1)).to.be.true
			expect(i.isValidValue(2147483647)).to.be.true
		})

		it('isValidValue() returns false for invalid serial values', function () {
			var i = new types.Integer('serial')
			expect(i.isValidValue(0)).to.be.false
			expect(i.isValidValue(-1)).to.be.false
			expect(i.isValidValue(2147483648)).to.be.false
			expect(i.isValidValue('')).to.be.false
		})

		it('isValidValue() returns true for valid 64bit values', function () {
			var i = new types.Integer('64bit')
			expect(i.isValidValue('-9223372036854775808')).to.be.true
			expect(i.isValidValue('9223372036854775807')).to.be.true
			expect(i.isValidValue(Math.pow(2, 32))).to.be.true
			expect(i.isValidValue(Math.pow(2, 53))).to.be.true
		})

		it('isValidValue() returns false for invalid 64bit values', function () {
			var i = new types.Integer('64bit')
			expect(i.isValidValue('-9223372036854775809')).to.be.false
			expect(i.isValidValue('9223372036854775808')).to.be.false
			expect(i.isValidValue('xa2')).to.be.false
			expect(i.isValidValue('')).to.be.false
		})

		it('isValidValue() returns true for valid bigserial values', function () {
			var i = new types.Integer('bigserial')
			expect(i.isValidValue('1')).to.be.true
			expect(i.isValidValue(1)).to.be.true
			expect(i.isValidValue('9223372036854775807')).to.be.true
			expect(i.isValidValue(Math.pow(2, 32))).to.be.true
			expect(i.isValidValue(Math.pow(2, 53))).to.be.true
		})

		it('isValidValue() returns false for invalid bigserial values', function () {
			var i = new types.Integer('bigserial')
			expect(i.isValidValue(0)).to.be.false
			expect(i.isValidValue(-1)).to.be.false
			expect(i.isValidValue('9223372036854775808')).to.be.false
			expect(i.isValidValue('xa2')).to.be.false
			expect(i.isValidValue('')).to.be.false
		})
	})

	describe('Decimal type', function () {
		it('throws exception in constructor when using invalid precision', function () {
			expect(function () {
				new types.Decimal(0)
			}).to.throw(Error, 'precision must be positive')

			expect(function () {
				new types.Decimal(9999999)
			}).to.throw(Error, 'precision exceeds maximum of ')
		})

		it('throws exception in constructor when using invalid scale', function () {
			expect(function () {
				new types.Decimal(2, 3)
			}).to.throw(Error, 'scale must be less than or equal to precision')

			expect(function () {
				new types.Decimal(2, -1)
			}).to.throw(Error, 'scale must be zero or positive')

			expect(function () {
				new types.Decimal(131072, 16384)
			}).to.throw(Error, 'scale exceeds maximum of ')
		})

		it('throws exception in constructor when scale is given without precision', function() {
			expect(function () {
				new types.Decimal(null, 3)
			}).to.throw(Error, 'cannot declare scale without precision')
		})

		it('defaults to a scale of 0 when given a precision', function() {
			var d = new types.Decimal(2)
			expect(d._scale).to.equal(0)
		})

		it('uses default values when given no precision', function() {
			var d = new types.Decimal()
			expect(d._precision).to.equal(d.DEFAULT_PRECISION)
			expect(d._scale).to.equal(d.DEFAULT_SCALE)

			var d2 = new types.Decimal(null, null)
			expect(d2._precision).to.equal(d.DEFAULT_PRECISION)
			expect(d2._scale).to.equal(d2.DEFAULT_SCALE)
		})

		describe('isValidValue() returns true for valid values', function () {
			it('coerces scale', function() {
				var d = new types.Decimal(4, 2)
				expect(d.isValidValue(123)).to.be.true
				expect(d.isValidValue(12.345)).to.be.true
				expect(d.isValidValue('123')).to.be.true
				expect(d.isValidValue('12.345')).to.be.true

				var d2 = new types.Decimal(3, 2)
				expect(d2.isValidValue(1.234)).to.be.true
				expect(d2.isValidValue('1.234')).to.be.true
			})

			it('with defaults', function() {
				var d = new types.Decimal()
				expect(d.isValidValue(123456)).to.be.true
				expect(d.isValidValue(12.3456)).to.be.true
				expect(d.isValidValue('123456')).to.be.true
				expect(d.isValidValue('12.3456')).to.be.true
			})

			it('negative number', function(){
				var d = new types.Decimal(2)
				expect(d.isValidValue(-12)).to.be.true
				expect(d.isValidValue(-1.1)).to.be.true
			})

			it('with positive sign', function() {
				var d = new types.Decimal(2)
				expect(d.isValidValue('+12')).to.be.true
				expect(d.isValidValue('+1.1')).to.be.true
			})

			it('with negative sign', function() {
				var d = new types.Decimal(2)
				expect(d.isValidValue('-12')).to.be.true
				expect(d.isValidValue('-1.1')).to.be.true
			})

			it('with implicit scale of 0', function() {
				var d = new types.Decimal(1)
				expect(d.isValidValue(1)).to.be.true
				expect(d.isValidValue(1.1)).to.be.true
				expect(d.isValidValue('1')).to.be.true
				expect(d.isValidValue('1.1')).to.be.true
			})

			it('with explicit scale of 0', function() {
				var d = new types.Decimal(1, 0)
				expect(d.isValidValue(1)).to.be.true
				expect(d.isValidValue(1.1)).to.be.true
				expect(d.isValidValue('1')).to.be.true
				expect(d.isValidValue('1.1')).to.be.true
			})
		})

		describe('isValidValue() returns false for invalid values', function () {
			var d = new types.Decimal(4, 2)

			it('type', function() {
				expect(d.isValidValue([])).to.be.false
				expect(d.isValidValue(true)).to.be.false
			})

			it('non numeric string', function() {
				expect(d.isValidValue('a')).to.be.false
				expect(d.isValidValue('3.a')).to.be.false
				expect(d.isValidValue('a.3')).to.be.false
			})

			it('empty string', function() {
				expect(d.isValidValue('')).to.be.false
			})

			it('too high precision', function() {
				expect(d.isValidValue(12345)).to.be.false
				expect(d.isValidValue('12345')).to.be.false

				var d2 = new types.Decimal(3, 2)
				expect(d2.isValidValue(12.345)).to.be.false
				expect(d2.isValidValue('12.345')).to.be.false
			})

			it('negative number', function() {
				var d = new types.Decimal(2, 2)
				expect(d.isValidValue(-123)).to.be.false
				expect(d.isValidValue(-1.12)).to.be.false
			})

			it('with negative sign', function() {
				var d = new types.Decimal(2, 2)
				expect(d.isValidValue('-123')).to.be.false
				expect(d.isValidValue('-1.12')).to.be.false
			})
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

		it('isValidValue() returns true for valid values', function () {
			var c = new types.Char(1)
			expect(c.isValidValue('a')).to.be.true
		})

		it('isValidValue() returns false for invalid values', function () {
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
