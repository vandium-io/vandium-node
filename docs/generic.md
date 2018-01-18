# `generic` Event type

The `generic` event type allows you to handle any type of Lambda event from any source. To map the event using Vandium, use the `generic()`
handler:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.generic()
    .handler( (event, context) => {

        // handle the event
    });
```

Your handler can return a Promise or value. If you require the use of a callback function for asynchronous operations that cannot be done
using Promises, then you can provide a callback parameter in your code.

```js
const vandium = require( 'vandium' );

exports.handler = vandium.generic()
    .handler( (event, context, callback) => {

        // handle the event

        callback( null, { /* response here */ } );
    });
```
