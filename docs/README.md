# Vandium

[AWS Lambda](https://aws.amazon.com/lambda/details) framework for building functions using [Node.js](https://nodejs.org) for [API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other AWS events.

## Features
* Simplifies writing lambda handlers
* Automatically verifies event types
* Powerful input validation
* Works with [Serverless](https://serverless.com/)
* JSON Web Token (JWT) verification and validation
* Cross Site Request Forgery (XSRF) detection when using JWT
* SQL Injection (SQLi) detection and protection
* Lambda Proxy Resource support for AWS API Gateway
* Post handler execution to allow deallocation of resources
* Forces values into correct types
* Handles uncaught exceptions
* Promise support
* Automatically trimmed strings for input event data
* Low startup overhead
* AWS Lambda Node.js 6.10.x compatible

## Installation

Install via npm

	npm install vandium --save

## Getting Started

Vandium creates event specific handlers to reduce the amount of code than one needs to maintain.

```js
const vandium = require( 'vandium' );

// handler for an s3 event
exports.handler = vandium.s3( (records) => {

        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );
    });
```

Since this is an `s3` type handler, Vandium isolates the records from the lambda event. If we wanted to access the lambda context, we would
modify the code as follows:

```js
const vandium = require( 'vandium' );

// handler for an s3 event
exports.handler = vandium.s3( ( records, context ) => {

        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );

        console.log( 'time remaining: ', context.getRemainingTimeInMillis() );
    });
```

Also note that Vandium is handling the `callback` for us. If we wanted to do something asynchronous, we could add the `callback` parameter
and then return the appropriate response.

```js
const vandium = require( 'vandium' );

const scanFile = require( './async-file-scanner' );

const processFile = require( './async-file-processor' );

// handler for an s3 event
exports.handler = vandium.s3( ( records, context, callback ) => {


        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );

        scanFile( bucket, key, (err1,result1) => {

            if( err1 ) {

                return callback( err1 );
            }

            processFile( result1.id, bucket, key, (err2,result2) => {

                console.log( 'time remaining: ', context.getRemainingTimeInMillis() );

                callback( err2, result2 );
            });
        })
    });
```

Promises can be used to make writing asynchronous code a little easier to understand and maintain. Vandium supports the `Promise`
implementation without any special configuration.

```js
const vandium = require( 'vandium' );

const scanFile = require( './promise-file-scanner' );

const processFile = require( './promise-file-processor' );

// handler for an s3 event
exports.handler = vandium.s3( ( records, context ) => {


        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );

        // Note: make sure you call return on your Promise!
        return scanFile( bucket, key )
            .then( (result) => {

                return processFile( result.id, bucket, key );
            })
            .then( (result) => {

                console.log( 'time remaining: ', context.getRemainingTimeInMillis() );

                return result;
            });
    });
```

Please note that you must call `return` on your Promise and do not specify the `callback` parameter if you intend to use Promises.

## Events

Vandium targets [specific event types](events) to allow validation and targeting of specific event specific data. You can use the
[`generic`](events/generic.md) handler for custom or generic handling of supported or user defined event types.

### `api` Event Type

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

See the [api](events/api) documentation for additional information on how to create API event handlers.

### `cloudformation` Event Type

The `cloudformation` event type allows you to handle events generated from AWS Cloud Formation operations. To map the event using Vandium,
use the `cloudformation()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cloudformation( (event, context) => {

		// handle event here
    });
```

See the [cloudformation](events/cloudformation.md) documentation for additional information on how to create cloudformation event handlers.

### `cloudwatch` Event Type

The `cloudwatch` event type allows you to handle events generated from AWS Cloud Watch operations. To map the event using Vandium, use the
`cloudwatch()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cloudwatch( (event, context) => {

        // do something with the data
    });
```

See the [cloudwatch](events/cloudwatch.md) documentation for additional information on how to create cloudwatch event handlers.

### `cognito` Event Type

The `cognito` event type allows you to handle events generated from AWS Cognito service. To map the event using Vandium, use the `cognito()`
handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cognito( (event, context) => {

        // do something with the event
    });
```

See the [cognito](events/cognito.md) documentation for additional information on how to create cognito event handlers.

### `dynamodb` Event Type

The `dynamodb` event type allows you to handle events generated from the AWS DynamoDB service. The event type is a record-based event type
and can contain one or more records. To map the event using Vandium, use the `dynamodb()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.dynamodb( (records, context) => {

        // handle the event
    });
```

See the [dynamodb](events/dynamodb.md) documentation for additional information on how to create dynamodb event handlers.

### `kinesis` Event Type

The `kinesis` event type allows you to handle events generated from the AWS Kinesis service. The event type is a record-based event type
and can contain one or more records. To map the event using Vandium, use the `kinesis()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.kinesis( (records, context) => {

        // handle the event
    });
```

See the [kinesis](events/kinesis.md) documentation for additional information on how to create kinesis event handlers.

### `lex` Event Type

The `lex` event type allows you to handle events generated from AWS Alexa service. To map the event using Vandium, use the `lex()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.lex( (event, context) => {

        // do something with the event
    });
```

See the [lex](events/lex.md) documentation for additional information on how to create lex event handlers.

### `s3` Event Type

The `s3` event type allows you to handle events generated from the AWS S3 service. The event type is a record-based event type and can
contain one or more records. To map the event using Vandium, use the `s3()` handler:

```js
const vandium = require( 'vandium' );

// handler for an s3 event
exports.handler = vandium.s3( (records, context) => {

        // handle the event
    });
```

See the [s3](events/s3.md) documentation for additional information on how to create s3 event handlers.

### `scheduled` Event Type

The `scheduled` event type allows you to handle events generated from AWS Cloud Watch scheduler service. To map the event using Vandium,
use the `scheduled()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.scheduled( (event, context) => {

        // do something with the event
    });
```

See the [scheduled](events/scheduled.md) documentation for additional information on how to create scheduled event handlers.

### `ses` Event Type

The `ses` event type allows you to handle events generated from the AWS Simple Email service (SES). The event type is a record-based event type
and can contain one or more records. To map the event using Vandium, use the `ses()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.ses( (records, context) => {

        // handle the event
    });
```

See the [ses](events/ses.md) documentation for additional information on how to create ses event handlers.

### `sns` Event Type

The `sns` event type allows you to handle events generated from the AWS Simple Notification service (SNS). The event type is a record-based
event type and can contain one or more records. To map the event using Vandium, use the `sns()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.sns( (records, context) => {

        // handle the event
    });
```

See the [sns](events/sns.md) documentation for additional information on how to create sns event handlers.

### `generic` Event Type

The `generic` event type allows you to handle any type of Lambda event from any source. To map the event using Vandium, use the `generic()`
handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.generic()
    .handler( (event, context) => {

        // handle the event
    });
```

## Cleaning up after event handlers

You can clean up and free resources using the `finally()` method on all event handlers. The `finally()` method is executed after each
execution of the handler if your code has been executed. If an exception is raised within the `finally()` function, it will get logged and
execution will continue.

The following example shows how you can use the `finally()` method to free a cache connection after each execution using the `api` event type:

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

## Configuration via `vandium.json`

If you would like to specify configuration using a configuration file, you can place a `vandium.json` file at the root of your project. The
file is a standard JSON file with the following structure:

```js
{
    "jwt": {

        "algorithm": "<algorithm-type>",
        "publicKey": "<public key",         // if using RS256
        "secret": "<secret value>",         // if using HS256, HS384 or HS512
        "token": "<token path inside event",
        "xsrf": "true | false",
        "xsrfToken": "<xsrf token path inside element>",
        "xsrfClaim": "<xsrf claim path inside jwt element>"
    },
    "prevent": {

        "eval": "true | false"              // prevents the use of eval()
    }
}
```

## Backwards Compatibility

#### Vanidum 3

Vandium 4 is compatible with AWS Lambda environments that support Node.js 6.10.x or higher. Vandium 4's event handler mechanism allows
targeted handling of event specific scenarios and thus code written using Vandium 3.x will **not** be compatible with this version. To
migrate your Vandium 3 code, use a targeted event handler or the [`generic`](events/generic.md) event.

#### Support for Node 4.3.2
If you require support for the previous version of Node.js (4.x) then use Vandium 3.x


## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`


## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
