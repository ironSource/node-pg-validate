var expect = require('chai').expect
var types = require('../types')
var validate = require('../')
var validatorFor = validate.validatorFor
var BigNumber = require('bignumber.js').another({ ERRORS: false })

var util = require('./util')
var testType = util.testType
var describeWithDatabase = util.describeWithDatabase

function inexact(val, digits) {
	var b = new BigNumber(val)
	return b.toString(10).slice(0, digits + b.isNeg())
}

describe('Decimal type', function () {
	it('throws exception in constructor when using invalid precision', function () {
		expect(function () {
			new types.postgres.Decimal(0)
		}).to.throw(Error, 'precision must be positive')

		expect(function () {
			new types.postgres.Decimal(9999999)
		}).to.throw(Error, 'precision exceeds maximum of ')
	})

	it('throws exception in constructor when using invalid scale', function () {
		expect(function () {
			new types.postgres.Decimal(2, 3)
		}).to.throw(Error, 'scale must be less than or equal to precision')

		expect(function () {
			new types.postgres.Decimal(2, -1)
		}).to.throw(Error, 'scale must be zero or positive')

		expect(function () {
			new types.postgres.Decimal(131072, 16384)
		}).to.throw(Error, 'scale exceeds maximum of ')
	})

	it('throws exception in constructor when scale is given without precision', function() {
		expect(function () {
			new types.postgres.Decimal(null, 3)
		}).to.throw(Error, 'cannot declare scale without precision')
	})

	it('defaults to a scale of 0 when given a precision', function() {
		var d = new types.postgres.Decimal(2)
		expect(d._scale).to.equal(0)
	})

	it('uses default values when given no precision', function() {
		var d = new types.postgres.Decimal()
		expect(d._precision).to.equal(d.DEFAULT_PRECISION)
		expect(d._scale).to.equal(d.DEFAULT_SCALE)

		var d2 = new types.postgres.Decimal(null, null)
		expect(d2._precision).to.equal(d.DEFAULT_PRECISION)
		expect(d2._scale).to.equal(d2.DEFAULT_SCALE)
	})

	describe('isValidValue() returns true for valid values', function () {
		it('coerces scale', function() {
			var d = new types.postgres.Decimal(4, 2)
			expect(d.isValidValue(123)).to.be.true
			expect(d.isValidValue(12.345)).to.be.true
			expect(d.isValidValue('123')).to.be.true
			expect(d.isValidValue('12.345')).to.be.true

			var d2 = new types.postgres.Decimal(3, 2)
			expect(d2.isValidValue(1.234)).to.be.true
			expect(d2.isValidValue('1.234')).to.be.true
		})

		it('with defaults', function() {
			var d = new types.postgres.Decimal()
			expect(d.isValidValue(123456)).to.be.true
			expect(d.isValidValue(12.3456)).to.be.true
			expect(d.isValidValue('123456')).to.be.true
			expect(d.isValidValue('12.3456')).to.be.true
		})

		it('negative number', function(){
			var d = new types.postgres.Decimal(2)
			expect(d.isValidValue(-12)).to.be.true
			expect(d.isValidValue(-1.1)).to.be.true
		})

		it('with positive sign', function() {
			var d = new types.postgres.Decimal(2)
			expect(d.isValidValue('+12')).to.be.true
			expect(d.isValidValue('+1.1')).to.be.true
		})

		it('with negative sign', function() {
			var d = new types.postgres.Decimal(2)
			expect(d.isValidValue('-12')).to.be.true
			expect(d.isValidValue('-1.1')).to.be.true
		})

		it('with implicit scale of 0', function() {
			var d = new types.postgres.Decimal(1)
			expect(d.isValidValue(1)).to.be.true
			expect(d.isValidValue(1.1)).to.be.true
			expect(d.isValidValue('1')).to.be.true
			expect(d.isValidValue('1.1')).to.be.true
		})

		it('with explicit scale of 0', function() {
			var d = new types.postgres.Decimal(1, 0)
			expect(d.isValidValue(1)).to.be.true
			expect(d.isValidValue(1.1)).to.be.true
			expect(d.isValidValue('1')).to.be.true
			expect(d.isValidValue('1.1')).to.be.true
		})
	})

	describe('isValidValue() returns false for invalid values', function () {
		var d = new types.postgres.Decimal(4, 2)

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

			var d2 = new types.postgres.Decimal(3, 2)
			expect(d2.isValidValue(12.345)).to.be.false
			expect(d2.isValidValue('12.345')).to.be.false
		})

		it('negative number', function() {
			var d = new types.postgres.Decimal(2, 2)
			expect(d.isValidValue(-123)).to.be.false
			expect(d.isValidValue(-1.12)).to.be.false
		})

		it('with negative sign', function() {
			var d = new types.postgres.Decimal(2, 2)
			expect(d.isValidValue('-123')).to.be.false
			expect(d.isValidValue('-1.12')).to.be.false
		})
	})

	describeWithDatabase('numeric with precision', function() {
		testPrecision([3,2], 2.22, 22.22, 2.22)
		testPrecision([3,1], 2.22, 222.22, 2.2)
		testPrecision([1,0], 2.0, 22.0, 2)
		testPrecision([1,0], 2.2, 22.0, 2)
		testPrecision([1,1], 0.2, 22.0, 0.2)

		function testPrecision(args, valid, invalid, expected) {
			valid = new BigNumber(valid)
			invalid = new BigNumber(invalid)
			expected = new BigNumber(expected)

			var validNeg = valid.times(-1)
				, invalidNeg = invalid.times(-1)
				, expectedNeg = expected.times(-1)
				, type = args ? 'numeric('+args.join(',')+')' : 'numeric'
				, d = new types.postgres.Decimal(args[0], args[1])

			describe(type, function() {
				it("matches the database's precision (positive)", function(done) {
					expect(d.isValidValue(valid.toString(10))).to.be.true
					testType(type, valid.toString(10), function(err, val) {
						expect(err).to.be.null
						expect(''+val).to.equal(expected.toString(10))
						done()
					})
				})

				it("higher precision throws database error (positive)", function(done) {
					expect(d.isValidValue(invalid.toString(10))).to.be.false
					testType(type, invalid.toString(10), function(err, val) {
						expect(err).to.be.an.instanceof(Error)
						expect(val).to.be.undefined
						done()
					})
				})

				it("matches the database's precision (negative)", function(done) {
					expect(d.isValidValue(validNeg.toString(10))).to.be.true
					testType(type, validNeg.toString(10), function(err, val) {
						expect(err).to.be.null
						expect(''+val).to.equal(expectedNeg.toString(10))
						done()
					})
				})

				it("higher precision throws database error (negative)", function(done) {
					expect(d.isValidValue(invalidNeg.toString(10))).to.be.false
					testType(type, invalidNeg.toString(10), function(err, val) {
						expect(err).to.be.an.instanceof(Error)
						expect(val).to.be.undefined
						done()
					})
				})
			})
		}
	})
})

