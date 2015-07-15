var pg = require('pg')
	, dsn = process.env.PG_VALIDATE
	, client
	, release

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

exports.testType = function(type, value, done) {
	client.query('SELECT $1::'+type+' AS res', [value], function(err, result) {
		if (err) return done(err)
		else done(null, result.rows[0].res);
	});
}

exports.describeWithDatabase = function(what, fn) {
	if (dsn) describe(what, fn)
	else describe.skip(what, fn)
}
