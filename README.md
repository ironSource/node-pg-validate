# pg-validate
Given table
[foo smallint]
[bar varchar(10)]

```
var metadata = ... // use pg-metadata module
var validate = require('pg-validate')

var errors = validate.object({
    foo: 1280000,
    bar: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
}, metadata, { platform: validate.REDSHIFT })
```

## Supported Types

### Integer

- `smallint` or `int2`
- `integer` or `int4`
- `bigint` or `int8`
- `serial`
- `bigserial`

### Numeric

- `numeric` or `decimal`
- `numeric(p, s)`, where `p` is the *maximum* precision in decimal digits and `s` is the scale (number of fractional digits). `numeric(p)` selects a scale of `0`.
- `float4` or `real`
- `float8` or `double_precision` or `float`
- PostgreSQL only: `float(p)`, where `p` is the *minimum acceptable* precision in binary digits. `float(1)` to `float(23)` selects `real`, `float(24)` to `float(53)` selects `double_precision`. Note that `p` is not used to validate values, unlike `numeric(p)`.

### Boolean

- `boolean`

### Char

- `varchar` or `char`

### Timestamp

### DateTime

- `timestamp[ (p) ]` or `timestamptz [ (p) ]`
- `date`
- `time [ (p) ]` or `timetz [ (p) ]`

For the purposes of validation, there's no difference between `time` and `timetz`, or `timestamp` and `timestamptz`. This is because PostgreSQL silently ignores time zones for types without a time zone.

**Not currently supported:**

- Julian Day ("J2451187"), BC/AC dates, or ambiguous dates in a [DateStyle](http://www.postgresql.org/docs/9.1/static/runtime-config-client.html#GUC-DATESTYLE) mode
- Time values with a precision greater than 3
- Formats other than ISO 8601 for timestamps
- Dates outside the range of `moment.js` and `Date`
- The `interval [ fields ] [ (p) ]` type
- Redshift only supports `date` and `timestamp`, without time zones. This is not yet enforced.
- Custom configured timezone [names](http://www.postgresql.org/docs/9.1/static/view-pg-timezone-names.html) or [abbreviations](http://www.postgresql.org/docs/9.4/static/view-pg-timezone-abbrevs.html). In the future, the list of supported timezone values could be dynamically generated, via `SELECT row_to_json(pg_timezone_abbrevs) FROM pg_timezone_abbrevs` and the same for `pg_timezone_names`. For those timezones that are DST sensitive (`is_dst: true`), we should validate that values have a date.
- POSIX-style time zone specifications

## Test

Requires a PostgreSQL instance. Create a dummy user and database (nothing is written by the tests) and specify the credentials in the `PG_VALIDATE` environment variable:

```
PG_VALIDATE=postgres://user:password@localhost:5432/database
npm test
```
