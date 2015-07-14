var expect = require('chai').expect
var types = require('./types')
var validatorFor = require('./').validatorFor
var validate = require('./index.js')
var _ = require('lodash')
var pg = require('pg')
var BigNumber = require('bignumber.js').another({ ERRORS: false })
var dsn = process.env.PG_VALIDATE

describe('pg-validate', function() {
	var client, release

	if (dsn) {
		before(function(done){
			pg.connect(dsn, function(err, _client, _release) {
				if (err) return done(err)

				client = _client
				release = _release

				done()
			})
		})

		after(function() {
			release && release()
		})
	}

	function testType(type, value, done) {
		client.query('SELECT $1::'+type+' AS res', [value], function(err, result) {      
			if (err) return done(err)
			else done(null, result.rows[0].res);
		});
	}

	function describeWithDatabase(what, fn) {
		if (dsn) describe(what, fn)
		else describe.skip(what, fn)
	}

	function inexact(val, digits) {
		var b = new BigNumber(val)
		return b.toString(10).slice(0, digits + b.isNeg())
	}

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
					, d = new types.Decimal(args[0], args[1])

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

	describe('Text type', function () {
		it('isValidValue() returns true for valid values', function () {
			var c = new types.postgres.Text()
			expect(c.isValidValue('a')).to.be.true
		})

		it('isValidValue() returns false for invalid values', function () {
			var c = new types.postgres.Text()
			expect(c.isValidValue(3)).to.be.false
		})

		it('is a type on PostgreSQL', function(){
			var rv = validatorFor({type: 'text'}, validate.POSTGRES)
			expect(rv).to.be.an.instanceof(types.postgres.Text)
		})

		it('is an alias of varchar on Redshift', function(){
			var rv = validatorFor({type: 'text', length: 1}, validate.REDSHIFT)
			expect(rv).to.be.an.instanceof(types.Char)
		})
	})

	describe('Date type', function () {
		it('isValidValue() returns true for valid values', function () {
			var t = new types.Date()
			expect(t.isValidValue('1999-01-08')).to.be.true
			expect(t.isValidValue('1999-Jan-08')).to.be.true
			expect(t.isValidValue('08-Jan-1999')).to.be.true
			expect(t.isValidValue('January 8, 1999')).to.be.true
			expect(t.isValidValue('19990108')).to.be.true
			expect(t.isValidValue('990108')).to.be.true
			expect(t.isValidValue('1999.008')).to.be.true
		})

		it('isValidValue() returns false for invalid values', function () {
			var t = new types.Date()
			expect(t.isValidValue('1999-01')).to.be.false
		})
	})

	describe('Timestamp type', function () {
		it('isValidValue() returns true for valid values', function () {
			var t = new types.Timestamp()
			expect(t.isValidValue('1999-01-08 04:05:06.778')).to.be.true
			expect(t.isValidValue('1999-Jan-08 04:05:06')).to.be.true
			expect(t.isValidValue('08-Jan-1999 04:05 PM')).to.be.true
			expect(t.isValidValue('January 8, 1999 04:05 PM')).to.be.true
			expect(t.isValidValue('19990108 04:05:06-07:00')).to.be.true
			expect(t.isValidValue('990108 04:05:06')).to.be.true
			expect(t.isValidValue('1999.008 04:05:06')).to.be.true

			// TODO: timezones with DST (validate with date)
		})

		it('isValidValue() returns false for invalid values', function () {
			var t = new types.Timestamp()
			expect(t.isValidValue('1999-01')).to.be.false
			expect(t.isValidValue(true)).to.be.false
		})
	})

	describe('Time(tz) type', function () {
		it('isValidValue() returns false for invalid values', function () {
			var t = new types.Time()
			expect(t.isValidValue('1999-01')).to.be.false
			expect(t.isValidValue(2)).to.be.false
		})

		// TODO: some of these formats are DST sensitive
		describeWithDatabase('timetz accepts multiple formats', function() {
			var validator = validatorFor({type: 'timetz'})
			var formats = {
				'HH:mm:ss.SSS'   : ['04:05:06.778', '04:05:06.778', true],
				'HH:mm:ss'       : ['04:05:06', '04:05:06', true],
				"HH:mm"          : ['04:05', '04:05:00', true],
				"HHmmss"         : ['040506', '04:05:06', true],
				"hh:mm A"        : ['04:05 PM', '16:05:00', true],
				"HH:mm:ss.SSSZ"  : ['04:05:06.789-8', '04:05:06.789-08'],
				"HH:mm:ssZZ"     : ['04:05:06-08:00', '04:05:06-08'],
				"HH:mmZZ"        : ['04:05-08:00', '04:05:00-08'],
				"HHmmssZ"        : ['040506-08', '04:05:06-08'],
				'HH:mm:ss tz'    : ['04:05:06 PST', '04:05:06-08'],
				'YYYY-MM-DD HH:mm:ss tz'
												 : ['2003-04-12 04:05:06 America/New_York', '04:05:06-04']
			}

			Object.keys(formats).forEach(function(fmt){
				var a = formats[fmt], input = a[0], output = a[1] || a[0]

				it('accepts '+fmt, function(done) {
					expect(validator.isValidValue(input)).to.be.true

					testType('timetz', input, function(err, val) {
						expect(err).to.be.null
						expect(strip(val)).to.equal(output)
						done()
					})
				})

				function strip(v) {
					// strip local timezone from postgres output
					return a[2] ? v.slice(0,-3) : v
				}
			})
		})

		describeWithDatabase('time accepts multiple formats', function() {
			var validator = validatorFor({type: 'time'})
			var formats = {
				'HH:mm:ss.SSS'   : ['04:05:06.778'],
				'HH:mm:ss'       : ['04:05:06'],
				"HH:mm"          : ['04:05', '04:05:00'],
				"HHmmss"         : ['040506', '04:05:06'],
				"hh:mm A"        : ['04:05 PM', '16:05:00'],

				// Timezones are ignored for the time type
				"HH:mm:ss.SSSZ"  : ['04:05:06.789-8', '04:05:06.789'],
				"HH:mm:ssZZ"     : ['04:05:06-08:00', '04:05:06'],
				"HH:mmZZ"        : ['04:05-08:00', '04:05:00'],
				"HHmmssZ"        : ['040506-08', '04:05:06']
			}

			Object.keys(formats).forEach(function(fmt){
				var a = formats[fmt], input = a[0], output = a[1] || a[0]

				it('accepts '+fmt, function(done) {
					expect(validator.isValidValue(input)).to.be.true

					testType('time', input, function(err, val) {
						expect(err).to.be.null
						expect(val).to.equal(output)
						done()
					})
				})
			})
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
