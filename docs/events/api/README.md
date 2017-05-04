# `api` event type

The `api` event type is used to handle [AWS API Gateway](https://aws.amazon.com/api-gateway) events using the Lambda Proxy based method for
handling resource events. The `api` handler can be used to create sub-handlers for each of the HTTP methods, handle results or errors and
ensure that the response is in the correct format for API Gateway.

Typical handler for a `GET` method request for API Gateway would look like:

```js
const vandium = require( 'vandium' );

const User = require( './user' );

const cache = require( './cache' );

exports.handler = vandium.api()
        .GET( (event) => {

                // handle get request
                return User.get( event.pathParameters.name );
            })
        .finally( () => {

            // close the cache if open - gets executed on every call
            return cache.close();
        });
```

In the above example, the handler will validate that the event is for API Gateway and that it is a `GET` HTTP request. Note that the `User`
module used Promises to handle the asynchronous calls, this simplifies the code, enhances readability and reduces complexity.


Vandium allows you to create a compound function for handling different types of HTTP requests.

```js
const vandium = require( 'vandium' );

const User = require( './user' );

const cache = require( './cache' );

exports.handler = vandium.api()
        .GET( (event) => {

                // handle get request
                return User.get( event.pathParameters.name );
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
                return User.update( event.pathParameters.name, event.body );
            })
        .DELETE( (event) => {

                // handle DELETE request
                return User.delete( event.pathParameters.name );
            })
        .finally( () => {

            // close the cache if open - gets executed on every call
            return cache.close();
        });
```

The individual HTTP methods have their own independent paths inside the proxied handler, each with their own ability to validate specific
event parameters as required.

## HTTP Methods

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

## Validation of Event Elements

Vandium uses [Joi](https://github.com/hapijs/joi) as the engine for validation on specific elements inside the event. Validation schemas are
applied to one or more sections of the `event` object and can be targeted to the `headers`, `queryStringParameters`, `body` and
`pathParameters` elements. Each item inside the element can be validated using one of the build-in types inside Vandium.

The following types are supported for validation.

Type		   | Description
------------|------------
string      | String value. Automatically trimmed
number      | Number value (integer or floating point)
boolean     | Boolean value (`true` or `false`)
date        | Date value
email       | Email address
uuid        | [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUID)
binary	    | Binary value uncoded using `base64`
any		    | Any type of value
object      | Object
array       | Arrays of values
alternatives| Alternative selection of values

See the [validation](validation.md) section for more information on how to apply validation rules.

## headers

HTTP response headers can be set using the `headers()` method on the handler. The following example demonstrates the setting of custom
headers:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .headers( {

            'x-custom-header': 'header-value-here'
        })
        .GET( (event) => {

                // handle get request
        });
```

## CORS

CORS can be set by using the `cors()` method on the handler. The CORS implementation in Vandium can accept all request values, including
pre-flight ones, as documented by [W3C](https://www.w3.org/TR/cors/). The following example sets the `Access-Control-Allow-Origin` and
`Access-Control-Allow-Credentials` CORS values in the response headers:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .cors( {

            allowOrigin: 'https://app.vandium.io',
            allowCredentials: true
        })
        .GET( (event) => {

                // handle get request
        });
```

The following CORS options are available

Property         | CORS Header Name
-----------------|--------------------------------------
allowOrigin      | `Access-Control-Allow-Origin`
allowCredentials | `Access-Control-Allow-Credentials`
exposeHeaders    | `Access-Control-Expose-Headers`
maxAge           | `Access-Control-Max-Age`
allowHeaders     | `Access-Control-Allow-Headers`


## JSON Web Tokens (JWT)

Vandium can handle validation, enforcement and processing of JSON Web Token (JWT) values. Configuration can be provided either via code or
through environment variables.

The following JWT signature algorithms are supported:

Algorithm | Type
----------|-----------------------------------
HS256     | HMAC SHA256 (shared secret)
HS384     | HMAC SHA384 (shared secret)
HS512     | HMAC SHA512 (shared secret)
RS256     | RSA SHA256 (public-private key)

To enable JWT using code, use the `jwt()` function on the `api` handler. By specifying an algorithm, JWT processing is automatically enabled

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .jwt( {

            algorithm: 'RS256'
            key: '<public key goes here>'
        })
        .GET( (event) => {

                // handle get request
            });
```

See the [JWT](jwt.md) section for for information about how to configure JSON Web Token support.

## Response and error handling

API Gateway expects all Lambda proxy handlers to return a defined object indicating success or failure, typically via the `callback()` function. The
response format is as follows:

```js
{
    // numeric static code
    "statusCode": status_code,

    // object containing header values
    "headers": {

        "header1": "header 1 value",
        "header2": "header 2 value",

        // etc.
    },

    // body encoded as a string
    "body": "{\"result\":\"json_string_encoded\"}"
}
```

Vandium will automatically try to determine the correct status code (successful or error condition) and process the body section accordingly.

If the following code was executed for a `GET` request;

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

            // handle get request
            return {

                id: "12345",
                name: "john.doe"
            };
        });
```

The response object would be:

```js
{
    // Vandium determined that a successful GET request should return status code of 200
    "statusCode": 200,

    // no headers were set
    "headers": {},

    // Vandium encoded the response object and stored as the body
    "body": "{\"id\":\"12345\",\"name\":\"john.doe\"}"
}
```

See the [Response and error handling](responses.md) section for for information about how to configure responses, headers and errors.


## Injection protection

Vandium will analyze the `queryStringParameters`, `body` and `pathParameters` sections in the event object to determine if potential attacks
are present. If attacks are detected, the default mode will be to log the attack. Injection protection can be configured using the
`protection()` method on the `api` handler. Currently only SQL Injection (SQLi) attacks are detected but future versions will detect other
types.

To prevent execution when potential attacks are detected:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .protection( {

            // "fail" mode will prevent execution of the method handler
            mode: 'fail'
        })
        .GET( (event) => {

            // handle get request
            return {

                id: "12345",
                name: "john.doe"
            };
        });
```

To disable protection:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .protection( {

            // "fail" mode will prevent execution of the method handler
            mode: 'off'
        })
        .GET( (event) => {

            // handle get request
            return {

                id: "12345",
                name: "john.doe"
            };
        });
```
