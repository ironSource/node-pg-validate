var expect = require('chai').expect
var types = require('../types')

describe('Boolean type', function() {
	var bool = new types.Boolean()

	it('isValidValue() returns true for valid values', function () {
		var validValues = ['TRUE', 'FALSE', 't', 'f', 'true', 'false', 'y', 'n', 'yes', 'no', 'on', 'off', '1', '0', true, false, 1, 0]

		validValues.forEach(function (v) {
			expect(bool.isValidValue(v)).to.be.true
		})
	})

	it('isValidValue() returns false for invalid values', function () {
		;['asdasd', '', null, undefined].forEach(function (v) {
			expect(bool.isValidValue(v)).to.be.false
		})
	})
})
