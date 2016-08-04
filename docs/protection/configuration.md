# Configuration

Attack protection can be configured via environment variables, configuration object or `vandium.json` file.


## Configuring via environment variables

Attack protection can be enabled, disabled or put into a report only state via the `VANDIUM_PROTECT` environment variable.

Value                   |  Result
------------------------|-------------------
`yes`, `on` or `true`   | Enable protection and reporting
`no`, `off` or `false`  | Disable protection and reporting
`report`                | Report only (default setting)

## Configuration via the configuration object

The `protect` object, inside the configuration object, contains the properties needed to configure attack protection.

```js

'use strict';

const vandium = require( 'vandium' ).createInstance();

vandium.configure( {

    // other options

    protect: {

        // 'fail' to fail and prevent further execution
        // 'off' to disable
        // 'report' to log (default)
        mode: 'report',
    }
});

exports.handler = vandium( function( event, context, callback ) {

    // handler code here
});
```

Where `mode` can be:
- `"report"` (default)
- `"fail"` to fail and prevent further execution
= `"off"` to disable protection


## Configuration via `vandium.json`:

As with configuring via the configuration object, the `protect` object inside the `vandium.json` will contain the properties needed to
configure attack protection.


```json
{

    "protect": {

        "mode": "report"
    }


}
```

Where `mode` can be:
- `"report"` (default)
- `"fail"` to fail and prevent further execution
= `"off"` to disable protection
