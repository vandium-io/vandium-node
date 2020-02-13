# Change Log

## 6.1.0 (2020-02-13)

New:

* Can now supply a JWK to `authorization()` in `api()` handlers.

## 6.0.1 (2020-01-21)

Internal:

* `aws-sdk` now in `devDependencies`


## 6.0.0 (2020-01-07)

New:

* `api` has an `authorization()` alias for `jwt()` to improve code readability

Breaking:

* `api` uses `event.headers.Authorization` as the default location of
  the JWT token. Previous versions before `6.0.0` used `event.headers.jwt`.
* Node 12.x and higher
* Previous versions of Vandium prevented calls to `eval()` but turns out to be
  more problematic.

Internal:

* New pipeline method for executing handler in an effort to allow greater future
flexibility

## 5.1.0 (2019-12-04)

New:

* Added `onResponse()` to allow changes to response object on `api` handlers
* Support for `Set-Cookie`. Thanks @riotrah
* Support for `multValueHeaders`, `multiValueQueryStringParameters`. Thanks @riotrah
* Validation properties now support `__allowUnknown` to raise an error if unknown
properties are detected.

Updated:

* Validation now supports alternatives using the `[]` notation
* Documentation and updated way to opt out of JWT validation. Thanks @riotrah

Internal:

* Refactored Tests
* Updated dependenceis

## 5.0.0 (2019-11-23)

New:

* Simplified Api Gateway event handlers with the addition of `validation()` and `handler()` methods
* mongodb injection attack detection

Breaking:

* `cloudwatch` event type renamed to `logs`

Updated:

* `onError()` now accepts async functions

Internal:

* Unit tests refactored
* Updated dependencies
* nodejs 10.16+ required

## 4.10.0 (2019-01-22)

Updated:

* Added `event` and `context` objects to `onError()`

## 4.9.0 (2018-10-22)

Updated:

* Validation now uses Joi 14.0
* Improved error handling to provide custom body structure. Thanks @dkreuer

Fixed:

* Documentation typos. Thanks @StellarTabi

Internal:

* Updated test dependencies

## 4.8.0 (2018-04-03)

Updated:

* Status code set to 400 when validation error occurs when using API Gateway event. Thanks @lironess

## 4.7.0 (2018-01-23)

Updated:

* Scheduled event handler modified to allow custom event types. Thanks @wasenbr

Internal:

* Migrated code coverage from istanbul to nyc.
* Mocha 5.0 now a dev dependency

## 4.6.0 (2017-10-16)

Updated:

* Support for `isBase64Encoded` for API Gateway responses. Thanks @pkalamegham

## 4.5.0 (2017-09-19)

New:

* Automatic loading of environment variables from AWS SSM Parameter Store

## 4.4.2 (2017-09-13)

Internal:

* `mocha` test dependency is now run using a global install

## 4.4.0 (2017-09-12)

Updated:

* Added `event.rawBody` to API Gateway requests. Thanks @msteckyefantis

Internal:

* Updated test dependencies

## 4.3.0 (2017-08-30)

New:

* `.before()` added to allow handlers to perform initialization operations. Thanks @wasenbr
* `.callbackWaitsForEmptyEventLoop` add to define how the callback works. Thanks @wasenbr

Fix:

* `event.body` not being parsed or validated correctly. Thanks @RobBrazier

Updated:

* Test dependencies

## 4.2.0 (2017-07-17)

Updated:

* JWT for API Gateway now removes 'Bearer' prefix. Thanks @RobBrazier


## 4.1.0 (2017-05-18)

Updated:

* JWT: Public key with or without armor will be parsed and reformatted to make it easier to use the RS256 algorithm

Fix:

* Joi validation provider was pre-loading the library which cause compatibility issues with new version of Joi


## 4.0.0 (2017-05-05)

New:

* Event-based handler framework
* API Gateway handler mechanism to simplify lambda-proxy implementations
* Targeted validation, JWT enforcement and injection protection

Removed:

* Legacy wrapper for lambda functions
* Generalized validation, JWT and injection protection

Updated:

* Re-wrote most of the library
* Changed to work better with Node 6.1.x LTS


## 3.3.0 (2016-11-30)

New:

* `vandium.callbackWaitsForEmptyEventLoop( true | false )` configuration option to prevent callbacks for waiting for empty event loops
* `callbackWaitsForEmptyEventLoop` configuration option to `Vandium.configure()` to prevent callbacks for waiting for empty event loops
* `lambdaProxy` configuration option for AWS API Gateway lambda proxy support

Updated:

* Better error handling for AWS API Gateway including status codes for standard Vandium errors

Internal:

* Tests no longer use `lambda-tester` to reduce possibility of future circular dependency
* Changed `node-uuid` package to use new `uuid` one as per author's request


## 3.2.0 (2016-09-23)

New:

