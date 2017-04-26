# HTTP Methods

The `api` event handler supports the following HTTP methods:

* GET
* POST
* PUT
* PATCH
* DELETE
* HEAD

Each method handler can have an optional validation section, specified before the handler, to ensure the supplied request information is
valid before any logic gets executed. Method handlers can receive additional information to allow them access to more information
as needed. Revisiting the example in the "Getting Started" section, we can expand the method handlers to illustrate how one might want to
access the `context` parameter or perform traditional asynchronous calls using a `callback` function.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

                // handle get request
            })
        .POST( {

                // validate
                body: {

                    name: vandium.types.string().min(4).max(200).required()
                }
            },
            (event, context) => {

                // handle POST request
                return User.create( event.body.name );
            })
        .PATCH( {

                // validate
                body: {

                    age: vandium.types.number().min(0).max(130)
                }
            },
            (event, context, callback) => {

                // do something
                callback( null, 'updated!' );
            });
```

**Note:** Although the `context` parameter is available, Vandium will disable `context.succeed()`, `context.fail()` and `context.done()`
methods.