describeWithDatabase('Real type', function() {
	var validator = validatorFor({type: 'float4'})
	var range = types.Integer.RANGE['128bit']

	it('accepts numbers up to 128bit with a precision of at least 6', function(done) {
		var min = range.min.toString(10)
		expect(validator.isValidValue(min)).to.be.true

		testType('float4', min, function(err, val) {
			expect(err).to.be.null
			expect(inexact(val, 6)).to.equal(inexact(min, 6))
			done()
		})
	})
})

describeWithDatabase('float(1) type', function() {
	var validator = validatorFor({type: 'float4'})
	var range = types.Integer.RANGE['128bit']

	it('accepts numbers up to 128bit with a precision of at least 6', function(done) {
		var min = range.min.toString(10)
		expect(validator.isValidValue(min)).to.be.true

		testType('float(1)', min, function(err, val) {
			expect(err).to.be.null
			expect(inexact(val, 6)).to.equal(inexact(min, 6))
			done()
		})
	})
})

describeWithDatabase('Double precision type', function() {
	var validator = validatorFor({type: 'float8'})
	var range = types.Integer.RANGE['1024bit']

	it('accepts numbers up to 1024bit with a precision of at least 15', function(done) {
		var max = range.max.toString(10)
		expect(validator.isValidValue(max)).to.be.true

		testType('float8', max, function(err, val) {
			expect(err).to.be.null

			// Truncate to 14 to ignore system rounding differences
			expect(inexact(val, 14)).to.equal(inexact(max, 14))
			done()
		})
	})
})

describeWithDatabase('float(53) type', function() {
	var validator = validatorFor({type: 'float8'})
	var range = types.Integer.RANGE['1024bit']

	it('accepts numbers up to 1024bit with a precision of at least 15', function(done) {
		var max = range.max.toString(10)
		expect(validator.isValidValue(max)).to.be.true

		testType('float(53)', max, function(err, val) {
			expect(err).to.be.null
			expect(inexact(val, 14)).to.equal(inexact(max, 14))
			done()
		})
	})
})
