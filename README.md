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

### Boolean

### Char

### Timestamp

### DateTime
