# `dynamodb` Event type

The `dynamodb` event type allows you to handle events generated from the AWS DynamoDB service. The event type is a record-based event type
and can contain one or more records. The following is a sample event from the AWS Lambda documentation:


```JSON
{

    "Records": [
        
        {
            "eventID": "1",
            "eventVersion": "1.0",
            "dynamodb": {
                "Keys": {
                    "Id": {
                        "N": "101"
                    }
                },
                "NewImage": {
                    "Message": {
                        "S": "New item!"
                    },
                    "Id": {
                        "N": "101"
                    }
                },
                "StreamViewType": "NEW_AND_OLD_IMAGES",
                "SequenceNumber": "111",
                "SizeBytes": 26
            },
            "awsRegion": "us-west-2",
            "eventName": "INSERT",
            "eventSourceARN": "eventsourcearn",
            "eventSource": "aws:dynamodb"
        },
        {
            "eventID": "2",
            "eventVersion": "1.0",
            "dynamodb": {
                "OldImage": {
                    "Message": {
                        "S": "New item!"
                    },
                    "Id": {
                        "N": "101"
                    }
                },
                "SequenceNumber": "222",
                "Keys": {
                    "Id": {
                        "N": "101"
                    }
                },
                "SizeBytes": 59,
                "NewImage": {
                    "Message": {
                        "S": "This item has changed"
                    },
                    "Id": {
                        "N": "101"
                    }
                },
                "StreamViewType": "NEW_AND_OLD_IMAGES"
            },
            "awsRegion": "us-west-2",
            "eventName": "MODIFY",
            "eventSourceARN": "sourcearn",
            "eventSource": "aws:dynamodb"
        },
        {
            "eventID": "3",
            "eventVersion": "1.0",
            "dynamodb": {
                "Keys": {
                    "Id": {
                        "N": "101"
                    }
                },
                "SizeBytes": 38,
                "SequenceNumber": "333",
                "OldImage": {
                    "Message": {
                        "S": "This item has changed"
                    },
                    "Id": {
                        "N": "101"
                    }
                },
                "StreamViewType": "NEW_AND_OLD_IMAGES"
            },
            "awsRegion": "us-west-2",
            "eventName": "REMOVE",
            "eventSourceARN": "sourcearn",
            "eventSource": "aws:dynamodb"
        }
    ]
}
```

To map the event using Vandium, we would use the `dynamodb()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.dynamodb( (records, context) => {

        // handle the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.dynamodb( (records, context, callback) => {

        // handle the event

        callback( null, 'ok' );
    });
```
