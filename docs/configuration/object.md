# Configuration object

The configuration object is used to initialize or configure an instance of Vandium. An instance can be configured during the call to
`vandium.createInstance()`, or via a call to the instance's `configure()` method.


## Configuring via `vandium.createInstance()`:

```js

'use strict';

const vandium = require( 'vandium' ).createInstance( {

    env: {

        // MY_ENV1: 'value1',
        // MY_ENV2: 'value2'
        // etc
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


    // other global options
});
```

## Using `vandium.configure()`:

```js
'use strict';

const vandium = require( 'vandium' ).createInstance();

vandium.configure( {

    env: {

        // "MY_ENV1": "value1"',
        // "MY_ENV2": "value2"
        // etc
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


    // other global options
});
```

The values for `env`, `validation`, `protect` and `jwt` can be found in their respective sections of the documentation. Global options can be found
[here](global-options.md).
