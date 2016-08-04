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


## Table of Contents
- [How it works](how-it-works.md)
- [Installation](installation.md)
- [Getting started](getting-started.md)
- [Configuration](configuration)
    - [Environment variables](configuration/env-vars.md)
    - [Configuration object](configuration/object.md)
    - [JSON configuration file](configuration/json-file.md)
    - [Configuration via S3](configuration/s3-configuration.md)
    - [Global options](configuration/global-options.md)
- [Validation](validation)
    - [Configuration](validation/configuration.md)
    - [Types](validation/types)
    - [Value conversion](validation/value-conversion.md)
- [Using JWT](using-jwt)
    - [Validation and enforcement](using-jwt/validation-and-enforcement.md)
    - [Configuration](using-jwt/configuration)
    - [Accessing token claims](using-jwt/accessing-token-claims.md)
- [Attack Protection](protection)
    - [SQL injection protection](protection/sql-injection-protection.md)
    - [Configuration](protection/configuration.md)
    - [Disabling attack protection](protection/disable-attack-protection.md)
    - [Preventing calls to `eval()`](protection/eval-prevention.md)
- [Using Promises with Lambda](promises.md)
- [Cleaning Up after Handler Execution](cleanup.md)
- [Performance](performance.md)
- [AWS Lambda Compatibility](compatability.md)


## Feedback

We'd love to get feedback on how to make this tool better. Feel free to contact us at `feedback@vandium.io`


## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)
