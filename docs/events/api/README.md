# `api` event type

The `api` event type is used to handle [AWS API Gateway](https://aws.amazon.com/api-gateway) events using the Lambda Proxy based method for
handling resource events. The `api` handler can be used to create sub-handlers for each of the HTTP methods, handle results or errors and
ensure that the response is in the correct format for API Gateway.


## Table of Contents

- [Getting Started](getting-started.md)
- [HTTP Methods](methods.md)
- [Validation](validation.md)
- [JSON Web Token (JWT)](jwt.md)
- [Responses](responses.md)
- [Errors](errors.md)
- [Injection Protection](protection.md)
- [Cleaning up post execution](finally.md)
