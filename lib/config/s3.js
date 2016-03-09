'use strict';

var AWS = require( 'aws-sdk' );

var utils = require( '../utils' );

var logger = require( '../logger' );

function load( settings, callback ) {

    var s3 = new AWS.S3();

    var params = {

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
