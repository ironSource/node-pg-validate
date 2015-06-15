var _ = require('lodash')

module.exports.object = function (obj, metadata) {
	var result = {}
	_.foreach(obj, function (k, v) {
		if (!metadata.hasOwnProperty(k)) {
			return result[k] = 'no such column'
		}

		var columnInfo = metadata[k]


	})
}
