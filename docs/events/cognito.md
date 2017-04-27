# `cognito` Event type

The `cognito` event type allows you to handle events generated from AWS Cognito service. The following is a sample event from the AWS Lambda
documentation:

```JSON
{
    "datasetName": "datasetName",
    "eventType": "SyncTrigger",
    "region": "us-east-1",
    "identityId": "identityId",
    "datasetRecords": {
        "SampleKey2": {
            "newValue": "newValue2",
            "oldValue": "oldValue2",
            "op": "replace"
        },
        "SampleKey1": {
            "newValue": "newValue1",
            "oldValue": "oldValue1",
            "op": "replace"
        }
    },
    "identityPoolId": "identityPoolId",
    "version": 2
}
```

To map the event using Vandium, we would use the `cognito()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cognito( (event, context) => {

        // do something with the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.cognito( (event, context, callback) => {

        // do something with the data

        // Must invoke callback() since Vandium thinks you would like to control asynchronous operations yourself
        callback( null, 'ok' );
    });
```
