# `lex` Event type

The `lex` event type allows you to handle events generated from AWS Alexa service. The following is a sample event from the AWS Lambda
documentation:

```JSON
{
    "messageVersion": "1.0",
    "invocationSource": "FulfillmentCodeHook or DialogCodeHook",
    "userId": "user-id specified in the POST request to Amazon Lex.",
    "sessionAttributes": {
        "key1": "value1",
        "key2": "value2"
    },
    "bot": {
        "name": "bot-name",
        "alias": "bot-alias",
        "version": "bot-version"
    },
    "outputDialogMode": "Text or Voice, based on ContentType request header in runtime API request",
    "currentIntent": {
        "name": "intent-name",
        "slots": {
            "slot-name": "value"
        },
        "confirmationStatus": "None, Confirmed, or Denied (intent confirmation, if configured)"
    }
}
```

To map the event using Vandium, we would use the `lex()` handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.lex( (event, context) => {

        // do something with the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.lex( (event, context, callback) => {

        // do something with the data

        // Must invoke callback() since Vandium thinks you would like to control asynchronous operations yourself
        callback( null, { /* response here */ } );
    });
```
