# Cleaning Up after Handler Execution

Leaving resources open at the end of a handler's execution can lead to timeouts and longer execution times.
For example, one might use a caching server but freeing the resource during the handler's execution might add unwanted complexity. Vandium's `finally` operation can be used to free resources upon each invocation whether the handler succeeds or fails.

```js
const vandium = require( 'vandium' );

const cache = require( './cache' );

const scanner = require( './scanner' );

// handler for an s3 event
exports.handler = vandium.s3( (records) => {

        return cache.connect()
            .then( () => {

                // assume that we only have 1 record
                let bucket = record[0].s3.bucket.name;
                let key = record[0].s3.object.key;

                return scanner( bucket, key, cache );
            })
            .finally( ( /*context*/ ) => {

                return cache.release();
            });
```

If the finally is not returning a synchronous operation or a `Promise` and requires an asynchronous callback, then the code might look as follows:

```js
const vandium = require( 'vandium' );

const cache = require( './cache' );

const scanner = require( './scanner' );

// handler for an s3 event
exports.handler = vandium.s3( (records) => {

        return cache.connect()
            .then( () => {

                // assume that we only have 1 record
                let bucket = record[0].s3.bucket.name;
                let key = record[0].s3.object.key;

                return scanner( bucket, key, cache );
            })
            .finally( (context, done) => {

                cache.release( (err) => {

                    if( err ) {

                        console.log( 'failed to release cache' );

                        return done( err );
                    }

                    done();
                });
            });
```

If an exception is thrown during the `finally` operation, it will be logged and the handler will continue to exit normally.
