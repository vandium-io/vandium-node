# vandium-node

Simplifies writing [AWS Lambda](https://aws.amazon.com/lambda/details) functions using [Node.js](https://nodejs.org) for [API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other serverless event cases.

## Features
* Powerful input validation
* JWT verification and validation
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


## Contents

* [Getting Started](getting_started.md)

* [Configuration](configuration.md)

* [Event Validation](validation.md)

* [Using Promises with Lambda](promises.md)

* [JSON Web Token (JWT) Support](jwt.md)

* [Attack Detection and Protection](protection.md)

* [Cleaning Up after Handler Execution](cleanup.md)

* [Load Times and Execution Times](performance.md)

* [AWS Lambda Compatibility](compatability.md)


## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`


## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
