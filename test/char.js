var expect = require('chai').expect
var types = require('../types')
var validate = require('../')
var validatorFor = validate.validatorFor

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
		var rv2 = validate.pg.validatorFor({type: 'text'})
		expect(rv).to.be.an.instanceof(types.postgres.Text)
		expect(rv2).to.be.an.instanceof(types.postgres.Text)
	})

	it('is an alias of varchar on Redshift', function(){
		var rv = validatorFor({type: 'text', length: 1}, validate.REDSHIFT)
		var rv2 = validate.redshift.validatorFor({type: 'text', length: 1})
		expect(rv).to.be.an.instanceof(types.Char)
		expect(rv2).to.be.an.instanceof(types.Char)
	})
})
