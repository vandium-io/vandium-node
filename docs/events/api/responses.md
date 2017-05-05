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
