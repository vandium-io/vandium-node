# Environment variables

The following environment variables can be set to configure the Vandium instance.

Variable                    | Description
----------------------------|-------------------
VANDIUM_JWT_ALGORITHM       | [Algorithm for JWT verification](../events/api/jwt.md)
VANDIUM_JWT_SECRET          | [Secret JWT key](../events/api/jwt.md)
VANDIUM_JWT_PUBKEY          | [Public JWT key](../events/api/jwt.md)
VANDIUM_JWT_KEY             | [Alias for either VANDIUM_JWT_SECRET or VANDIUM_JWT_PUBKEY](../events/api/jwt.md)
VANDIUM_JWT_TOKEN_PATH      | [Name of the JWT token variable](../events/api/jwt.md)
VANDIUM_JWT_USE_XSRF        | [Enable JWT Cross Site Request Forgery (XSRF) token](../events/api/jwt.md)
VANDIUM_JWT_XSRF_TOKEN_PATH | [JWT XSRF token path](../events/api/jwt.md)
VANDIUM_JWT_XSRF_CLAIM_NAME | [JWT XSRF claim name](../events/api/jwt.md)
VANDIUM_PREVENT_EVAL        | [Prevent `eval()` from being called](../protection/eval-prevention.md)
VANDIUM_PROTECT             | [Configure attack protection](../protection/configuration.md)

## Application specific environment variables

In addition to the above environment variables, Vandium can set environment variables to be used by your handler. To set environment variables,
use the `env` object inside the configuration object or `vandium.json` file.

For example, the following configuration loads an identity value into `process.env.MY_APP_ID`:

```js
{
	"env": {

		"MY_APP_ID": "9313e239-1cb4-42be-8c81-1ca8240ec09c"
	}
}
```

Please note that Vandium will **not** overwrite any environment variables that have already been set by the environment.
