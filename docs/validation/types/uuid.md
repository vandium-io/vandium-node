# Type: `uuid`

The `uuid` validator matches values that conform to the [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)
(UUID) specification. UUID validators can be created by calling `vandium.types.uuid()`, using "string" or "object" notation. The
implementation is based on `string` type found in `Joi`.

## Examples

### Using `vandium.types.uuid()`:

```js
{
	id: vandium.types.uuid().required()
}
```

### Using "string" notation:

```js
{
    id: 'uuid:required'
}
```

### Using "object" notation:

```js
{
    id: {

        '@type': 'uuid',
        required: true
    }
}
```

For more information on how to configure uuid validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#string) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
