# Getting Started

Vandium creates event specific handlers to reduce the amount of code than one needs to maintain.

```js
const vandium = require( 'vandium' );

// handler for an s3 event
exports.handler = vandium.s3( (records) => {

        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );
    });
```

Since this is an `s3` type handler, Vandium isolates the records from the lambda event. If we wanted to access the lambda context, we would modify the code as follows:

```js
const vandium = require( 'vandium' );

// handler for an s3 event
exports.handler = vandium.s3( ( records, context ) => {

        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );

        console.log( 'time remaining: ', context.getRemainingTimeInMillis() );
    });
```

Also note that Vandium is handling the `callback` for us. If we wanted to do something asynchronous, we could add the `callback` parameter and then return the appropriate response.

```js
const vandium = require( 'vandium' );

const scanFile = require( './async-file-scanner' );

const processFile = require( './async-file-processor' );

// handler for an s3 event
exports.handler = vandium.s3( ( records, context, callback ) => {


        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );

        scanFile( bucket, key, (err1,result1) => {

            if( err1 ) {

                return callback( err1 );
            }

            processFile( result1.id, bucket, key, (err2,result2) => {

                console.log( 'time remaining: ', context.getRemainingTimeInMillis() );

                callback( err2, result2 );
            });
        })
    });
```

Promises can be used to make writing asynchronous code a little easier to understand and maintain. Vandium supports the `Promise` implementation without any special configuration.

```js
const vandium = require( 'vandium' );

const scanFile = require( './promise-file-scanner' );

const processFile = require( './promise-file-processor' );

// handler for an s3 event
exports.handler = vandium.s3( ( records, context ) => {


        let bucket = record[0].s3.bucket.name;
        let key = record[0].s3.object.key;

        console.log( `event triggered on bucket: ${bucket}, key: ${key}` );

        // Note: make sure you call return on your Promise!
        return scanFile( bucket, key )
            .then( (result) => {

                return processFile( result.id, bucket, key );
            })
            .then( (result) => {

                console.log( 'time remaining: ', context.getRemainingTimeInMillis() );

                return result;
            });
    });
```

Please note that you must call `return` on your Promise and do not specify the `callback` parameter if you intend to use Promises.
