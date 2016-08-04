# Type: `uuid`

The `email` validator matches values that conform to valid email address format. Email validators can be created by calling `vandium.types.email()`,
using "string" or "object" notation. The implementation is based on `string` type found in `Joi`.

## Examples

### Using `vandium.types.email()`:

```js
{
	address: vandium.types.email().required()
}
```

### Using "string" notation:

```js
{
    address: 'email:required'
}
```

### Using "object" notation:

```js
{
    address: {

        '@type': 'email',
        required: true
    }
}
```

For more information on how to configure email validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#string) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
