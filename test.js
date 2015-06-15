var expect = require('chai').expect
var types = require('./types')
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

	describe.only('Char type', function () {
		decribe('throws exception in constructor when using invalid length', function () {
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
			expect(i.isValidValue('a')).to.be.true
		})

		it('isValidValid() returns false for invalid values', function () {
			var i = new types.Integer(1)
			expect(i.isValidValue('aa')).to.be.false
		})

	})
})

var t = {
	suspicious: {
		type: 'int4',
		length: 32,
		required: true
	},
	low: {
		type: 'int4',
		length: 32,
		required: true
	},
	medium: {
		type: 'int4',
		length: 32,
		required: true
	},
	high: {
		type: 'int4',
		length: 32,
		required: true
	},
	detected: {
		type: 'int4',
		length: 32,
		required: true
	},
	scanned: {
		type: 'int4',
		length: 32,
		required: true
	},
	eventname: {
		type: 'varchar',
		length: 30,
		required: true
	},
	osversion: {
		type: 'varchar',
		length: 20,
		required: true
	},
	continent: {
		type: 'varchar',
		length: 2,
		required: true
	},
	type: {
		type: 'varchar',
		length: 50,
		required: true
	},
	eventversion: {
		type: 'varchar',
		length: 20,
		required: true
	},
	status: {
		type: 'varchar',
		length: 12,
		required: true
	},
	ip: {
		type: 'varchar',
		length: 80,
		required: true
	},
	version: {
		type: 'varchar',
		length: 12,
		required: true
	},
	ruserid: {
		type: 'varchar',
		length: 40,
		required: true
	},
	userid: {
		type: 'varchar',
		length: 40,
		required: true
	},
	geo: {
		type: 'varchar',
		length: 2,
		required: true
	},
	id: {
		type: 'varchar',
		length: 100,
		required: true
	},
	created: {
		type: 'timestamp',
		length: null,
		required: true
	},
	client_created: {
		type: 'timestamp',
		length: null,
		required: true
	}
}
