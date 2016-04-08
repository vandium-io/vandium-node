'use strict';

const AWS = require( 'aws-sdk' );

const utils = require( '../utils' );

const logger = require( '../logger' );

function load( settings, callback ) {

    let s3 = new AWS.S3();

    let params = {

        Bucket: settings.bucket,
        Key: settings.key
    };

    s3.getObject( params, function( err, data ) {

        if( err ) {

            logger.error( 'error loading from s3', err );

            return callback( err );
        }

        logger.info( 'config loaded from s3' );

        utils.parseJSON( data.Body, callback );
    });
}

module.exports = {

    load: load
};
