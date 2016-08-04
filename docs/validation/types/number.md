# Type: `number`

Number validators can be created by calling `vandium.types.number()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `number` type.

## Examples

### Using `vandium.types.number()`:

```js
{
    // age must be a number, between 0 and 130 and is required

	age: vandium.types.number().integer().min( 0 ).max( 130 ).required()
}
```

### Using "string" notation:

```js
{
    age: 'number:integer,min=0,max=130,required'
}
```

### Using "object" notation:

```js
{
    age: {

        '@type': 'number',
        integer: true,
        min: 0,
        max: 130,
        required: true
    }
}
```

For more information on how to configure number validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#number) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
