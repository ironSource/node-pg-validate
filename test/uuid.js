var expect = require('chai').expect
var types = require('../types')

describe('Uuid type', function() {
	var uuid = new types.postgres.Uuid()

	it('isValidValue() returns true for valid values', function () {
		expect(uuid.isValidValue('12345678-1234-1234-1234-123456789abC')).to.be.true
	})

	it('isValidValue() returns false for invalid values', function () {
		;['asdasd', '', null, undefined].forEach(function (v) {
			expect(uuid.isValidValue(v)).to.be.false
		})
	})
})
