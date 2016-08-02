# SQL Injection Attack Detection and Protection

The default settings inside Vandium will detect and report SQL injection (SQLi) attacks into `console.log`.

The following report would be written to `console.log` if the event contains a string with a potential attack.

```
// event

{
	"user": "admin`--"
}
```

```
// console.log

*** vandium - SQL Injection Detected - ESCAPED_COMMENT
key = user
value =  admin'--
```

## Stop Execution when Attack is Detected

The protection setting will cause Lambda's `callback( error )` to be called when a potential attack is encountered in addition to a `console.log` report being generated.

To enable attack prevention:

```js
var vandium = require( 'vandium' );

vandium.protect.sql.fail();	// fail when potential attack is detected

exports.handler = vandium( function( event, context, callback ) {

	// your handler code here
});
```

## Disabling Attack Protection

Attack protection can be disabled completely. To disable:

```js
var vandium = require( 'vandium' );

vandium.protect.disable();
```

## Configuring Attack Protection Using the `VANDIUM_PROTECT` Environment Variable

Attack protection can be enabled, disabled or put into a report only state via the `VANDIUM_PROTECT` environment variable.

Value                   |  Result
------------------------|-------------------
`yes`, `on` or `true`   | Enable protection and reporting
`no`, `off` or `false`  | Disable protection and reporting
`report`                | Report only (default setting)

---
[Back to Documentation Home](README.md)
