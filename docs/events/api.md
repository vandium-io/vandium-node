# `api` event type

The `api` event type is used to handle [AWS API Gateway](https://aws.amazon.com/api-gateway) events using the Lambda Proxy based method for
handling resource events. The `api` handler can be used to create sub-handlers for each of the HTTP methods, handle results or errors and
ensure that the response is in the correct format for API Gateway.

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

## HTTP Method Handlers
The `api` event handler supports the following HTTP methods:

* GET
* POST
* PUT
* PATCH
* DELETE
* HEAD

Each method handler can have an optional validation section, specified before the handler, to ensure the supplied request information is
valid before any logic gets executed. Method handlers can receive additional information to allow them access to more information
as needed. Revisiting the previous example, we can expand the method handlers to illustrate how one might want to access the `context`
parameter or perform traditional asynchronous calls using a `callback` function.

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

## validation

TBD

## JWT

TBD

## Responses

TBD

## errors

TBD

## Injection Protection

TBD

## Clean up

TBD
