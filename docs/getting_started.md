# Getting Started

Vandium can be used with minimal change to your existing code.

```js
var vandium = require( 'vandium' );

exports.handler = vandium( function( event, context, callback ) {

	callback( null, 'ok' );
});
```

To enable validation on the values in the `event` object, configure it using a validation schema object.

```js
var vandium = require( 'vandium' );

vandium.validation( {

	name: vandium.types.string().required()
});Â

exports.handler = vandium( function( event, context, callback ) {

	console.log( 'hello: ' + event.name );

	callback( null, 'ok' );
});
```

When the lambda function is invoked, the event object will be checked for a presence of `event.name`. If the value does not exist, then the lambda will fail and an error message will be returned to the caller. Vandium will take care of calling `callback()` to route the error.

---
[Back to Documentation Home](main.md)
