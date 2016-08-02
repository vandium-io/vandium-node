## Using Environment Variables

Environment variables can be used to configure support for JWT processing. The following environment variables can be used:

Name                    | Description
------------------------|-------------------------------------------------------
VANDIUM_JWT_ALGORITHM   | Specifies the algorithm for JWT verification. Can be `HS256`, `HS384`, `HS512` or `RS256`
VANDIUM_JWT_SECRET      | Secret key value for use with HMAC SHA algorithms: `HS256`, `HS384` and `HS512`
VANDIUM_JWT_PUBKEY      | Public key used used with `RS256` algorithm
VANDIUM_JWT_TOKEN_NAME  | Name of the token variable in the `event` object. Defaults to `jwt`
VANDIUM_JWT_USE_XSRF    | Enable or disable Cross Site Request Forgery (XSRF) token. Defaults to `false`
VANDIUM_JWT_XSRF_TOKEN_NAME | XSRF token name. Defaults to `xsrf`
VANDIUM_JWT_XSRF_CLAIM_NAME | XSRF claim name inside JWT. Defaults to `xsrf_token`
