var moment = require('moment-timezone');
var SqlType = require('../../lib/SqlType')
var inherits = require('util').inherits

module.exports = Time
inherits(Time, SqlType)

// Formats that moment.js can parse
const FORMATS = [
	"HH:mm:ss.SSS",   // 04:05:06.789  ISO 8601
	"HH:mm:ss",       // 04:05:06  ISO 8601
	"HH:mm",          // 04:05 ISO 8601
	"HHmmss",         // 040506  ISO 8601
	"hh:mm A",        // 04:05 AM/PM
	"HH:mm:ssZZ",     // 04:05:06-08:00  ISO 8601
	"HH:mmZZ",        // 04:05-08:00 ISO 8601
]

const SPECIALS = [
	'now'
]

const tzRe = / [\w\/]{3,}$/
const dstTimeFormat = 'YYYY-MM-DD'

function Time() {
	if ( !(this instanceof Time) ) return new Time()
	SqlType.call(this)

	this.SPECIALS = SPECIALS
	this.FORMATS = FORMATS
}

Time.prototype.isValidValue = function(value, _formats) {
	if (typeof value !== 'string') return false
	if (this.SPECIALS.indexOf(value) >= 0) return true

	var match, formats = _formats || this.FORMATS;

	if (/(\-|\+)(\d{1,3})$/.test(value)) {
		// Support 04:05:06.789-8 and 040506-08 and ..-800
		value = value.split(/\-|\+/)[0]
	} else if (match = value.match(tzRe)) {
		// Support named time zones and abbreviations
		var name = match[0].trim()
			, abbr = ABBR[name]

		value = value.slice(0, match.index)

		if (abbr) {
			var offset = abbr.utc_offset.slice(0,-3)
			if (offset[0] !== '-') offset = '+' + offset
			value = value + offset
		} else if (this.supportsNamedTimezones()) {
			var zone = moment.tz.zone(name)
			if (zone == null) return false

			// In case the time zone involves a daylight-savings rule (and
			// the time must include a date), let momentjs handle that for now.
			var tm = moment.tz(value, formats, name)
			return tm.isValid()
		}
	}

	var m = moment(value, formats, true) // strict
	return m.isValid()
}

Time.prototype.supportsNamedTimezones = function() {
	throw new Error('must implement')
}

