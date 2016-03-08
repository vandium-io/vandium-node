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

            return callback( err );
        }

        logger.info( 'config loaded from s3' );

        utils.parseJSON( data, callback );
    });
}

module.exports = {

    load: load
};
