# `kinesis` Event type

The `kinesis` event type allows you to handle events generated from the AWS Kinesis service. The event type is a record-based event type
and can contain one or more records. The following is a sample event from the AWS Lambda documentation:


```JSON
{
    "Records": [
        {
            "eventID": "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
            "eventVersion": "1.0",
            "kinesis": {
                "partitionKey": "partitionKey-3",
                "data": "SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IDEyMy4=",
                "kinesisSchemaVersion": "1.0",
                "sequenceNumber": "49545115243490985018280067714973144582180062593244200961"
            },
            "invokeIdentityArn": "identityarn",
            "eventName": "aws:kinesis:record",
            "eventSourceARN": "eventsourcearn",
            "eventSource": "aws:kinesis",
            "awsRegion": "us-east-1"
        }
    ]
}
```

To map the event using Vandium, we would use the `kinesis()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.kinesis( (records, context) => {

        // handle the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.kinesis( (records, context, callback) => {

        // handle the event

        callback( null, { /* response here */ } );
    });
```
