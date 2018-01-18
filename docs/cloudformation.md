# `cloudformation` Event type

The `cloudformation` event type allows you to handle events generated from AWS Cloud Formation operations. The following is a sample event
from the AWS Lambda documentation:

```JSON
{
  "StackId": "stackidarn",
  "ResponseURL": "http://pre-signed-S3-url-for-response",
  "ResourceProperties": {
    "StackName": "stack-name",
    "List": [
      "1",
      "2",
      "3"
    ]
  },
  "RequestType": "Create",
  "ResourceType": "Custom::TestResource",
  "RequestId": "unique id for this create request",
  "LogicalResourceId": "MyTestResource"
}
```

To map the event using Vandium, we would use the `cloudformation()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cloudformation( (event, context) => {

        console.log( `request type: ${event.RequestType}` );
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cloudformation( (event, context, callback) => {

        console.log( `request type: ${event.RequestType}` );

        // Must invoke callback() since Vandium thinks you would like to control asynchronous operations yourself
        callback( null, 'ok' );
    });
```
