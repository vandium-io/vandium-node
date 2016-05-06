# Event Validation

Vandium allows validations on basic types, objects and arrays. Additionally validation can be performed on nested values inside objects and arrays. Vandium's validation system uses [joi (version 8.0.x)](https://github.com/hapijs/joi/tree/v8.0.5) internally and thus most of its functionality may be used.

## Types

Type		   | Description
------------|------------
string      | String value. Automatically trimmed
number      | Number value (integer or floating point)
boolean     | Boolean value (`true` or `false`)
date        | Date value
email       | Email address
uuid        | [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUID)
binary	   | Binary value uncoded using `base64`
any		   | Any type of value
object      | Object
array       | Arrays of values

## Common Scenarios

### Strings

For a string that is between 1 and 250 characters long and required, the following would be used:

```js
{
    name: vandium.types.string().min( 1 ).max( 250 ).required()
}
```

Regex expressions can be used:

```js
{
    type: vandium.types.string().regex( /^[abcdef]+$/ )
}
```

Note: Strings are automatically trimmed. To disable this functionality, add an option when creating the type:

```js
{
    string_not_trimmed: vandium.types.string( { trim: false } )
}
```

For more information on how to configure strings, see the [joi string reference](https://github.com/hapijs/joi/tree/v8.0.5#string).

### Numbers

Numbers can be validated against ranges and forced to be integers:

```js
{
	age: vandium.types.number().integer().min( 0 ).max( 130 ).required()
}
```

To specify the number of decimal places allowed:

```js
{
	price: vandium.types.number(). precision( 2 ).required()
}
```

For more information on how to configure numbers, see the [joi numbers reference](https://github.com/hapijs/joi/tree/v8.0.5#number).

### Boolean

The `boolean` validator can accept the following values: `true`, `false`, `"true"`, `"false"`, `"yes"` and `"no"`.

### Date

The `date` validator can match values against standard Javascript date format as well as the number of milliseconds since the epoch.

Ranges can be specified using min and max:

```js
{
	start: vandium.types.date().min( '1-1-1970' ).required(),
	end: vandium.types.date().max( 'now' ).required()
}
```

For more information on how to configure dates, see the [joi date reference](https://github.com/hapijs/joi/tree/v8.0.5#date).

### Email

The `email` validator matches values that conform to valid email address format. Since this validator uses strings, it additional string operations can be used with it.

### UUID

The `uuid` validator matches values that conform to the UUID specification. This validator is based on the string validator and thus other string operations can be used.

### Binary

Binary values can be limited by length:

```js
{
	data: vandium.types.binary().min( 10 ).max( 1000 )
}
```

Once binary values are processed, they are converted into `Buffer` instances.

### Any

The `any` validator will match any value. For more information about using this validator, see the [joi any reference](https://github.com/hapijs/joi/tree/v8.0.5#any).


### Object

The `object` validator allows validation of an object and potentially the values within it. For example, if an object contains information about an job position the following validator could be used:

```js
{
	job: vandium.types.object().keys({

			name: vandium.types.string().required(),
			dept: vandium.types.string().required(),
			salary: vandium.types.number().precision( 2 ).required(),
			vacation_days: vandium.types.number().integer().required(),
			hiring_manager: vandium.types.string()
     	})
}
```

For more information on how to configure objects, see the [joi object reference](https://github.com/hapijs/joi/tree/v8.0.5#object).

### Array

The `array` can match values the are part of a selection, specific types and/or pattern.

The following example demonstrates matching seven numbers between 1 and 49:

```js
{
	lucky_numbers: vandium.types.array().includes( vandium.types.number().min( 1 ).max( 49 ) ).length( 7 )
}
```

For more information on how to configure arrays, see the [joi array reference](https://github.com/hapijs/joi/tree/v8.0.5#array).


## Value Conversion

Values will be converted, if required, to reduce the amount of code required in the user portion of the lambda function. For example, the validation configuration of:

```js
vandium.validation( {

    age: vandium.types.number().required()
});
```

with an event of:

```js
{
    age: '42'
}
```

would be converted to:

```js
{
    age: 42
}
```

Additionally, `binary` data with a schema of:

```js
vandium.validation( {

    data: vandium.types.binary()
});
```
with an event containing:

```js
{
    data: 'dmFuZGl1bSBsYW1iZGEgd3JhcHBlcg=='
}
```
would be converted to a `Buffer` instance with the data parsed and loaded:

```js
{
    data: Buffer( ... )
}
```

---
[Back to Documentation Home](main.md)
