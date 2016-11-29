# Validation

Since the proxy resource format uses a specific structure, Vandium uses a different method to validate data members inside the `event` object.

The schema for validating `headers` and `body` sections of the event would use the following format:

```js
{
    headers: {

        // validation of header fields here
    },

    body: {

        // validation of body fields here
    }
}
```

So if our event object contained a custom header of `x-custom-header` that we wanted to validate along with a body object with `first`,
`last` and `age`, our schema might look like:

```js
{
    headers: {

        'x-custom-header': vandium.types.string().required()
    },

    body: {

        first: vandium.types.string().required(),
        last: vandium.types.string().required(),
        age: vandium.types.number().required()
    }
}
```

If the lambda proxy is used with the `ANY` method, i.e. various methods, then an additional level can be introduced to validate events for separate
methods. The following example demonstrates how the schema would be defined for the `ANY` case:

```js
{
    GET: {

        headers: {

            'x-custom-header': vandium.types.string().required()
        },
    },

    PUT: {

        headers: {

            'x-custom-header': vandium.types.string().required()
        },

        body: {

            first: vandium.types.string().required(),
            last: vandium.types.string().required(),
            age: vandium.types.number().required()
        }
    },

    POST: 'PUT'     // POST uses the same schema as PUT
}
```
