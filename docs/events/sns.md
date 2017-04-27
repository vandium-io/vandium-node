# `sns` Event type

The `sns` event type allows you to handle events generated from the AWS Simple Notification service (SNS). The event type is a record-based event type
and can contain one or more records. The following is a sample event from the AWS Lambda documentation:


```JSON
{
    "Records": [
        {
            "EventVersion": "1.0",
            "EventSubscriptionArn": "eventsubscriptionarn",
            "EventSource": "aws:sns",
            "Sns": {
                "SignatureVersion": "1",
                "Timestamp": "1970-01-01T00:00:00.000Z",
                "Signature": "EXAMPLE",
                "SigningCertUrl": "EXAMPLE",
                "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
                "Message": "Hello from SNS!",
                "MessageAttributes": {
                    "Test": {
                        "Type": "String",
                        "Value": "TestString"
                    },
                    "TestBinary": {
                        "Type": "Binary",
                        "Value": "TestBinary"
                    }
                },
                "Type": "Notification",
                "UnsubscribeUrl": "EXAMPLE",
                "TopicArn": "topicarn",
                "Subject": "TestInvoke"
            }
        }
    ]
}
```

To map the event using Vandium, we would use the `sns()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.sns( (records, context) => {

        // handle the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.sns( (records, context, callback) => {

        // handle the event

        callback( null, { /* response here */} );
    });
```
