'use strict';

const fs = require( 'fs' );

const logger = require( '../logger' );

const utils = require( '../utils' );

function load( callback ) {

    var path = process.env.LAMBDA_TASK_ROOT + '/vandium.json';

    logger.debug( 'attempting to load config file %s', path );

    fs.readFile( path, 'utf8', function( err, contents ) {

        if( err ) {

            return callback( null, {} );
        }

        logger.info( 'config file loaded' );

        utils.parseJSON( contents, callback );
    });
}

module.exports = {

    load: load
};
