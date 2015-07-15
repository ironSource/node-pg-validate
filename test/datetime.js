var expect = require('chai').expect
var types = require('../types')
var validate = require('../')
var validatorFor = validate.validatorFor

var util = require('./util')
var testType = util.testType
var describeWithDatabase = util.describeWithDatabase

var dates = [
	'1999-01-08',
	'1999-Jan-08',
	'08-Jan-1999',
	'January 8, 1999',
	'19990108',
	'990108',
	'1999.008',
	'Jan-08-1999'
].concat(types.postgres.Date().SPECIALS)

describeWithDatabase('Date type', function () {
	var t = new types.postgres.Date()
	dates.forEach(function(date) {
		it('accepts '+date, function(done){
			expect(t.isValidValue(date)).to.be.true
			testType('date', date, function(err, val) {
				expect(err).to.be.null
				done()
			})
		})
	})

	it('isValidValue() returns false for invalid values', function () {
		var t = new types.postgres.Date()
		expect(t.isValidValue('1999-01')).to.be.false
	})
})

describe('Timestamp type', function () {
	it('isValidValue() returns true for valid values', function () {
		var t = new types.postgres.Timestamp()
		expect(t.isValidValue('1999-01-08 04:05:06.778')).to.be.true
		expect(t.isValidValue('1999-Jan-08 04:05:06')).to.be.true
		expect(t.isValidValue('08-Jan-1999 04:05 PM')).to.be.true
		expect(t.isValidValue('January 8, 1999 04:05 PM')).to.be.true
		expect(t.isValidValue('19990108 04:05:06-07:00')).to.be.true
		expect(t.isValidValue('990108 04:05:06')).to.be.true
		expect(t.isValidValue('1999.008 04:05:06')).to.be.true

		// TODO: timezones with DST (validate with date)
	})

	it('accepts dates without a time', function(){
		var t = new types.postgres.Timestamp()
		dates.forEach(function(date) {
			expect(t.isValidValue(date)).to.be.true
		})
	})

	it('PostgreSQL accepts January 8 04:05:06 1999 PST', function(){
		var t = new types.postgres.Timestamp()
		expect(t.isValidValue('January 8 04:05:06 1999 PST')).to.be.true
	})

	it('isValidValue() returns false for invalid values', function () {
		var t = new types.postgres.Timestamp()
		expect(t.isValidValue('1999-01')).to.be.false
		expect(t.isValidValue(true)).to.be.false
	})
})

describe('Time(tz) type', function () {
	it('isValidValue() returns false for invalid values', function () {
		var t = new types.postgres.Time()
		expect(t.isValidValue('1999-01')).to.be.false
		expect(t.isValidValue(2)).to.be.false
	})

	it('accepts special values', function() {
		var t = new types.postgres.Time()
		t.SPECIALS.forEach(function(special){
			expect(t.isValidValue(special)).to.be.true
		})
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

describe('Interval type', function () {
	it('isValidValue() returns true for valid values', function () {
		var c = new types.Interval()
		expect(c.isValidValue('1')).to.be.true
		expect(c.isValidValue('1 year')).to.be.true
		expect(c.isValidValue('1-2')).to.be.true
		expect(c.isValidValue('3 4:05:06')).to.be.true
		expect(c.isValidValue('1 year 2 months 3 days 4 hours 5 minutes 6 seconds')).to.be.true
		expect(c.isValidValue('1 year 2 months 1 day')).to.be.true
		expect(c.isValidValue('1.5 year 1 day')).to.be.true
		expect(c.isValidValue('P1Y2M3DT4H5M6S')).to.be.true
		expect(c.isValidValue('P0001-02-03T04:05:06')).to.be.true
	})

	it('isValidValue() returns false for invalid values', function () {
		var c = new types.Interval()
		expect(c.isValidValue('aa')).to.be.false
		expect(c.isValidValue('P1Y2M3DT4H5MXS')).to.be.false
		expect(c.isValidValue('1.5 year 1 doy')).to.be.false
		expect(c.isValidValue([])).to.be.false
	})
})