// Default list of abbreviations.
var ABBR = {
	"ACDT": { "utc_offset":"10:30:00","is_dst":true},
	"ACSST": { "utc_offset":"10:30:00","is_dst":true},
	"ACST": { "utc_offset":"09:30:00","is_dst":false},
	"ACT": { "utc_offset":"-05:00:00","is_dst":false},
	"ACWST": { "utc_offset":"08:45:00","is_dst":false},
	"ADT": { "utc_offset":"-03:00:00","is_dst":true},
	"AEDT": { "utc_offset":"11:00:00","is_dst":true},
	"AESST": { "utc_offset":"11:00:00","is_dst":true},
	"AEST": { "utc_offset":"10:00:00","is_dst":false},
	"AFT": { "utc_offset":"04:30:00","is_dst":false},
	"AKDT": { "utc_offset":"-08:00:00","is_dst":true},
	"AKST": { "utc_offset":"-09:00:00","is_dst":false},
	"ALMST": { "utc_offset":"07:00:00","is_dst":true},
	"ALMT": { "utc_offset":"06:00:00","is_dst":false},
	"AMST": { "utc_offset":"05:00:00","is_dst":true},
	"AMT": { "utc_offset":"04:00:00","is_dst":false},
	"ANAST": { "utc_offset":"12:00:00","is_dst":true},
	"ANAT": { "utc_offset":"12:00:00","is_dst":false},
	"ARST": { "utc_offset":"-02:00:00","is_dst":true},
	"ART": { "utc_offset":"-03:00:00","is_dst":false},
	"AST": { "utc_offset":"-04:00:00","is_dst":false},
	"AWSST": { "utc_offset":"09:00:00","is_dst":true},
	"AWST": { "utc_offset":"08:00:00","is_dst":false},
	"AZOST": { "utc_offset":"00:00:00","is_dst":true},
	"AZOT": { "utc_offset":"-01:00:00","is_dst":false},
	"AZST": { "utc_offset":"05:00:00","is_dst":true},
	"AZT": { "utc_offset":"04:00:00","is_dst":false},
	"BDST": { "utc_offset":"02:00:00","is_dst":true},
	"BDT": { "utc_offset":"06:00:00","is_dst":false},
	"BNT": { "utc_offset":"08:00:00","is_dst":false},
	"BORT": { "utc_offset":"08:00:00","is_dst":false},
	"BOT": { "utc_offset":"-04:00:00","is_dst":false},
	"BRA": { "utc_offset":"-03:00:00","is_dst":false},
	"BRST": { "utc_offset":"-02:00:00","is_dst":true},
	"BRT": { "utc_offset":"-03:00:00","is_dst":false},
	"BST": { "utc_offset":"01:00:00","is_dst":true},
	"BTT": { "utc_offset":"06:00:00","is_dst":false},
	"CADT": { "utc_offset":"10:30:00","is_dst":true},
	"CAST": { "utc_offset":"09:30:00","is_dst":false},
	"CCT": { "utc_offset":"08:00:00","is_dst":false},
	"CDT": { "utc_offset":"-05:00:00","is_dst":true},
	"CEST": { "utc_offset":"02:00:00","is_dst":true},
	"CET": { "utc_offset":"01:00:00","is_dst":false},
	"CETDST": { "utc_offset":"02:00:00","is_dst":true},
	"CHADT": { "utc_offset":"13:45:00","is_dst":true},
	"CHAST": { "utc_offset":"12:45:00","is_dst":false},
	"CHUT": { "utc_offset":"10:00:00","is_dst":false},
	"CKT": { "utc_offset":"-10:00:00","is_dst":false},
	"CLST": { "utc_offset":"-03:00:00","is_dst":true},
	"CLT": { "utc_offset":"-03:00:00","is_dst":false},
	"COT": { "utc_offset":"-05:00:00","is_dst":false},
	"CST": { "utc_offset":"-06:00:00","is_dst":false},
	"CXT": { "utc_offset":"07:00:00","is_dst":false},
	"DAVT": { "utc_offset":"07:00:00","is_dst":false},
	"DDUT": { "utc_offset":"10:00:00","is_dst":false},
	"EASST": { "utc_offset":"-05:00:00","is_dst":true},
	"EAST": { "utc_offset":"-05:00:00","is_dst":false},
	"EAT": { "utc_offset":"03:00:00","is_dst":false},
	"EDT": { "utc_offset":"-04:00:00","is_dst":true},
	"EEST": { "utc_offset":"03:00:00","is_dst":true},
	"EET": { "utc_offset":"02:00:00","is_dst":false},
	"EETDST": { "utc_offset":"03:00:00","is_dst":true},
	"EGST": { "utc_offset":"00:00:00","is_dst":true},
	"EGT": { "utc_offset":"-01:00:00","is_dst":false},
	"EST": { "utc_offset":"-05:00:00","is_dst":false},
	"FET": { "utc_offset":"03:00:00","is_dst":false},
	"FJST": { "utc_offset":"13:00:00","is_dst":true},
	"FJT": { "utc_offset":"12:00:00","is_dst":false},
	"FKST": { "utc_offset":"-03:00:00","is_dst":false},
	"FKT": { "utc_offset":"-04:00:00","is_dst":false},
	"FNST": { "utc_offset":"-01:00:00","is_dst":true},
	"FNT": { "utc_offset":"-02:00:00","is_dst":false},
	"GALT": { "utc_offset":"-06:00:00","is_dst":false},
	"GAMT": { "utc_offset":"-09:00:00","is_dst":false},
	"GEST": { "utc_offset":"04:00:00","is_dst":true},
	"GET": { "utc_offset":"04:00:00","is_dst":false},
	"GFT": { "utc_offset":"-03:00:00","is_dst":false},
	"GILT": { "utc_offset":"12:00:00","is_dst":false},
	"GMT": { "utc_offset":"00:00:00","is_dst":false},
	"GYT": { "utc_offset":"-04:00:00","is_dst":false},
	"HKT": { "utc_offset":"08:00:00","is_dst":false},
	"HST": { "utc_offset":"-10:00:00","is_dst":false},
	"ICT": { "utc_offset":"07:00:00","is_dst":false},
	"IDT": { "utc_offset":"03:00:00","is_dst":true},
	"IOT": { "utc_offset":"06:00:00","is_dst":false},
	"IRKST": { "utc_offset":"09:00:00","is_dst":true},
	"IRKT": { "utc_offset":"08:00:00","is_dst":false},
	"IRT": { "utc_offset":"03:30:00","is_dst":false},
	"IST": { "utc_offset":"02:00:00","is_dst":false},
	"JAYT": { "utc_offset":"09:00:00","is_dst":false},
	"JST": { "utc_offset":"09:00:00","is_dst":false},
	"KDT": { "utc_offset":"10:00:00","is_dst":true},
	"KGST": { "utc_offset":"06:00:00","is_dst":true},
	"KGT": { "utc_offset":"06:00:00","is_dst":false},
	"KOST": { "utc_offset":"11:00:00","is_dst":false},
	"KRAST": { "utc_offset":"08:00:00","is_dst":true},
	"KRAT": { "utc_offset":"07:00:00","is_dst":false},
	"KST": { "utc_offset":"09:00:00","is_dst":false},
	"LHDT": { "utc_offset":"11:00:00","is_dst":true},
	"LHST": { "utc_offset":"10:30:00","is_dst":false},
	"LIGT": { "utc_offset":"10:00:00","is_dst":false},
	"LINT": { "utc_offset":"14:00:00","is_dst":false},
	"LKT": { "utc_offset":"06:00:00","is_dst":false},
	"MAGST": { "utc_offset":"12:00:00","is_dst":true},
	"MAGT": { "utc_offset":"10:00:00","is_dst":false},
	"MART": { "utc_offset":"-09:30:00","is_dst":false},
	"MAWT": { "utc_offset":"05:00:00","is_dst":false},
	"MDT": { "utc_offset":"-06:00:00","is_dst":true},
	"MEST": { "utc_offset":"02:00:00","is_dst":true},
	"MET": { "utc_offset":"01:00:00","is_dst":false},
	"METDST": { "utc_offset":"02:00:00","is_dst":true},
	"MEZ": { "utc_offset":"01:00:00","is_dst":false},
	"MHT": { "utc_offset":"12:00:00","is_dst":false},
	"MMT": { "utc_offset":"06:30:00","is_dst":false},
	"MPT": { "utc_offset":"10:00:00","is_dst":false},
	"MSD": { "utc_offset":"04:00:00","is_dst":true},
	"MSK": { "utc_offset":"03:00:00","is_dst":false},
	"MST": { "utc_offset":"-07:00:00","is_dst":false},
	"MUST": { "utc_offset":"05:00:00","is_dst":true},
	"MUT": { "utc_offset":"04:00:00","is_dst":false},
	"MVT": { "utc_offset":"05:00:00","is_dst":false},
	"MYT": { "utc_offset":"08:00:00","is_dst":false},
	"NDT": { "utc_offset":"-02:30:00","is_dst":true},
	"NFT": { "utc_offset":"-03:30:00","is_dst":false},
	"NOVST": { "utc_offset":"07:00:00","is_dst":true},
	"NOVT": { "utc_offset":"06:00:00","is_dst":false},
	"NPT": { "utc_offset":"05:45:00","is_dst":false},
	"NST": { "utc_offset":"-03:30:00","is_dst":false},
	"NUT": { "utc_offset":"-11:00:00","is_dst":false},
	"NZDT": { "utc_offset":"13:00:00","is_dst":true},
	"NZST": { "utc_offset":"12:00:00","is_dst":false},
	"NZT": { "utc_offset":"12:00:00","is_dst":false},
	"OMSST": { "utc_offset":"07:00:00","is_dst":true},
	"OMST": { "utc_offset":"06:00:00","is_dst":false},
	"PDT": { "utc_offset":"-07:00:00","is_dst":true},
	"PET": { "utc_offset":"-05:00:00","is_dst":false},
	"PETST": { "utc_offset":"12:00:00","is_dst":true},
	"PETT": { "utc_offset":"12:00:00","is_dst":false},
	"PGT": { "utc_offset":"10:00:00","is_dst":false},
	"PHOT": { "utc_offset":"13:00:00","is_dst":false},
	"PHT": { "utc_offset":"08:00:00","is_dst":false},
	"PKST": { "utc_offset":"06:00:00","is_dst":true},
	"PKT": { "utc_offset":"05:00:00","is_dst":false},
	"PMDT": { "utc_offset":"-02:00:00","is_dst":true},
	"PMST": { "utc_offset":"-03:00:00","is_dst":false},
	"PONT": { "utc_offset":"11:00:00","is_dst":false},
	"PST": { "utc_offset":"-08:00:00","is_dst":false},
	"PWT": { "utc_offset":"09:00:00","is_dst":false},
	"PYST": { "utc_offset":"-03:00:00","is_dst":true},
	"PYT": { "utc_offset":"-04:00:00","is_dst":false},
	"RET": { "utc_offset":"04:00:00","is_dst":false},
	"SADT": { "utc_offset":"10:30:00","is_dst":true},
	"SAST": { "utc_offset":"02:00:00","is_dst":false},
	"SCT": { "utc_offset":"04:00:00","is_dst":false},
	"SGT": { "utc_offset":"08:00:00","is_dst":false},
	"TAHT": { "utc_offset":"-10:00:00","is_dst":false},
	"TFT": { "utc_offset":"05:00:00","is_dst":false},
	"TJT": { "utc_offset":"05:00:00","is_dst":false},
	"TKT": { "utc_offset":"13:00:00","is_dst":false},
	"TMT": { "utc_offset":"05:00:00","is_dst":false},
	"TOT": { "utc_offset":"13:00:00","is_dst":false},
	"TRUT": { "utc_offset":"10:00:00","is_dst":false},
	"TVT": { "utc_offset":"12:00:00","is_dst":false},
	"UCT": { "utc_offset":"00:00:00","is_dst":false},
	"ULAST": { "utc_offset":"09:00:00","is_dst":true},
	"ULAT": { "utc_offset":"08:00:00","is_dst":false},
	"UT": { "utc_offset":"00:00:00","is_dst":false},
	"UTC": { "utc_offset":"00:00:00","is_dst":false},
	"UYST": { "utc_offset":"-02:00:00","is_dst":true},
	"UYT": { "utc_offset":"-03:00:00","is_dst":false},
	"UZST": { "utc_offset":"06:00:00","is_dst":true},
	"UZT": { "utc_offset":"05:00:00","is_dst":false},
	"VET": { "utc_offset":"-04:30:00","is_dst":false},
	"VLAST": { "utc_offset":"11:00:00","is_dst":true},
	"VLAT": { "utc_offset":"10:00:00","is_dst":false},
	"VOLT": { "utc_offset":"04:00:00","is_dst":false},
	"VUT": { "utc_offset":"11:00:00","is_dst":false},
	"WADT": { "utc_offset":"08:00:00","is_dst":true},
	"WAKT": { "utc_offset":"12:00:00","is_dst":false},
	"WAST": { "utc_offset":"07:00:00","is_dst":false},
	"WAT": { "utc_offset":"01:00:00","is_dst":false},
	"WDT": { "utc_offset":"09:00:00","is_dst":true},
	"WET": { "utc_offset":"00:00:00","is_dst":false},
	"WETDST": { "utc_offset":"01:00:00","is_dst":true},
	"WFT": { "utc_offset":"12:00:00","is_dst":false},
	"WGST": { "utc_offset":"-02:00:00","is_dst":true},
	"WGT": { "utc_offset":"-03:00:00","is_dst":false},
	"XJT": { "utc_offset":"06:00:00","is_dst":false},
	"YAKST": { "utc_offset":"10:00:00","is_dst":true},
	"YAKT": { "utc_offset":"09:00:00","is_dst":false},
	"YAPT": { "utc_offset":"10:00:00","is_dst":false},
	"YEKST": { "utc_offset":"06:00:00","is_dst":true},
	"YEKT": { "utc_offset":"05:00:00","is_dst":false},
	"Z": { "utc_offset":"00:00:00","is_dst":false},
	"ZULU": { "utc_offset":"00:00:00","is_dst":false}
}