* `context.callbackWaitsForEmptyEventLoop` is now supported

Internal:

* Removed `codecov` module from build process

## 3.1.0 (2016-08-17)

New:

* Added `stringifyErrors` configuration property to improve error handling with AWS API Gateway

Updated:

* Configurations loaded from AWS S3 are now merged with the existing one

Internal:

* Changed callbacks to use ES2015 arrow functions


## 3.0.0 (2016-08-04)

New:

* Vandium instances can now be created programmatically via a builder pattern for integration into frameworks
* Configure all parameters via a main configuration function
* Integrates `joi-json` library to allow configuration of validation rules in both simple JSON and strings.
* Validator will ignore unknown events by default. Can be configured using the `allowUnknown` validation configuration property.
* Improved documentation
* New examples

Changed:

* Vandium singleton state gets reset after wrapping handler with `vandium()`. No longer requires module to be unloaded when testing

Internal:

* Refactored all areas where state is preserved. Not a problem for lambda but makes it easier to test on non-lambda environments

## 2.7.3 (2016-07-14)

Fixed:

* SQL injection attack detection for escape sequence with comments reporting false positive (issue #8)

## 2.7.2 (2016-07-08)

Updated:

* Changed how internal pipeline is created and thus preventing exceptions where `vandium()` is called more than once.

## 2.7.1 (2016-06-27)

New:

* Exceptions that get routed to `callback()` or `context.fail()` will get all properties, other than `err.message`, stripped
to hide details of underlying code. This can be disabled by calling `vandium.stripErrors( false )`.

## 2.6.1 (2016-06-22)

Updated:

* Joi from 8.0.x to 8.4.x

Internal:

* Changed resolution method for validation engine (Joi)

## 2.6.0 (2016-06-09)

New:

* XSRF token support for JWT for improved security

Internal:

* Refactored validation pipeline and JWT validation

## 2.5.1 (2016-05-30)

Internal:

* Changed to use [vandium-utils](https://github.com/vandium-io/vandium-utils) project.

## 2.5.0 (2016-05-27)

Improved:

* Calls to `context.succeed()`, `context.fail()` and `context.done()` are now re-routed to the `callback` function

Internal:

* Updated for future rough in for the [lov](https://github.com/vandium-io/lov) validation engine
* Simplified and streamline code and tests in several areas

## 2.4.0 (2016-05-11)

New:

* calling `eval()` from inside the Lambda handler will cause a security violation exception to be thrown


## 2.3.0 (2016-05-07)

New:

* Environment variable support to enable/disable injection attack protection

Improved:

* Documentation split into several markdown files inside the `docs` folder
* Reworked injection attack scanning for future updates
* Update unit tests for full coverage


## 2.2.1 (2016-04-27)

Improved:

* Reduced load process even further by not requiring s3 resources unless they are needed
* Removed dependency on `lodash` to reduce load times

## 2.2.0 (2016-04-25)

Improved:

* JWT can now be auto configured by having jwt configuration element in vandium.json or by setting environment variables
* Optimized load process to reduce billing costs for cold runs.
* Warm runs are quicker than previous releases


## 2.1.0 (2016-04-17)

New:

* Added vandium.after() to provide a mechanism to free resources after the handler calls callback or returns a promise.


## 2.0.3 (2016-04-15)

Improved:

* Only uncaught exceptions are logged and not those that are raised because of input validation or JWT verification issues

## 2.0.2 (2016-04-14)

Updated:

* Minor addition of vandium.logUncaughtExceptions() to prevent uncaught exceptions from being sent to console.log

## 2.0.1 (2016-04-11)

Updated:

* Tests now use version 2.1 of lambda-tester

Fixed:

* Minor documentation fixes

## 2.0.0 (2016-04-09)

New:
* Added support for AWS Lambda callback handler
* Environment variables can defined inside `vandium.json`

Improved:
* Uncaught exceptions are logged to `console.log()` and routed to `callback()`

Changed:
* When return promises to vandium, the callback pattern is used instead of context.succeed/fail

Compatibility:
* Requires Node 4.3.2. For 0.10.x support, use version 1.x


## 1.2.2 (2016-04-01)

Updated:

* JWT validation engine

Fixed:

* SQL Injection (SQLi) attack detection and protection to examine nested objects inside event

Improved:

* Reduced NPM package size


## 1.2.1 (2016-03-27)

Fixed:

* Synchronous handlers can now return value to the caller


## 1.2.0 (2016-03-21)

Added:

* SQL Injection (SQLi) attack detection and protection


## 1.1.0 (2016-03-16)

Added:

* support for Promises. Tested with [bluebird](http://bluebirdjs.com)


## 1.0.1 (2016-03-10)

Added:

* travis ci
* build status shield

Fixed:

* unit tests failing if a vandium.json file was present
* documentation typos

## 1.0.0 (2016-03-09)

Initial Release
