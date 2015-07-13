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

## Test

Requires a PostgreSQL instance. Create a dummy user and database (nothing is written by the tests) and specify the credentials in the `PG_VALIDATE` environment variable:

```
PG_VALIDATE=postgres://user:password@localhost:5432/database
npm test
```
