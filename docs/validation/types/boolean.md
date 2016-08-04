# Type: `boolean`

Boolean validators can be created by calling `vandium.types.boolean()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `boolean` type.

The `boolean` validator can accept the following values: `true`, `false`, `"true"`, `"false"`, `"yes"` and `"no"`.

## Examples

### Using `vandium.types.boolean()`:

```js
{
	allow: vandium.types.boolean().required()
}
```

### Using "string" notation:

```js
{
    allow: 'boolean:required'
}
```

### Using "object" notation:

```js
{
    allow: {

        '@type': 'boolean',
        required: true
    }
}
```

For more information on how to configure boolean validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#boolean) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
