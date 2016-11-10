# Lambda Proxy Support

The AWS API Gateway allows resource paths to be proxied to a single lambda function using the standard methods or the `ANY` type. Unlike typical mapped resources,
proxy resources will encode results and error conditions using a specific object format:

```js
{
    // numeric static code
    "statusCode": 200,

    // object containing header values
    "headers": {

        "x-custom-header": "header_value"
    },

    // body encoded as a string
    "body": "{\"result\":true}"
}
```

The `body` property will contain the error or result encoded as a string. Vandium contains functionality to simplify handling API Gateway proxy usage.


## Table of Contents

- [Configuration](configuration.md)

- [Validation](validation.md)


## Further Information

For more information on AWS API Proxy Resources in Lambda, please see the [AWS API Gateway documentation](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html)
