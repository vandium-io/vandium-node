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
