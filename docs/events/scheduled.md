# `scheduled` Event type

The `scheduled` event type allows you to handle events generated from AWS Cloud Watch scheduler service. The following is a sample event
from the AWS Lambda documentation:

```JSON
{
  "account": "123456789012",
  "region": "us-east-1",
  "detail": {},
  "detail-type": "Scheduled Event",
  "source": "aws.events",
  "time": "1970-01-01T00:00:00Z",
  "id": "cdc73f9d-aea9-11e3-9d5a-835b769c0d9c",
  "resources": [
    "arn:aws:events:us-east-1:123456789012:rule/my-schedule"
  ]
}
```

To map the event using Vandium, we would use the `scheduled()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.scheduled( (event, context) => {

        // do something with the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.scheduled( (event, context, callback) => {

        // do something with the data

        // Must invoke callback() since Vandium thinks you would like to control asynchronous operations yourself
        callback( null, { /* response here */ } );
    });
```
