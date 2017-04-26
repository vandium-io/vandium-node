# Getting Started

Typical handler for API Gateway would be as follows:

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
        .PATCH( {

                // validate
                body: {

                    age: vandium.types.number().min(0).max(130)
                }
            },
            (event) => {

                // handle PATCH request
                return User.update( event.pathParmeters.name, event.body );
            })
        .DELETE( (event) => {

                // handle DELETE request
                return User.delete( event.pathParmeters.name );
            })
        .finally( () => {

            // close the cache if open - gets executed on every call
            return cache.close();
        });
```

As you can see, the individual HTTP methods have their own independent paths inside the proxied handler, each with their own ability to
validate specific event parameters if required. Also note that the `User` module used Promises to handle the asynchronous calls, this
simplifies the code, enhances readability and reduces complexity.
