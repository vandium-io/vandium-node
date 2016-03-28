[![Build Status](https://travis-ci.org/vandium-io/vandium-node.svg?branch=master)](https://travis-ci.org/vandium-io/vandium-node)
[![npm version](https://badge.fury.io/js/vandium.svg)](https://badge.fury.io/js/vandium)

# vandium-node

Simplifies writing [AWS Lambda](https://aws.amazon.com/lambda/details) functions using [Node.js](https://nodejs.org) for [API Gateway](https://aws.amazon.com/api-gateway), IoT applications, and other event cases.

## Features
* Powerful input validation
* JWT verfication and validation
* SQL Injection (SQLi) detection and protection
* Forces values into correct types
* Handles uncaught exceptions
* Promise support
* Automatically trimmed strings for input event data
* Low startup overhead

## Installation
Install via npm.

	npm install vandium --save

## Getting Started

Vandium can be used with minimal change to your existing code.

```js
var vandium = require( 'vandium' );

exports.handler = vandium( function( event, context ) {
	
	context.succeed( 'ok' );
});
```

To enable validation on the values in the `event` object, configure it using a validation schema object.

```js
var vandium = require( 'vandium' );

vandium.validation( {

	name: vandium.types.string().required()
});

exports.handler = vandium( function( event, context ) {
	
	console.log( 'hello: ' + event.name );
	
	context.succeed( 'ok' );
});
```

When the lambda function is invoked, the event object will be checked for a presence of `event.name`. If the value does not exist, then the lambda will fail and an error message will be returned to the caller. Vandium will take care of calling `context.fail()` to route the error.

## Validation

Vandium allows validations on basic types, objects and arrays. Additionally validation can be performed on nested values inside objects and arrays. Vandium's validation system uses [joi (version 5.1.0)](https://github.com/hapijs/joi/tree/v5.1.0) internally and thus most of its functionality may be used.

### Types

|Type		   | Description
|------------|------------
|string      | String value. Automatically trimmed
|number      | Number value (integer or floating point)
|boolean     | Boolean value (`true` or `false`)
|date        | Date value
|email       | Email address
|uuid        | [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUID)
|binary	   | Binary value uncoded using `base64`
|any		   | Any type of value
|object      | Object
|array       | Arrays of values

### Common Scenarios

#### Strings

For a string that is between 1 and 250 characters long and required, the following would be used:

```js
{
    name: vandium.types.string().min( 1 ).max( 250 ).required()
}
```

Regex expressions can be used:

```js
{
    type: vandium.types.string().regex( /^[abcdef]+$/ )
}
```

Note: Strings are automatically trimmed. To disable this functionality, add an option when creating the type:

```js
{
    string_not_trimmed: vandium.types.string( { trim: false } )
}
```

For more information on how to configure strings, see the [joi string reference](https://github.com/hapijs/joi/tree/v5.1.0#string).

#### Numbers

Numbers can be validated against ranges and forced to be integers:

```js
{
	age: vandium.types.number().integer().min( 0 ).max( 130 ).required()
}
```

To specify the number of decimal places allowed:

```js
{
	price: vandium.types.number(). precision( 2 ).required()
}
```

For more information on how to configure numbers, see the [joi numbers reference](https://github.com/hapijs/joi/tree/v5.1.0#number).

#### Boolean

The `boolean` validator can accept the following values: `true`, `false`, `"true"`, `"false"`, `"yes"` and `"no"`.

#### Date

The `date` validator can match values against standard Javascript date format as well as the number of milliseconds since the epoch.

Ranges can be specified using min and max:

```js
{
	start: vandium.types.date().min( '1-1-1970' ).required(),
	end: vandium.types.date().max( 'now' ).required()
}
```

For more information on how to configure dates, see the [joi date reference](https://github.com/hapijs/joi/tree/v5.1.0#date).

#### Email

The `email` validator matches values that conform to valid email address format. Since this validator uses strings, it additional string operations can be used with it.

#### UUID

The `uuid` validator matches values that conform to the UUID specification. This validator is based on the string validator and thus other string operations can be used.

#### Binary

Binary values can be limited by length:

```js
{
	data: vandium.types.binary().min( 10 ).max( 1000 )
}
```

Once binary values are processed, they are converted into `Buffer` instances.

#### Any

The `any` validator will match any value. For more information about using this validator, see the [joi any reference](https://github.com/hapijs/joi/tree/v5.1.0#any).


#### Object

The `object` validator allows validation of an object and potentially the values within it. For example, if an object contains information about an job position the following validator could be used:

```js
{
	job: vandium.types.object().keys({
	
			name: vandium.types.string().required(),
			dept: vandium.types.string().required(),
			salary: vandium.types.number().precision( 2 ).required(),
			vacation_days: vandium.types.number().integer().required(),
			hiring_manager: vandium.types.string()
     	})
}
```

For more information on how to configure objects, see the [joi object reference](https://github.com/hapijs/joi/tree/v5.1.0#object).

#### Array

The `array` can match values the are part of a selection, specific types and/or pattern.

The following example demonstrates matching seven numbers between 1 and 49:

```js
{
	lucky_numbers: vandium.types.array().includes( vandium.types.number().min( 1 ).max( 49 ) ).length( 7 )
}
```

For more information on how to configure arrays, see the [joi array reference](https://github.com/hapijs/joi/tree/v5.1.0#array).


### Value Conversion

Values will be converted, if required, to reduce the amount of code required in the user portion of the lambda function. For example, the validation configuration of:

```js
vandium.validation( {

    age: vandium.types.number().required()
});
```

with an event of:

```js
{
    age: '42'
}
```

would be converted to:

```js
{
    age: 42
}
```

Additionally, `binary` data with a schema of:

```js
vandium.validation( {

    data: vandium.types.binary()
});
```
with an event containing:

```js
{
    data: 'dmFuZGl1bSBsYW1iZGEgd3JhcHBlcg=='
}
```
would be converted to a `Buffer` instance with the data parsed and loaded:

```js
{
    data: Buffer( ... )
}
```

## SQL Injection Attack Detection and Protection

The default settings inside Vandium will delect and report SQL injection (SQLi) attacks into `console.log`.

The following report would be written to `console.log` if the event contains a string with a potential attack.

```
// event

{
	"user": "admin`--"
}
```

```
// console.log

*** Vandium - SQL Injection Detected - ESCAPED_COMMENT
key = user
value =  admin'--
```

### Stop Execution when Attack is Detected

The protection setting will cause Lambda's `context.fail()` to be called when a potential attack is encountered in addition to a `console.log` report being generated.

To enable attack prevention:

```js
var vandium = require( 'vandium' );

vandium.protect.sql.fail();	// fail when potential attack is detected

exports.handler = vandium( function( event, context ) {
	
	// your handler code here
});
```

### Disabling Attack Protection

Attack protection can be disabled completely. To disable:

```js
var vandium = require( 'vandium' );

vandium.protect.disable();
```

## Using Promises
Using promises can simplify asynchronous operations and reduce/eliminate the need for nested callbacks.

The following example demonstrates how one would handle promises manually:

```js
var busLogicModule = require( 'my-bl-module' );

exports.handler = function( event, context ) {

	busLogicModule.getUser( event.user_id )
		.then( function( user ) {
			
			return busLogicModule.requestFollowUp( user );
		})
		.then( function( followupDate ) {
		
			context.succeed( followupDate );
		})
		.catch( function( err ) {
		
			context.fail( err );
		});
}
```

The same example using vandium would look like:

```js
var vandium = require( 'vandium' );

var busLogicModule = require( 'my-bl-module' );

exports.handler = vandium( function( event, context ) {
	    
	return busLogicModule.getUser( event.user_id )
		.then( function( user ) {
			
			return busLogicModule.requestFollowUp( user );
		});
});
```

Vandium will handle successful and failure conditions.

Promises are supported by ES6/ES2015 and are available in the latest versions of Node.js. An implementation of Promises that works well with the current AWS Lambda environment (Node.js 0.10.36) is [bluebird](http://bluebirdjs.com).

## JSON Web Token (JWT)

Vandium can handle validation and processing of JWT tokens. For more information about JWT, see [RFC 7519](https://tools.ietf.org/html/rfc7519). The following JWT signature algorithms are supported:

|Algorithm | Type
-----------|------------
|HS256		 | HMAC SHA256 (shared secret)
|HS384		 | HMAC SHA384 (shared secret)
|HS512		 | HMAC SHA512 (shared secret)
|RS256		 | RSA SHA256 (public-private key)

In addition, token validation supports the `iat` and `exp` values to prevent tokens being used before or after a specified time. No configuration is required to enable this functionality and it cannot be disabled.

### Configuring JWT from inside handler module

To configure JWT validation, you must enable it by calling `vandium.jwt().configure()`. The following configuration values are available:

|Option      |Description                   | Required
-------------|------------------------------|----------
|algorithm   |Algorithm Type                | yes
|secret      |Shared secret value           | Only for algorithm types: `HS256`, `HS384` or `HS512`
|public_key  |Public key value              | Only for `RS256` algorithm type
|token_name  |Event property name for token | No. Default is `jwt`.



The following example validates a jwt token (passed in the event using the `jwt` property name) using the `HS256` algorithm with a shared secret:

```js
var vandium = require( 'vandium' );

vandium.jwt().configure( {

        algorithm: 'HS256',
        secret: 'super-secret' 
    });


exports.handler = vandium( function( event, context ) {
	
	console.log( 'jwt verified - claims: ', JSON.stringify( event.jwt.claims, null, 4 ) );
	
	context.succeed( 'ok' );
});
```

### Configuring JWT from a configuration file

To configure JWT validation from a configuration file, place a `jwt` configuration block inside `vandium.json` located in your projects root path. The options for this jwt block are exactly the same as the ones used previously when configuring inside the handler module.

For example, the following `vandium.json` file would contain the following to validate using the `HS256` algorithm with a shared secret:

#####Figure A: vandium.json located at root of your project
```json
{
	"jwt": {
		"algorithm": "HS256",
		"secret": "super-secret"
	}
}
```

### Configuring JWT using API Gateway Stage Variables

AWS API Gateway supports the use of stage variables to provide configuration information when the lambda function is invoked. Note that Vandium JWT configuration using stage variables only works when invoking your lambda function within API gateway.

#### Configuration instructions:

__Step 1:__ In the root directory of your project, create a file called `vandium.json` with the following contents:

```json
{
	"jwt": {
		"use_stage_vars": true
	}
}
```

<br>
__Step 2:__ In API Gateway, create an API method with your Vandium-wrapped lambda function attached.

<br>
__Step 3:__ Set up a mapping template to extract the information provided in the stage variables (setting up the stage variables will be explained in the next step). In your API Gateway method, go to the __integration request__ page and select __Mapping Templates__. For content type, input __application/json__. After that, change the __Input passthrough__ setting to __Mapping template__, then input a mapping template in one of the following forms:
<br>

* Using `HS256`, `HS384`, or `HS512` without a custom token name: 
 
```json
{
    "jwt": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET"
}
``` 
 >__Note:__ In all of these example templates, "Authorization" is used as the HTTP header name that contains the JWT.  


* Using `HS256`, `HS384`, or `HS512` with a custom token name:

```json
{
    "myTokenName": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET",
    "VANDIUM_JWT_TOKEN_NAME": "$stageVariables.VANDIUM_JWT_TOKEN_NAME"
}
```
>__Note:__ In this example, the JWT token will appear in your lambda function as `event.myTokenName`. If a custom token name is not used, the JWT will appear as `event.jwt`. 

<br>

* Using `RS256` without a custom token name:

```json
{
    "jwt": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET",
    "VANDIUM_JWT_PUBKEY": "$stageVariables.VANDIUM_JWT_PUBKEY"
}
```

* Using `RS256` with a custom token name:

```json
{
    "myTokenName": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET",
    "VANDIUM_JWT_PUBKEY": "$stageVariables.VANDIUM_JWT_PUBKEY",
    "VANDIUM_JWT_TOKEN_NAME": "$stageVariables.VANDIUM_JWT_TOKEN_NAME"
}
```


<br>
Here is how the mapping template setup should look like:

![Mapping Template Example](https://raw.githubusercontent.com/vandium-io/vandium-node-dev/michael/docs/img/%20stageVaraibleTemplateExample.png?token=AMktROdlMhy0VTMzKlqQ-uCIAzpLR5Uzks5W6bOZwA%3D%3D)

This example uses an `HS256`, `HS384`, or `HS512` JWT validation algorithm with the custom token name myTokenName.



For more information about AWS API Gateway mapping templates, check out the official documentation:

[API Gateway Mapping Template Reference](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)

<br>
__Step 4:__ Setting up the stage variables. Deploy your API then go to the stage editor for the stage you just deployed. In the Stage Variables tab, set up the stage variables as specified in the following chart.


### Stage Variable Setup

The following stage variables can be used to provide the correct values to the JWT validation handler:

| Name                        | Description                                      |  Required when using algorithms
------------------------------|--------------------------------------------------|----------------------------
| VANDIUM\_JWT\_ALGORITHM     | Algorithm type                     | `HS256`, `HS384`, `HS512`, or `RS256`
| VANDIUM\_JWT\_SECRET        | Shared secret value                              | `HS256`, `HS384`, or `HS512`
| VANDIUM\_JWT\_PUBKEY        | Public key                                       | `RS256`
| VANDIUM\_JWT\_TOKEN\_NAME   | Name of the token variable in the event. Default value is `jwt` | Optional


Here is an example stage variable setup on the AWS browser console using the `HS256` algorithm and a token with a custom name myTokenName:

![Stage Variables Example](https://raw.githubusercontent.com/vandium-io/vandium-node-dev/michael/docs/img/stageVariableExample.png?token=AMktRMeqvvzoFJISzdD9jbPNzwpiIHcNks5W6bRSwA%3D%3D)

If you're not using a custom token name, then you can omit the `VANDIUM_JWT_TOKEN_NAME` stage variable.

For more information on how API Gateway stage variables work, check out the official documentation:

[Deploy an API with Stage Variables in Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html)

## Configuration via S3

To configure your settings (currently only jwt is supported), add the following information to your `vandium.json` configuration file that is located at the root of your project:

```json
{
	"s3": {
		"bucket": "< your s3 bucket name >",
		"key": "< your s3 object key >"
	}
}
```

The object located inside S3 must be a valid JSON file that contains configuration parameters as described in this document (__see Figure A__).

## NPM Warnings

The validation code uses `joi` and has two dependencies on sister modules that state that node 0.10.40 is "wanted" as indicated by the following console output:

```sh
npm WARN engine topo@1.1.0: wanted: {"node":">=0.10.40"} (current: {"node":"0.10.36","npm":"2.14.20"})
npm WARN engine hoek@2.16.3: wanted: {"node":">=0.10.40"} (current: {"node":"0.10.36","npm":"2.14.20"})
vandium@1.0.0 node_modules/vandium
├── app-root-path@1.0.0
├── jwt-simple@0.4.1
├── loglevel@1.4.0
├── lodash@3.10.1
└── joi@5.1.0 (topo@1.1.0, isemail@1.2.0, hoek@2.16.3, moment@2.12.0)
```

Running the tests for `joi` in the 0.10.36 environment provides the following output that indicates that the code base is operating as intended.

```sh
 joi@5.1.0 test /Users/rhyatt/vandium/vandium-node-test/node_modules/vandium/node_modules/joi
> lab -t 100 -a code


  
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ..................................................
  ...........................

527 tests complete
Test duration: 619 ms
Assertions count: 2188 (verbosity: 4.15)
No global variable leaks detected
Coverage: 100.00%
```

## License

[BSD-3-Clause](https://en.wikipedia.org/wiki/BSD_licenses)

Copyright (c) 2016, Vandium Software Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of Vandium Software Inc. nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
