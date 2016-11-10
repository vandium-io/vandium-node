# Configuration

Proxy resource support can be configured several different ways depending on the level of customization that is required.

### Basic Configuration

The `lambdaProxy: true` configuration option will enable the proxy resource feature and Vandium will intercept and format the errors or results into the proxy object format.

```js
'use strict';

const vandium = require( 'vandium' );

vandium.validation.configure( {

    lambdaProxy: true
});

exports.handler = vandium( function( event, context, callback ) {

    // event: {
    //
    // {
    //   "resource": "/path/to/{resource+}",
    //   "path": "/path/to/resource",
    //   "httpMethod": "GET",
    //   "headers": null,
    //   "queryStringParameters": null,
    //   "pathParameters": {
    //     "resource": "whatever"
    //   },
    //   "stageVariables": null,
    //   "requestContext": {
    //     "accountId": "account_id",
    //     "resourceId": "resource_id",
    //     "stage": "dev",
    //     "requestId": "request id",
    //     "identity": {
    //       ...
    //     },
    //     "resourcePath": "/path/to/{resource+}",
    //     "httpMethod": "GET, POST. etc",
    //     "apiId": "api_id"
    //   },
    //   "body": null (set on POST, etc)
    // }

    // handler code here
    //
    callback( null, { whatever: 'results?' } );
});
```

The result from the above code will return:

```js
{
    "statusCode": 200,
    "headers": {},
    "body": "{\"whatever\":\"results?\"}"
}
```

To the API gateway.

### Header Configuration

By default, the API Gateway will return the standard headers including `Content-Type` and `x-amzn-RequestId`. If you would like to specify additional headers, then you may specify them using the `lambdaProxy` configuration option.

```js
'use strict';

const vandium = require( 'vandium' );

vandium.validation.configure( {

    lambdaProxy: {

        headers: {

            'x-custom-header': 'custom-value'
        }
    }
});

exports.handler = vandium( function( event, context, callback ) {

    callback( null, { whatever: 'results?' } );
});
```

The result from the above code will return:

```js
{
    "statusCode": 200,
    "headers": {
        "x-custom-header": "custom-value"
    },
    "body": "{\"whatever\":\"results?\"}"
}
```

### Custom Lambda Proxy

If you require further customization then you can provide an implementation that will perform the proxy operation.

```js
'use strict';

const vandium = require( 'vandium' );

class MyLambdaProxy extends vandium.lambdaProxy {

    constructor() {

        super();

        this.header( 'my-custom-header', 'custom-value' );
    }

    onResult( event, context, result ) {

        let proxyResult = super.onResult( event, context, result );

        // always set to 201
        proxyResult.statusCode = 201;

        return proxyResult;
    }

    onError( event, context, error ) {

        let proxyResult = super.onError( event, context, error );

        // all errors are bad!
        proxyResult.statusCode = 500;

        return proxyResult;
    }
}

vandium.validation.configure( {

    lambdaProxy: new MyLambdaProxy()
});

exports.handler = vandium( function( event, context, callback ) {

    callback( null, { whatever: 'results?' } );
});
```

The result from the above code will return:

```js
{
    "statusCode": 201,
    "headers": {
        "x-custom-header": "custom-value"
    },
    "body": "{\"whatever\":\"results?\"}"
}
```
