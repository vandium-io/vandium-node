'use strict';

const vandium = require( 'vandium' );

exports.handler = vandium.s3( (records, context, callback) => {

        let s3 = records[ 0 ].s3;

        let filename = s3.object.key;

        let bucketname = s3.bucket.name;

        console.log( `file: ${filename} from bucket: ${bucketname}` );

        callback( null, {

            filename,
            bucketname
        });
    });
