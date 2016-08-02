# Using Promises

Using promises can simplify asynchronous operations and reduce/eliminate the need for nested callbacks.

The following example demonstrates how one would handle promises manually:

```js
const busLogicModule = require( 'my-bl-module' );

exports.handler = function( event, context, callback ) {

	busLogicModule.getUser( event.user_id )
		.then( function( user ) {

			return busLogicModule.requestFollowUp( user );
		})
		.then( function( followupDate ) {

			callback( null, followupDate );
		})
		.catch( function( err ) {

			callback( err );
		});
}
```

The same example using vandium would look like:

```js
const vandium = require( 'vandium' );

const busLogicModule = require( 'my-bl-module' );

exports.handler = vandium( function( event /* no need for context or callback */ ) {

	return busLogicModule.getUser( event.user_id )
		.then( function( user ) {

			return busLogicModule.requestFollowUp( user );
		});
});
```

Vandium will handle successful and failure conditions and route them appropriately to the callback function.

---
[Back to Documentation Home](README.md)
