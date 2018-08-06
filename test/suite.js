var Mocha = require('mocha')
var dsn = process.env.PG_VALIDATE
var pg = require('pg')
var types = require('../types')
var validate = require('../')
var client

exports.types = types.postgres
exports.validatorFor = validate.pg.validatorFor

exports.testType = function(type, value, done) {
	client.query('SELECT $1::'+type+' AS res', [value], function(err, result) {
		if (err) return done(err)
		else done(null, result.rows[0].res);
	});
}

exports.describeWithDatabase = function(what, fn) {
	if (client) describe(what, fn)
	else describe.skip(what, fn)
}

if (dsn) {
	pg.connect(dsn, function(err, cl) {
		if (err) throw err

		client = exports.client = cl

		client.query('SELECT version() AS v', function(err, result){
			if (err) throw err

			if (result.rows[0].v.toLowerCase().indexOf('redshift') >= 0) {
				exports.types = types.redshift
				exports.validatorFor = validate.redshift.validatorFor
				exports.isRedshift = true
			}

			run()
		})
	})
} else {
	run()
}

function run() {
	var mocha = new Mocha({ reporter: 'spec' })

	mocha.addFile(__dirname + '/boolean.js')
	mocha.addFile(__dirname + '/char.js')
	mocha.addFile(__dirname + '/datetime.js')
	mocha.addFile(__dirname + '/decimal.js')
	mocha.addFile(__dirname + '/integer.js')
	mocha.addFile(__dirname + '/validate.js')

	mocha.run(function(){
	  client && client.end()
	})
}
