# Inline configuration

To configure JWT validation from within your handler module, you must use the `vandium.jwt().configure()` function. The following configuration values are available:

Option      |Description                   | Required
------------|------------------------------|-----------------------------------------------------
algorithm   |Algorithm Type                | yes
secret      |Shared secret value           | Only for algorithm types: `HS256`, `HS384` or `HS512`
public_key  |Public key value              | Only for `RS256` algorithm type
token_name  |Event property name for token | No. Default is `jwt`.
xsrf        |Enable/Disable Cross Site Request Forgery (XSRF) | No. Default is `false`
xsrf_token_name | Event property name for the XSRF token | No. Default is `xsrf`
xsrf_claim_name | Claim name for XSRF token | No. Default is `xsrf_token`


The following example validates a JWT (passed in the event using the `jwt` property name) using the `HS256` algorithm with a shared secret:

```js
var vandium = require( 'vandium' );

vandium.jwt().configure( {

        algorithm: 'HS256',
        secret: 'super-secret'
    });


exports.handler = vandium( function( event, context, callback ) {

	console.log( 'jwt verified - claims: ', JSON.stringify( event.jwt.claims, null, 4 ) );

	callback( null, 'ok' );
});
```
