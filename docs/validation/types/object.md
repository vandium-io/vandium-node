# Type: `object`

The `object` validator allows validation of an object and potentially the values within it. Object validators can be created by calling
`vandium.types.object()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `object` type.

## Examples

### Using `vandium.types.object()`:

```js
{
    job: vandium.types.object().keys({

			name: vandium.types.string().required(),
			dept: vandium.types.string().required()
     	}).required();
}
```

### Using "string" notation:

```js
{
    job: {

        name: 'string:required',
        dept: 'string:required',

        '@required': true
    }
}
```

### Using "object" notation:

```js
{
    job: {

        '@type': 'object',

        name: {

            '@type': 'string',
            required: true
        },

        dept: {

            '@type': 'string',
            required: true
        },

        '@required': true
    }
}
```

For more information on how to configure object validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#object) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
