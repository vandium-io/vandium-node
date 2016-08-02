# Validation and enforcement

## Supported algorithms

The following JWT signature algorithms are supported:

Algorithm | Type
----------|------------
HS256     | HMAC SHA256 (shared secret)
HS384     | HMAC SHA384 (shared secret)
HS512     | HMAC SHA512 (shared secret)
RS256     | RSA SHA256 (public-private key)

## Claim enforcement

Tokens will be validated and must conform to the specification, and the following token claims (not required) will be enforced:

Claim      | Description
-----------|----------------
`iat`      | Issued At (iat) time, in seconds, that the token was created and should only be used **after** this time.
`nbf`      | Not Before (nbf) time, in seconds, that prevents the token from being used **before** the indicated time.
`exp`      | Expiry (exp) time, in seconds, the prevents the token from being used **after** the indicated time.

Any validation or enforcement issues, including poorly formed or missing tokens, will cause an exception to be thrown and routed to the function's `callback` handler. Exception thrown will contain a message that is prefixed with "authentication error".

JWT validation and enforcement is automatically enabled once the algorithm has been configured. JWT enforcement cannot be disabled.
