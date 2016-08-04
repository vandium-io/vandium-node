# Type: `alternatives`

The `alternatives` validator is used to choose between two types of values. "Alternatives" validators can be created by calling
`vandium.types.alternatives()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality
available in the `Joi` library for the `alternatives` type.

## Examples

### Using `vandium.types.alternatives()`:

```js
{
    // key can be uuid or name

	key: vandium.types.alternatives().try( vandium.types.uuid(), vandium.types.string() )
}
```

### Using "string" notation:

```js
{
    key: [ 'uuid', 'string' ]
}
```

### Using "object" notation:

```js
{
    key: [

        {
            '@type': 'uuid'
        },
        {
            '@type': 'string'
        }
    ]
}
```

For more information on how to configure `alternatives` validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#alternatives) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
