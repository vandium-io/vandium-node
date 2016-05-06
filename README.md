[![Build Status](https://travis-ci.org/vandium-io/vandium-node.svg?branch=master)](https://travis-ci.org/vandium-io/vandium-node)
[![npm version](https://badge.fury.io/js/vandium.svg)](https://badge.fury.io/js/vandium)

# vandium-node

Simplifies writing [AWS Lambda](https://aws.amazon.com/lambda/details) functions using [Node.js](https://nodejs.org) for [API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other serverless event cases.

## Features
* Powerful input validation
* JWT verfication and validation
* SQL Injection (SQLi) detection and protection
* Environment variable mapping
* Free resources post handler execution
* Forces values into correct types
* Handles uncaught exceptions
* Promise support
* Automatically trimmed strings for input event data
* Low startup overhead
* AWS Lambda Node.js 4.3.2 compatible

## Installation
Install via npm.

	npm install vandium --save

## Getting Started

Vandium can be used with minimal change to your existing code.

```js
var vandium = require( 'vandium' );

exports.handler = vandium( function( event, context, callback ) {

	callback( null, 'ok' );
});
```

To enable validation on the values in the `event` object, configure it using a validation schema object.

```js
var vandium = require( 'vandium' );

vandium.validation( {

	name: vandium.types.string().required()
});

exports.handler = vandium( function( event, context, callback ) {

	console.log( 'hello: ' + event.name );

	callback( null, 'ok' );
});
```

When the lambda function is invoked, the event object will be checked for a presence of `event.name`. If the value does not exist, then the lambda will fail and an error message will be returned to the caller. Vandium will take care of calling `callback()` to route the error.


## Documentation

For documentation on how to use vandium in your project, please see our [documentation](docs/main.md) page.


## AWS Lambda Compatibility

Vandium is compatible with AWS Lambda environments that support Node.js 4.3.2. If you require support for the previous version of Node.js (0.10.x) then use version 1.x.


## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`


## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
