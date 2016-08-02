## Configuring file

To configure JWT validation from a configuration file, place a `jwt` configuration block inside `vandium.json` located in your projects root path. The options for this jwt block are exactly the same as the ones used previously when configuring inside the handler module.

For example, the following `vandium.json` file would contain the following to validate using the `HS256` algorithm with a shared secret:

```json
{
	"jwt": {

		"algorithm": "HS256",
		"secret": "super-secret"
	}
}
```
