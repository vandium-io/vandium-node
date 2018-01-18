# `api` Event Type:

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

The individual HTTP methods have their own independent paths inside the proxied handler, each with their own ability to validate
specific event parameters as required. If the value of `event.body` contains an encoded JSON object, it will be parsed and validated.

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

# Validation of Event Elements

Vandium uses [Joi](https://github.com/hapijs/joi) as the engine for validation on specific elements inside the event. Validation schemas are
applied to one or more sections of the `event` object and can be targeted to the `headers`, `queryStringParameters`, `body` and
`pathParameters` elements. Each item inside the element can be validated using one of the build-in types inside Vandium.

## Types

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

## Value Conversion

Values will be converted, if needed, and will reduce the amount of code you need to write in your handler. For example, the
validation configuration of:

```js
{
    body: {

        age: vandium.types.number().required()
    }
}
```

with an event of:

```js
{
    // other event elements

    body: {

        age: '42'
    }
}
```

would be converted to:

```js
{
    // other event elements

    body: {

        age: 42
    }
}
```

Additionally, `binary` data with a schema of:

```js
{
    body: {

        data: vandium.types.binary()
    }
}
```

with an event containing:

```js
{
    // other event elements

    body: {

        data: 'dmFuZGl1bSBsYW1iZGEgd3JhcHBlcg=='
    }
}
```

would be get converted to a `Buffer` instance with the data parsed and loaded:

```js
{
    // other event elements

    body: {

        data: Buffer( ... )
    }
}
```

## Type: `string`

String validators can be created by calling `vandium.types.string()`, using "string" or "object" notation. The implementation of the
`string` validator is based on `Joi`, and thus can use most of the functionality available in the `Joi` library for the `string` type. All
`string` validators in Vandium will automatically trim leading and trailing whitespace.

Simple validation:

```js
{
    body: {

        name: vandium.types.string().min( 1 ).max( 250 ).required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        name: 'string:min=1,max=250,required'
    }
}
```


Regex expressions can be used:

```js
{
    requestParameters: {

        id: vandium.types.string().regex( /^[abcdef]+$/ )
    }
}
```

Strings are automatically trimmed. To disable this functionality, add an option when creating the type:

```js
{
    string_not_trimmed: vandium.types.string( { trim: false } )
}
```

## Type: `number`

Number validators can be created by calling `vandium.types.number()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `number` type.

```js
{
    body: {

        // age must be a number, between 0 and 130 and is required
    	age: vandium.types.number().integer().min( 0 ).max( 130 ).required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        age: 'number:integer,min=0,max=130,required'
    }
}
```


## Type: `boolean`

Boolean validators can be created by calling `vandium.types.boolean()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `boolean` type.

The `boolean` validator can accept the following values: `true`, `false`, `"true"`, `"false"`, `"yes"` and `"no"`.


```js
{
    body: {

        allow: vandium.types.boolean().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        allow: 'boolean:required'
    }
}
```

## Type: `date`

Date validators can be created by calling `vandium.types.date()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `date` type.

The `date` validator can match values against standard Javascript date format as well as the number of milliseconds since the epoch.

```js
{
    queryStringParameters: {

        start: vandium.types.date().min( '1-1-1970' ).required(),
    	end: vandium.types.date().max( 'now' ).required()
    }
}
```

This could also be writing using a string notation:

```js
{
    queryStringParameters: {

        start: 'date:min=1-1-1970,required',
        end: 'date:max=now,required'
    }
}
```

## Type: `email`

The `email` validator matches values that conform to valid email address format. Email validators can be created by calling `vandium.types.email()`,
using "string" or "object" notation. The implementation is based on `string` type found in `Joi`.


```js
{
    body: {

        address: vandium.types.email().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        address: 'email:required'
    }
}
```

## Type: `uuid`

The `uuid` validator matches values that conform to the [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)
(UUID) specification. UUID validators can be created by calling `vandium.types.uuid()`, using "string" or "object" notation. The
implementation is based on `string` type found in `Joi`.

```js
{
    requestParameters: {

        id: vandium.types.uuid().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    requestParameters: {

        id: 'uuid:required'
    }
}
```

## Type: `binary`

Binary validators can be created by calling `vandium.types.binary()`, using "string" or "object" notation. The implementation is based on
`Joi` and thus can use functionality available in the `Joi` library for the `binary` type.


```js
{
    body: {

        data: vandium.types.binary().encoding( 'base64' ).min( 10 ).max( 1000 )
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        data: 'binary:encoding=base64,min=10,max=100'
    }
}
```

## Type: `any`

the `any` type can represent any type of value and the validator performs minimal validation. "Any" validators can be created by calling
`vandium.types.any()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `any` type.

```js
{
    body: {

        name: vandium.types.any().required()
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        name: 'any:required'
    }
}
```

## Type: `object`

The `object` validator allows validation of an object and potentially the values within it. Object validators can be created by calling
`vandium.types.object()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `object` type.

```js
{
    body: {

        job: vandium.types.object().keys({

    			name: vandium.types.string().required(),
    			dept: vandium.types.string().required()
         	}).required();
    }
}
```

This could also be writing using a string notation:

```js
{

    body: {

        job: {

            name: 'string:required',
            dept: 'string:required',

            '@required': true
        }
    }
}
```

## Type: `array`

The `array` can match values the are part of a selection, specific types and/or pattern. Array validators can be created by calling
`vandium.types.array()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality available
in the `Joi` library for the `array` type.

```js
{
    body: {

        // matching seven numbers between 1 and 49:
    	lucky_numbers: vandium.types.array().items( vandium.types.number().min( 1 ).max( 49 ) ).length( 7 )
    }
}
```

This could also be writing using a string notation:

```js
{
    body: {

        lucky_numbers: {

            '@items': [ 'number:min=1,max=49' ],
            length: 7
        }
    }
}
```

## Type: `alternatives`

The `alternatives` validator is used to choose between two types of values. "Alternatives" validators can be created by calling
`vandium.types.alternatives()`, using "string" or "object" notation. The implementation is based on `Joi` and thus can use functionality
available in the `Joi` library for the `alternatives` type.

```js
{
    requestParameters: {

        // key can be uuid or name
    	key: vandium.types.alternatives().try( vandium.types.uuid(), vandium.types.string() )
    }
}
```

This could also be writing using a string notation:

```js
{
    requestParameters: {

        key: [ 'uuid', 'string' ]
    }
}
```


For more information on how to configure validators, see the [joi reference](https://github.com/hapijs/joi/blob/master/API.md)

# headers

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

# CORS

CORS can be set by using the `cors()` method on the handler. The CORS implementation in Vandium can accept all request values, including
pre-flight ones, as documented by [W3C](https://www.w3.org/TR/cors/). The following example sets the `Access-Control-Allow-Origin` and
`Access-Control-Allow-Credentials` CORS values in the response headers:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .cors( {

            allowOrigin: 'https://app.example.com',
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


# JSON Web Tokens (JWT)

Vandium can handle validation, enforcement and processing of JSON Web Token (JWT) values. Configuration can be provided either via code or
through environment variables.

## Supported algorithms

The following JWT signature algorithms are supported:

Algorithm | Type
----------|------------
HS256     | HMAC SHA256 (shared secret)
HS384     | HMAC SHA384 (shared secret)
HS512     | HMAC SHA512 (shared secret)
RS256     | RSA SHA256 (public-private key)

## Enabling JWT Programatically

To enable JWT using code, use the `jwt()` function on the `api` handler. By specifying an algorithm, JWT processing is automatically enabled.
The `jwt` configuration format is:

```js
{
    algorithm: 'RS256' | 'HS256' | 'HS384' | 'HS512',
    publicKey: '<public key>',          // if algorithm is 'RS256'
    secret: '<shared secret',           // if algorithm is 'HS256', 'HS384' or 'HS512'
    token: '<token path>',              // path to jwt token. Defaults to 'headers.jwt'
    xsrf: true | false,                 // enables xsrf verification. Defaults to false unless other xsrf* options are enabled
    xsrfToken: '<xsrf token path>',     // path to xsrf token. Defaults to 'headers.xsrf'
    xsrfClaim: '<xsrf claim path>'      // path to xsrf claim inside jwt. Defaults to 'nonce'
}
```

The following example enables JWT processing programmatically:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .jwt( {

            algorithm: 'RS256'
            key: '<public key goes here>'
        })
        .GET( (event) => {

                // handle get request
            })
        // other method handlers...
```



## Configuration via Environment Variables

Environment variables can be used to configure support for JWT processing. The following environment variables can be used:

Name                    | Description
------------------------|-------------------------------------------------------
VANDIUM_JWT_ALGORITHM   | Specifies the algorithm for JWT verification. Can be `HS256`, `HS384`, `HS512` or `RS256`
VANDIUM_JWT_SECRET      | Secret key value for use with HMAC SHA algorithms: `HS256`, `HS384` and `HS512`
VANDIUM_JWT_PUBKEY      | Public key used used with `RS256` algorithm
VANDIUM_JWT_KEY         | Alias for either VANDIUM_JWT_SECRET or VANDIUM_JWT_PUBKEY
VANDIUM_JWT_TOKEN_PATH  | Name of the token variable in the `event` object. Defaults to `headers.jwt`
VANDIUM_JWT_USE_XSRF    | Enable or disable Cross Site Request Forgery (XSRF) token. Defaults to `false`
VANDIUM_JWT_XSRF_TOKEN_PATH | Name of the XSRF token in the `event`. Defaults to `headers.xsrf`
VANDIUM_JWT_XSRF_CLAIM_PATH | XSRF claim path inside JWT. Defaults to `nonce`

When the `VANDIUM_JWT_ALGORITHM` value is present, JWT processing is automatically enabled within Vandium.


## Claim enforcement

Tokens will be validated and must conform to the specification, and the following token claims (not required) will be enforced:

Claim      | Description
-----------|----------------
`iat`      | Issued At (iat) time, in seconds, that the token was created and should only be used **after** this time.
`nbf`      | Not Before (nbf) time, in seconds, that prevents the token from being used **before** the indicated time.
`exp`      | Expiry (exp) time, in seconds, the prevents the token from being used **after** the indicated time.

Any validation or enforcement issues, including poorly formed or missing tokens, will cause the handler to terminate and return an error
message using the proxy message format.

## Accessing the Decoded Token

One the JWT has been validated and verified, the decoded contents will be added to the `event` object under the `jwt` element. The following
code segment shows how to access the token:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .jwt( {

            algorithm: 'RS256'      // public key specified using env variable
        })
        .GET( (event) => {

                // user id is stored inside the token
                let userId = event.jwt.id;

                // handle get request
            });
```

## Additional Reading

For more information about JWT, see [RFC 7519](https://tools.ietf.org/html/rfc7519) and [RFC 7797](https://tools.ietf.org/html/rfc7797).

# Response and error handling

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

Since Vandium isolates your code from the Lambda handler, it will ensure that all responses and errors are put into the correct format.

## Simple responses

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

## Code specified response object

If the following code was executed for a `GET` request;

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

            // handle get request
            return {

                headers: {

                    header1: 'HEADER_1_VALUE',
                    header2: 'HEADER_2_VALUE'
                },

                body: {

                    id: "12345",
                    name: "john.doe"    
                }
            };
        });
```

The response object would be:

```js
{
    "statusCode": 200,
    "headers": {

        "header1": "HEADER_1_VALUE",
        "header2": "HEADER_2_VALUE"
    },
    "body": "{\"id\":\"12345\",\"name\":\"john.doe\"}"
}
```

Additionally if the `GET` method handler returned a `statusCode` value, it would override the automatic settings:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

            // handle get request
            return {

                statusCode: 202,

                headers: {

                    header1: 'HEADER_1_VALUE',
                    header1: 'HEADER_2_VALUE'
                },

                body: {

                    id: "12345",
                    name: "john.doe"    
                }
            };
        });
```

The response object would be:

```js
{
    "statusCode": 202,
    "headers": {

        "header1": "HEADER_1_VALUE",
        "header2": "HEADER_2_VALUE"
    },
    "body": "{\"id\":\"12345\",\"name\":\"john.doe\"}"
}
```

## Error Responses

Vandium ensures that if an error gets thrown, it will get caught, processed and formatted into the API Gateway's Lambda proxy response object
format.

If the following code was executed for a `GET` request;

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

            throw new Error( 'something bad happened' );
        });
```

The response object would be:

```js
{
    "statusCode": 500,
    "headers": {},
    "body": "{\"message\":\"something bad happened\"}"
}
```

The `statusCode` was set to 500 because Vandium examined the exception and did not find a `status` or `statusCode` value and used it's
default of 500. If we wanted to set the status code properly, we would need to add the status to the exception as in the following example:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

            let error = new Error( 'Not Found' );
            error.statusCode = 404;

            throw error;
        });
```

The response object would be:

```js
{
    "statusCode": 404,
    "headers": {},
    "body": "{\"message\":\"Not Found\"}"
}
```

## Setting the `statusCode` for errors for all HTTP methods

Vandium provides an `onError()` function to intercept all errors before they get processed as responses. Using this method, you can examine each
exception and set the appropriate status code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .GET( (event) => {

                throw new Error( 'User Not Found' );
            })
        .PUT( (event) => {

                throw new Error( 'Not Found' );
            })
        .onError( (err) => {

            if( err.message.indexOf( 'Not Found' ) > -1 ) {

                err.statusCode = 404;
            }

            return err;
        });
```

The response object for a `GET` request would be:

```js
{
    "statusCode": 404,
    "headers": {},
    "body": "{\"message\":\"User Not Found\"}"
}
```

and the response object for a `PUT` request would be:

```js
{
    "statusCode": 404,
    "headers": {},
    "body": "{\"message\":\"Not Found\"}"
}
```

## Setting headers for all HTTP methods

Use the `headers()` method on the `api` handler if you would like to set the headers for all responses and errors.

If the following code was executed for a `GET` request;

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .headers( {

            header1: 'HEADER_1_VALUE',
            header2: 'HEADER_2_VALUE'
        })
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
    "statusCode": 200,
    "headers": {

        "header1": "HEADER_1_VALUE",
        "header2": "HEADER_2_VALUE"
    },
    "body": "{\"id\":\"12345\",\"name\":\"john.doe\"}"
}
```

**Note:** that returning a response object that contains a `headers` section will override the values set in the `headers()` function.


# Injection protection

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
