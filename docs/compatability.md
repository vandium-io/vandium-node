# AWS Lambda Compatibility

Vandium is compatible with AWS Lambda environments that support Node.js 4.3.2.

## Synchronous Handlers
Synchronous functions that do not return values are **not** fully supported as in the following example:

```js
exports.handler = function( event, context, callback ) {

    console.log( 'do something here' );

    // don't return a value
}
```

## Node 0.10.x
If you require support for the previous version of Node.js (0.10.x) then use version 1.x.
