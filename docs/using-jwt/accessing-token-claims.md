# Accessing the JWT Value Once Validated

When a JWT value is passed through the event object it will be validated and then replaced with a new object that will contain the original token and its decoded claims.
The following properties exist after the token is validated:

Property     | Type    | Description
-------------|---------|--------------------------------------------------------
`claims`     | Object  | Claims supplied by the signer of the token
`token`      | String  | Original token before being decoded and validated.


To access the JWT object one would use the same name as it appears in the event. For example, it the event contains the JWT in the `jwt` (default) variable of the `event` object, we could access the contents of the token as follows:

```js
var vandium = require( 'vandium' );

exports.handler = vandium( function( event, context, callback ) {

    console.log( 'jwt original token:', event.jwt.token );

    console.log( 'jwt decoded claims', event.jwt.claims );

	callback( null, 'ok' );
});
```
