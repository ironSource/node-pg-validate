var expect = require('chai').expect
var types = require('../types')

describe('Json type', function () {
	it('isValidValue() returns true for valid values', function () {
		var c = new types.postgres.Json
		expect(c.isValidValue('{"foo": 1}')).to.be.true
	})

	it('isValidValue() returns false for invalid values', function () {
		var c = new types.postgres.Json
		expect(c.isValidValue('aa')).to.be.false
	})
})
