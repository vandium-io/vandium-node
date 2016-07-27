'use strict';

const AWS = require( 'aws-sdk' );

const utils = require( '../utils' );

const logger = require( '../logger' );

/**
 * @Promise
 */
function load( bucket, key ) {

    let s3 = new AWS.S3();

    let params = {

        Bucket: bucket,
        Key: key
    };

    logger.debug( 'loading from s3:', params );

    return s3.getObject( params ).promise()
        .then( function( data ) {

            logger.info( 'config loaded from s3' );

            return utils.parseJSON( data.Body );
        });
}

module.exports = {

    load: load
};
