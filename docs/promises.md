# Using Promises

Using promises can simplify asynchronous operations and reduce/eliminate the need for nested callbacks.

The following example demonstrates how one would handle promises manually:

```js
const myModule = require( 'my-module' );

exports.handler = function( event, context, callback ) {

	myModule.getUser( event.user_id )
		.then( function( user ) {

			return myModule.requestFollowUp( user );
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

const myModule = require( 'my-module' );

exports.handler = vandium( function( event /* no need for context or callback */ ) {

	return myModule.getUser( event.user_id )
		.then( function( user ) {

			return myModule.requestFollowUp( user );
		});
});
```

Vandium will handle successful and failure conditions and route them appropriately to the callback function.
