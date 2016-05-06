# [vandium-node](main.md)

## Post Handler Cleanup

Leaving resources open at the end of a handler's execution can lead to timeouts and longer execution times. For example, one might use a caching server but freeing the resource during the handler's execution might add unwanted complexity. Vandium's `after` function gets called before the callback gets invoked, thus freeing your resources without extra code bloat.

Usage: `vandium.after( funct )` where `funct` is a function that returns synchronously, asynchronously using a callback, or returns a `Promise`.

### Synchronous call to `vandium.after()`:

When calling synchronously, when the function returns the vandium will invoke the callback handler.

```js
const vandium = require( 'vandium' );

const busLogicModule = require( 'my-bl-module' );

vandium.after( function() {

        busLogcModule.closeCache();
    });

exports.handler = vandium( function( event ) {

	return busLogicModule.getUser( event.user_id )
		.then( function( user ) {

			return busLogicModule.requestFollowUp( user );
		});
```

### Asynchronous call to `vandium.after()`:

When calling asynchronously with a function that takes a callback `done` that gets invoked when the operation inside `after()` is complete.

```js
const vandium = require( 'vandium' );

const busLogicModule = require( 'my-bl-module' );

vandium.after( function( done ) {

        busLogcModule.closeCache( done );
    });

exports.handler = vandium( function( event ) {

	return busLogicModule.getUser( event.user_id )
		.then( function( user ) {

			return busLogicModule.requestFollowUp( user );
		});
```

### Asynchronous call with Promises in `vandium.after()`:

A `Promise` can be returned and once it has been resolved, the handler will complete.

```js
const vandium = require( 'vandium' );

const busLogicModule = require( 'my-bl-module' );

vandium.after( function() {

        return busLogcModule.closeCacheAsync();
    });

exports.handler = vandium( function( event ) {

	return busLogicModule.getUser( event.user_id )
		.then( function( user ) {

			return busLogicModule.requestFollowUp( user );
		});
```

---

[Back to Documentation Home](main.md)
