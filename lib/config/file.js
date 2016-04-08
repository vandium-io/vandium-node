'use strict';

const fs = require( 'fs' );

const logger = require( '../logger' );

/** synchronous */
function load( callback ) {

    var path = process.env.LAMBDA_TASK_ROOT + '/vandium.json';

    logger.debug( 'attempting to load config file' );

    var contents;

    try {

        let fileContents = fs.readFileSync( path, 'utf8' );

        contents = JSON.parse( fileContents );

        logger.debug( 'loaded config from file' );
    }
    catch( err ) {

        logger.debug( 'no configuration loaded from file' );

        contents = {};
    }
    
    callback( null, contents );
}

module.exports = {

    load: load
};
