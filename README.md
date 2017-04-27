[![Build Status](https://travis-ci.org/vandium-io/vandium-node.svg?branch=master)](https://travis-ci.org/vandium-io/vandium-node)
[![npm version](https://badge.fury.io/js/vandium.svg)](https://badge.fury.io/js/vandium)

# Vandium

Simplifies writing [AWS Lambda](https://aws.amazon.com/lambda/details) functions using [Node.js](https://nodejs.org) for [API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other Lambda-based cases.

## Features
* Simplifies writing lambda handlers
* Automatically verifies event types
* Powerful input validation
* JSON Web Token (JWT) verification and validation
* Cross Site Request Forgery (XSRF) detection when using JWT
* SQL Injection (SQLi) detection and protection
* Lambda Proxy Resource support for AWS API Gateway
* Free resources post handler execution
* Forces values into correct types
* Handles uncaught exceptions
* Promise support
* Automatically trimmed strings for input event data
* Low startup overhead
* AWS Lambda Node.js 6.10.x compatible


## Installation
Install via npm.

	npm install vandium --save

## Getting Started

Vandium creates event specific handlers to reduce the amount of code than one needs to maintain. Vandium will automatically detect and
validate that the event is intended for the target service. For example, creating a handler for S3 events:

```js
const vandium = require( 'vandium' );

// handler for an s3 event
exports.handler = vandium.s3( (records) => {

        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );
    });
```

For handling API Gateway proxy events, Vandium simplifies JWT processing, input validation and method handling while reducing overall code
that you need to write, maintain and test. The following is an example of a resource event that handles GET, POST, PATCH and DELETE
operations:

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


## Documentation

For documentation on how to use vandium in your project, please see our [documentation](docs) page.

## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`


## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
