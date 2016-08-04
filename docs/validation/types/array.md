# Type: `array`

The `array` can match values the are part of a selection, specific types and/or pattern. Array validators can be created by calling
`vandium.types.array()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `array` type.

## Examples

### Using `vandium.types.array()`:

```js
{
    // matching seven numbers between 1 and 49:
	lucky_numbers: vandium.types.array().items( vandium.types.number().min( 1 ).max( 49 ) ).length( 7 )
}
```

### Using "string" notation:

```js
{
    lucky_numbers: {

        '@items': [ 'number:min=1,max=49' ],
        length: 7
    }
}
```

### Using "object" notation:

```js
{
    lucky_numbers: {

        '@type': 'array',
        items: [ {

            '@type': 'number',
            min: 1,
            max: 49
        } ],
        length: 7
    }
}
```

For more information on how to configure array validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#array) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
