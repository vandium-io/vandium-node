# [vandium-node](main.md)

## Configuration

To configure vandium, place a JSON file called `vandium.json` in the root of your project. When present, vandium will load it synchronously. Currently the configuration file supports environment variable definintions, JWT settings and a link to s3 to load additional settings not available at deployment time.

### Environment Variable Mapping

Environment variables can be defined under the `env` object and can contain multiple key-value pairs that will loaded into the `process.env` object after the `require( 'vandium' )` statement.

```json
{
	"env": {
		"MY_APP_ID": "9313e239-1cb4-42be-8c81-1ca8240ec09c"
	}
}
```

The above environment variable setting would set the value of `process.env.MY_APP_ID` to the value specified in the `vandium.json` file. Please note that vandium will **not** overwrite any environment variables that have already been set by the environment.


### Configuration via S3

To configure your settings (currently only jwt is supported), add the following information to your `vandium.json` configuration file that is located at the root of your project:

```json
{
	"s3": {
		"bucket": "< your s3 bucket name >",
		"key": "< your s3 object key >"
	}
}
```

---
[Back to Documentation Home](main.md)
