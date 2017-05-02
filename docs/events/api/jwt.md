# JSON Web Tokens (JWT)

Vandium can handle validation, enforcement and processing of JSON Web Token (JWT) values. Configuration can be provided either via code or
through environment variables.

## Supported algorithms

The following JWT signature algorithms are supported:

Algorithm | Type
----------|------------
HS256     | HMAC SHA256 (shared secret)
HS384     | HMAC SHA384 (shared secret)
HS512     | HMAC SHA512 (shared secret)
RS256     | RSA SHA256 (public-private key)

## Enabling JWT Programatically

To enable JWT using code, use the `jwt()` function on the `api` handler. By specifying an algorithm, JWT processing is automatically enabled.
The `jwt` configuration format is:

```js
{
    algorithm: 'RS256' | 'HS256' | 'HS384' | 'HS512',
    publicKey: '<public key>',          // if algorithm is 'RS256'
    secret: '<shared secret',           // if algorithm is 'HS256', 'HS384' or 'HS512'
    token: '<token path>',              // path to jwt token. Defaults to 'headers.jwt'
    xsrf: true | false,                 // enables xsrf verification. Defaults to false unless other xsrf* options are enabled
    xsrfToken: '<xsrf token path>',     // path to xsrf token. Defaults to 'headers.xsrf'
    xsrfClaim: '<xsrf claim path>'      // path to xsrf claim inside jwt. Defaults to 'nonce'
}
```

The following example enables JWT processing programmatically:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .jwt( {

            algorithm: 'RS256'
            key: '<public key goes here>'
        })
        .GET( (event) => {

                // handle get request
            })
        // other method handlers...
```



## Configuration via Environment Variables

Environment variables can be used to configure support for JWT processing. The following environment variables can be used:

Name                    | Description
------------------------|-------------------------------------------------------
VANDIUM_JWT_ALGORITHM   | Specifies the algorithm for JWT verification. Can be `HS256`, `HS384`, `HS512` or `RS256`
VANDIUM_JWT_SECRET      | Secret key value for use with HMAC SHA algorithms: `HS256`, `HS384` and `HS512`
VANDIUM_JWT_PUBKEY      | Public key used used with `RS256` algorithm
VANDIUM_JWT_KEY         | Alias for either VANDIUM_JWT_SECRET or VANDIUM_JWT_PUBKEY
VANDIUM_JWT_TOKEN_PATH  | Name of the token variable in the `event` object. Defaults to `headers.jwt`
VANDIUM_JWT_USE_XSRF    | Enable or disable Cross Site Request Forgery (XSRF) token. Defaults to `false`
VANDIUM_JWT_XSRF_TOKEN_PATH | Name of the XSRF token in the `event`. Defaults to `headers.xsrf`
VANDIUM_JWT_XSRF_CLAIM_PATH | XSRF claim path inside JWT. Defaults to `nonce`

When the `VANDIUM_JWT_ALGORITHM` value is present, JWT processing is automatically enabled within Vandium.


## Claim enforcement

Tokens will be validated and must conform to the specification, and the following token claims (not required) will be enforced:

Claim      | Description
-----------|----------------
`iat`      | Issued At (iat) time, in seconds, that the token was created and should only be used **after** this time.
`nbf`      | Not Before (nbf) time, in seconds, that prevents the token from being used **before** the indicated time.
`exp`      | Expiry (exp) time, in seconds, the prevents the token from being used **after** the indicated time.

Any validation or enforcement issues, including poorly formed or missing tokens, will cause the handler to terminate and return an error
message using the proxy message format.

## Accessing the Decoded Token

One the JWT has been validated and verified, the decoded contents will be added to the `event` object under the `jwt` element. The following
code segment shows how to access the token:

```js
const vandium = require( 'vandium' );

exports.handler = vandium.api()
        .jwt( {

            algorithm: 'RS256'      // public key specified using env variable
        })
        .GET( (event) => {

                // user id is stored inside the token
                let userId = event.jwt.id;

                // handle get request
            });
```

## Additional Reading

For more information about JWT, see [RFC 7519](https://tools.ietf.org/html/rfc7519) and [RFC 7797](https://tools.ietf.org/html/rfc7797).
