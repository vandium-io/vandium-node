# Type: `any`

the `any` type can represent any type of value and the validator performs minimal validation. "Any" validators can be created by calling
`vandium.types.any()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `any` type.

## Examples

### Using `vandium.types.any()`:

```js
{
	name: vandium.types.any().required()
}
```

### Using "string" notation:

```js
{
    name: 'any:required'
}
```

### Using "object" notation:

```js
{
    name: {

        '@type': 'any',
        required: true
    }
}
```

For more information on how to configure any validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#any) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
