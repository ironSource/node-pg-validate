// PostgreSQL supports the SQL-standard notations float and float(p),
// where p is the minimum acceptable precision in binary digits.
exports.factory = function (validators) {
	return function PGFloat(binaryPrecision) {
		// float with no precision is taken to mean double precision
		if (binaryPrecision == null)
			return validators.double_precision

		// float(1) to float(24) select the real type
		if (binaryPrecision >= 1 && binaryPrecision <= 24)
			return validators.real

		// float(25) to float(53) select double precision
		if (binaryPrecision >= 25 && binaryPrecision <= 52)
			return validators.double_precision

		throw new Error('precision is out of range for float(p)')
	}
}
