var expect = require('chai').expect
var types = require('../types')
var BigNumber = require('bignumber.js').another({ ERRORS: false })

var suite = require('./suite')
var testType = suite.testType
var describeWithDatabase = suite.describeWithDatabase

describe('Integer type', function () {
	it('throws exception in constructor when using invalid range', function () {
		expect(function () {
			new types.Integer('12312323')
		}).to.throw(Error, 'invalid or unsupported range')
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

	var typeRanges = {
		int2: '16bit',
		int4: '32bit',
		int8: '64bit'
	}

	Object.keys(typeRanges).forEach(function(type) {
		var range = typeRanges[type]
			, i = new types.Integer(range)
			, min = new BigNumber(i._range.min)
			, max = new BigNumber(i._range.max)

		describeWithDatabase(type + ' range', function() {
			it("matches the database's minimum value", function(done) {
				testType(type, min.toString(10), function(err, val) {
					expect(err).to.be.null
					expect(''+val).to.equal(min.toString(10))
					done()
				})
			})

			it("less than minimum throws database error", function(done) {
				testType(type, min.minus(1).toString(10), function(err, val) {
					expect(err).to.be.an.instanceof(Error)
					done()
				})
			})

			it("matches the database's maximum value", function(done) {
				testType(type, max.toString(10), function(err, val) {
					expect(err).to.be.null
					expect(''+val).to.equal(max.toString(10))
					done()
				})
			})

			it("more than maximum throws database error", function(done) {
				testType(type, max.plus(1).toString(10), function(err, val) {
					expect(err).to.be.an.instanceof(Error)
					done()
				})
			})
		})
	})
})
