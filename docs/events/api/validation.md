# Validation

Vandium uses [Joi](https://github.com/hapijs/joi) as the engine for validation on specific elements inside the event. Validation schemas are
applied to one or more sections of the `event` object and can be targeted to the `headers`, `queryStringParameters`, `body` and
`pathParameters` elements. Each item inside the element can be validated using one of the build-in types inside Vandium.

## Types

The following types are supported for validation.

Type		   | Description
------------|------------
string      | String value. Automatically trimmed
number      | Number value (integer or floating point)
boolean     | Boolean value (`true` or `false`)
date        | Date value
email       | Email address
uuid        | [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUID)
binary	    | Binary value uncoded using `base64`
any		    | Any type of value
object      | Object
array       | Arrays of values
alternatives| Alternative selection of values

## Value Conversion

Values will be converted, if needed, and will reduce the amount of code you need to write in your handler. For example, the
validation configuration of:

```js
{
    body: {

        age: vandium.types.number().required()
    }
}
```

with an event of:

```js
{
    // other event elements

    body: {

        age: '42'
    }
}
```

would be converted to:

```js
{
    // other event elements
    //
    body: {

        age: 42
    }
}
```

Additionally, `binary` data with a schema of:

```js
{
    body: {

        data: vandium.types.binary()
    }
}
```

with an event containing:

```js
{
    // other event elements

    body: {

        data: 'dmFuZGl1bSBsYW1iZGEgd3JhcHBlcg=='
    }
}
```

would be get converted to a `Buffer` instance with the data parsed and loaded:

```js
{
    // other event elements

    body: {

        data: Buffer( ... )
    }
}
```

## Type: `string`

String validators can be created by calling `vandium.types.string()`, using "string" or "object" notation. The implementation of the
`string` validator is based on `Joi`, and thus can use most of the functionality available in the `Joi` library for the `string` type. All
`string` validators in Vandium will automatically trim leading and trailing whitespace.

Simple validation:

```js
{
    body: {

        name: vandium.types.string().min( 1 ).max( 250 ).required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        name: 'string:min=1,max=250,required'
    }
}
```


Regex expressions can be used:

```js
{
    requestParameters: {

        id: vandium.types.string().regex( /^[abcdef]+$/ )
    }
}
```

Strings are automatically trimmed. To disable this functionality, add an option when creating the type:

```js
{
    string_not_trimmed: vandium.types.string( { trim: false } )
}
```

## Type: `number`

Number validators can be created by calling `vandium.types.number()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `number` type.

```js
{
    body: {

        // age must be a number, between 0 and 130 and is required
    	age: vandium.types.number().integer().min( 0 ).max( 130 ).required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        age: 'number:integer,min=0,max=130,required'
    }
}
```


## Type: `boolean`

Boolean validators can be created by calling `vandium.types.boolean()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `boolean` type.

The `boolean` validator can accept the following values: `true`, `false`, `"true"`, `"false"`, `"yes"` and `"no"`.


```js
{
    body: {

        allow: vandium.types.boolean().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        allow: 'boolean:required'
    }
}
```

## Type: `date`

Date validators can be created by calling `vandium.types.date()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `date` type.

The `date` validator can match values against standard Javascript date format as well as the number of milliseconds since the epoch.

```js
{
    queryStringParameters: {

        start: vandium.types.date().min( '1-1-1970' ).required(),
    	end: vandium.types.date().max( 'now' ).required()
    }
}
```

This could also be writing using a string notation:

```js
{
    queryStringParameters: {

        start: 'date:min=1-1-1970,required',
        end: 'date:max=now,required'
    }
}
```

## Type: `email`

The `email` validator matches values that conform to valid email address format. Email validators can be created by calling `vandium.types.email()`,
using "string" or "object" notation. The implementation is based on `string` type found in `Joi`.


```js
{
    body: {

        address: vandium.types.email().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        address: 'email:required'
    }
}
```

## Type: `uuid`

The `uuid` validator matches values that conform to the [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)
(UUID) specification. UUID validators can be created by calling `vandium.types.uuid()`, using "string" or "object" notation. The
implementation is based on `string` type found in `Joi`.

```js
{
    requestParameters: {

        id: vandium.types.uuid().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    requestParameters: {

        id: 'uuid:required'
    }
}
```

## Type: `binary`

Binary validators can be created by calling `vandium.types.binary()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `binary` type.


```js
{
    body: {

        data: vandium.types.binary().encoding( 'base64' ).min( 10 ).max( 1000 )
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        data: 'binary:encoding=base64,min=10,max=100'
    }
}
```

## Type: `any`

the `any` type can represent any type of value and the validator performs minimal validation. "Any" validators can be created by calling
`vandium.types.any()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `any` type.

```js
{
    body: {

        name: vandium.types.any().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        name: 'any:required'
    }
}
```

## Type: `object`

The `object` validator allows validation of an object and potentially the values within it. Object validators can be created by calling
`vandium.types.object()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `object` type.

```js
{
    body: {

        job: vandium.types.object().keys({

    			name: vandium.types.string().required(),
    			dept: vandium.types.string().required()
         	}).required();
    }
}
```

This could also be writing using a string notation:

```js
{

    body: {

        job: {

            name: 'string:required',
            dept: 'string:required',

            '@required': true
        }
    }
}
```

## Type: `array`

The `array` can match values the are part of a selection, specific types and/or pattern. Array validators can be created by calling
`vandium.types.array()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `array` type.

```js
{
    body: {

        // matching seven numbers between 1 and 49:
    	lucky_numbers: vandium.types.array().items( vandium.types.number().min( 1 ).max( 49 ) ).length( 7 )
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        lucky_numbers: {

            '@items': [ 'number:min=1,max=49' ],
            length: 7
        }
    }
}
```

## Type: `alternatives`

The `alternatives` validator is used to choose between two types of values. "Alternatives" validators can be created by calling
`vandium.types.alternatives()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality
available in the `Joi` library for the `alternatives` type.

```js
{
    requestParameters: {

        // key can be uuid or name
    	key: vandium.types.alternatives().try( vandium.types.uuid(), vandium.types.string() )
    }
}
```

This could also be writing using a string notation:

```js
{
    requestParameters: {

        key: [ 'uuid', 'string' ]
    }
}
```


For more information on how to configure validators, see the [joi reference](https://github.com/hapijs/joi/blob/master/API.md)
