# Using JSON Web Tokens (JWT)

Vandium can handle validation, enforcement and processing of JSON Web Token (JWT) values and can be easily performed using environment variables, configuration files, via code or using [AWS API Gateway](https://aws.amazon.com/api-gateway/) [Stage Variables](http://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html).


For more information about JWT, see [RFC 7519](https://tools.ietf.org/html/rfc7519) and [RFC 7797](https://tools.ietf.org/html/rfc7797).


## Table of Contents

- [Validation and enforcement](validation-and-enforcement.md)
- [Configuration](configuration)
    - [Inline configuration](configuration/inline.md)
    - [Configuration file](configuration/configuration-file.md)
    - [Using environment variables](configuration/using-env-vars.md)
    - [Using API Gateway stage variables](configuration/using-api-stage-vars.md)
- [Accessing token claims](accessing-token-claims.md)
