[![Build Status](https://travis-ci.org/vandium-io/vandium-node.svg?branch=master)](https://travis-ci.org/vandium-io/vandium-node)
[![npm version](https://badge.fury.io/js/vandium.svg)](https://badge.fury.io/js/vandium)

# Vandium

Simplifies writing [AWS Lambda](https://aws.amazon.com/lambda/details) functions using [Node.js](https://nodejs.org) for [API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other Lambda-based cases.

## Features
* Powerful input validation
* JSON Web Token (JWT) verification and validation
* Cross Site Request Forgery (XSRF) detection when using JWT
* SQL Injection (SQLi) detection and protection
* Environment variable mapping
* Free resources post handler execution
* Forces values into correct types
* Handles uncaught exceptions
* Promise support
* Automatically trimmed strings for input event data
* Low startup overhead
* AWS Lambda Node.js 4.3.2 compatible

## How it works

Vandium wraps your Node.js handler and takes responsibility for validating JWT tokens, detecting SQL Injection attacks, validating input values from the incoming event and assisting your code in cleaning up any open resources. This allows you to focus on the core functionality of your code while reducing the overall amount of code that needs to be written. In addition to reduction the code you need to write, Vandium will add increased robustness, greater level of security and reduction in technical debt.

![Lambda Execution Handler Flow](docs/flow.png?raw=true "")


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

For documentation on how to use vandium in your project, please see our [documentation](docs) page.

## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`


## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
