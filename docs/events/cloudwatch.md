# `cloudwatch` Event type

The `cloudwatch` event type allows you to handle events generated from AWS Cloud Watch operations. The following is a sample event from the
AWS Lambda documentation:

```JSON
{
    "awslogs": {

        "data": "H4sIAAAAAAAAAHWPwQqCQBCGX0Xm7EFtK+smZBEUgXoLCdMhFtOEJ4M3/qOI49vMHj+zCKdlFqLaU2ZHV2a4Ct/an0/ivdX8oYc1UVX860fQDQiMdxRQEAAA=="
    }
}
```

To map the event using Vandium, we would use the `cloudwatch()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cloudwatch( (event, context) => {

        // do something with the data
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cloudwatch( (event, context, callback) => {

        // do something with the data

        // Must invoke callback() since Vandium thinks you would like to control asynchronous operations yourself
        callback( null, 'ok' );
    });
```
