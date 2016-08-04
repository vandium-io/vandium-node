# Configuration

Validation can be configured programmatically, via a configuration object or from a `vandium.json` file.

## Validation Object

Whether your configuring validation via the API, configuration object or from a JSON file, you will need to configure the `validation` object. The format of the `validation` object is as follows:

```js
{
    // If the schema is omitted then validation is not performed
    schema: {

        // validators go here
    },

    // true to ignore unknown values, false to throw an exception. Defaults to true.
    allowUnknown: boolean,      

    // optional
    ignore: [ /* values */ ]      // ignore event.xxxx
}
```

## Configuring via API

Validation can be configured using the `vandium.validation.configure()` function, which requires the following input:

### Example

```js
'use strict';

const vandium = require( 'vandium' );

vandium.validation.configure( { // validation object

    schema: {

        name: vandium.types.string().required(),

        age: vandium.types.number().required()
    },

    allowUnknown: false,

    ignore: [ "access_token" ]
});

exports.handler = vandium( function( event, context, callback ) {

    // handler code here
});
```

## Configuration via the configuration object

To configure validation via the configuration object:

### Example

```js

'use strict';

const vandium = require( 'vandium' ).createInstance();

vandium.configure( {

    // other options

    validation: {

        schema: {

            name: "string:required",

            age: "number:required"
        },

        allowUnknown: false,

        ignore: [ "access_token" ]
    }
})

exports.handler = vandium( function( event, context, callback ) {

    // handler code here
});
```

## Configuring via `vandium.json`

Validation can be configured using the `vandium.json` file, which is located at the root of the project.

### Example

```json
{

    "validation": {

        "schema" : {

            "name": "string:required",

            "age": "number:required"
        },

        "allowUnknown": false,

        "ignore": [ "access_token" ]
    }

}
```
