# Configuration via S3

To configure your settings from AWS S3, set the to your `vandium.json` configuration file to reference your S3 bucket and key. The S3 bucket
must be in the same region and your lambda should have access to it.

```json
{
	"s3": {
		"bucket": "< your s3 bucket name >",
		"key": "< your s3 object key >"
	}
}
```

The object returned by S3 should conform to that of the [`vandium.json`](json-file.md) file.

## Considerations

When using S3 based configurations, your lambda will take longer to load and thus have a larger initial billing amount for the first run. If
you are concerned about latency, please use the `vandium.json` to store credentials. If credentials are sensitive you can create the file
during deployment and removed immediately afterward.
