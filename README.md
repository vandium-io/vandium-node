![Vanidum](docs/vandium.png)

[![Build Status](https://travis-ci.org/vandium-io/vandium-node.svg?branch=master)](https://travis-ci.org/vandium-io/vandium-node)
[![npm version](https://badge.fury.io/js/vandium.svg)](https://badge.fury.io/js/vandium)

[AWS Lambda](https://aws.amazon.com/lambda/details) framework for building functions using [Node.js](https://nodejs.org) for
[API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other AWS events.


## Features
* Simplifies writing lambda handlers
* Automatically verifies event types
* Powerful input validation
* Works with [Serverless](https://serverless.com/)
* JSON Web Token (JWT) verification and validation
* JWK support for retrieving keys at startup
* Automatic loading of environment variables from SSM Parameter Store
* Cross Site Request Forgery (XSRF) detection when using JWT
* SQL Injection (SQLi) detection and protection
* Lambda Proxy Resource support for AWS API Gateway
* Handler initialization for allocating resources
* Post handler execution to allow deallocation of resources
* Forces values into correct types
* Handles uncaught exceptions
* Promise support
* Automatically trimmed strings for input event data
* Low startup overhead
* AWS Lambda Node.js 12.x


## Installation
Install via npm.

	npm install vandium --save

## Getting Started

Vandium creates event specific handlers to reduce the amount of code than one
needs to maintain. The following handler code will respond with a message when
executed using the AWS API Gateway with a `GET` request:

```js
const vandium = require( 'vandium' );

// handler for an api gateway event
exports.handler = vandium.api()
		.GET( (event) => {

			// return greeting
			return 'Hello ' + event.pathParmeters.name + '!';
		});
```

The framework can process asynchronous responses using promises. The following
code returns a User object from a datastore asynchronously:

```js
const vandium = require( 'vandium' );

// our datastore access object
const Users = require( './users' );

// handler for an api gateway event
exports.handler = vandium.api()
		.GET()
		 	.validation({

				pathParmeters: {

					name: 'string:min=1,max=100,required'
				}
			})
			.handler( async (event) => {

				// returns a promise that resolves the User by name
				return await Users.getUser( event.pathParmeters.name );
			});
```

Additionally, resources can be closed at the end, success or failure, of the
handler. Failure to close resources might cause the lambda function to timeout
or run for longer than is required. The following code demonstrates closing a
cache after the handler has been called:

```js
const vandium = require( 'vandium' );

// our datastore access object
const Users = require( './users' );

// object caching - automatically connects on first access
const cache = require( './cache' );

// handler for an api gateway event
exports.handler = vandium.api()
		.GET((event) => {

			// returns a promise that resolves the User by name
			return Users.getUser( event.pathParmeters.name );
		})
		.finally( () => {

			// returns a promise that closes the cache connection
			return cache.close();
		});
```

Vandium supports the following types of AWS Lambda events:

- API Gateway
- Cloudformation
- Cloudwatch
- Cognito
- Dynamodb
- Kinesis
- Alexa
- S3
- Scheduled
- SES
- SNS

## Documentation

For documentation on how to use vandium in your project, please see our [documentation](docs) page.

## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`

## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
