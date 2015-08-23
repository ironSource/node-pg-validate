# pg-validate
Given table
[foo smallint]
[bar varchar(10)]

```js
var metadata = ... // use pg-metadata module
var validate = require('pg-validate')

// Validate for PostgreSQL
var errors = validate.pg.object({
    foo: 1280000,
    bar: 'aaaaaa'
}, metadata)

// Validate for Redshift
var errors = validate.redshift.object({
    foo: 1280000,
    bar: 'aaaaaa'
}, metadata)

// Or the verbose way
var errors = validate.object({
    foo: 1280000,
    bar: 'aaaaaa'
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

- `varchar` or `char` or `bpchar`
- `text`: strings of any length on PostgreSQL, an alias of `varchar` on Redshift

### Timestamp

### DateTime

- `timestamp[ (p) ]` or `timestamptz [ (p) ]`
- `date`
- `time [ (p) ]` or `timetz [ (p) ]`
- `interval [ fields ] [ (p) ]`

For the purposes of validation, there's no difference between `time` and `timetz`, or `timestamp` and `timestamptz`. This is because PostgreSQL silently ignores time zones for types without a time zone. And though Redshift stores dates in UTC, it does accept input values with a time zone - with the exception of full time zone names like "America/New_York".

**Not currently supported:**

- Julian Day ("J2451187"), BC/AC dates, or ambiguous dates in a [DateStyle](http://www.postgresql.org/docs/9.1/static/runtime-config-client.html#GUC-DATESTYLE) mode
- Time values with a precision greater than 3
- Dates outside the range of `moment.js` and `Date`
- Custom configured timezone [names](http://www.postgresql.org/docs/9.1/static/view-pg-timezone-names.html) or [abbreviations](http://www.postgresql.org/docs/9.4/static/view-pg-timezone-abbrevs.html). In the future, the list of supported timezone values could be dynamically generated, via `SELECT row_to_json(pg_timezone_abbrevs) FROM pg_timezone_abbrevs` and the same for `pg_timezone_names`. For those timezones that are DST sensitive (`is_dst: true`), we should validate that values have a date.
- POSIX-style time zone specifications

## Test

Requires a PostgreSQL or Redshift database. Create a dummy user and database (nothing is written by the tests) and specify the credentials in the `PG_VALIDATE` environment variable:

```
PG_VALIDATE=postgres://user:password@localhost:5432/database
npm test
```
