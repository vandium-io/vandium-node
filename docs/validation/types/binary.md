# Type: `binary`

Binary validators can be created by calling `vandium.types.binary()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `binary` type.

Once binary values are processed, they are converted into `Buffer` instances.

## Examples

### Using `vandium.types.binary()`:

```js
{
	data: vandium.types.binary().encoding( 'base64' ).min( 10 ).max( 1000 )
}
```

### Using "string" notation:

```js
{
    data: 'binary:encoding=base64,min=10,max=100'
}
```

### Using "object" notation:

```js
{
    data: {

        '@type': 'binary',
        encoding: 'base64',
        min: 10,
        max: 100
    }
}
```

For more information on how to configure binary validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#binary) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
