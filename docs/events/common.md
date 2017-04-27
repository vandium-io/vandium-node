# Common functionality available to all handlers


## `finally()`

The `finally()` method is executed after each execution of the handler if your code has been executed. If an exception is raised within the
`finally()` function, it will get logged and execution will continue.

This example shows how you can use the `finally()` method to free a cache connection after each execution using the `api` event type:

```js
const vandium = require( 'vandium' );

const User = require( './user' );

const cache = require( './cache' );

exports.handler = vandium.api()
        .GET( (event) => {

                // handle get request
                return User.get( event.pathParmeters.name );
            })
        .POST( {

                // validate
                body: {

                    name: vandium.types.string().min(4).max(200).required()
                }
            },
            (event) => {

                // handle POST request
                return User.create( event.body.name );
            })
        .finally( () => {

            // close the cache if open - gets executed on every call
            return cache.close();
        });
```

**Note:** If an exception is thrown during the validation and verification, such as JWT processing, phase prior to your code execution,
then the code inside `finally()` will not get called.
