# JSON configuration file

Vandium can be configured from a configuration file that **must** be located at the project root, which lambda specifies using the `TASK_ROOT`
environment variable. The file **must** be named `vandium.json`. The format of this file is similar to that of the configuration object with the exception of an added
`s3` referral object, which allows the configuration to be loaded from AWS S3.

```js
// vandium.json
{
    env: {

        // application defined environment variables
        // "MY_ENV1": "value1",
        // "MY_ENV2": "value2"
    },

    validation: {

        // validation options here
    },

    protect: {

        // protection options here
    },

    jwt: {

        // JWT options here
    },

    // optional referral to s3 to load the configuration file
    s3: {

        // "bucket": "< your s3 bucket name >",
		// "key": "< your s3 object key >"
    }


    // other global options
}
```

**Note:** Vandium does not require the `vandium.json` file to be present. All the objects inside the configuration file are optional.
