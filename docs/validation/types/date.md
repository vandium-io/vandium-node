# Type: `date`

Date validators can be created by calling `vandium.types.date()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `date` type.

The `date` validator can match values against standard Javascript date format as well as the number of milliseconds since the epoch.

## Examples

### Using `vandium.types.date()`:

```js
{
	start: vandium.types.date().min( '1-1-1970' ).required()
	end: vandium.types.date().max( 'now' ).required()
}
```

### Using "string" notation:

```js
{
    start: 'date:min=1-1-1970,required',
    end: 'date:max=now,required',
}
```

### Using "object" notation:

```js
{
    start: {

        '@type': 'date',
        min: '1-1-1970',
        required: true
    },

    end: {

        '@type': 'date',
        max: 'now',
        required: true
    }
}
```

For more information on how to configure date validators, see the [joi reference](https://github.com/hapijs/joi/tree/v8.0.5#date) and
the [Joi-JSON documentation](https://github.com/vandium-io/joi-json/tree/master/docs).
