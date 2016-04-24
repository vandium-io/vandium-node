'use strict';

const fs = require( 'fs' );

const appRoot = require( 'app-root-path' );

const path = appRoot + '/vandium.json';

const freshy = require( 'freshy' );

function readConfig( callback ) {

    fs.readFile( path, function( err, content ) {

        if( err ) {

            return callback();
        }

        callback( null, content );
    });
}

function writeConfig( data, callback ) {

    if( data ) {

        return fs.writeFile( path, data, callback );
    }
    else {

        callback();
    }
}


function removeConfig( callback ) {

    freshy.unload( '../../lib/config' );

    fs.unlink( path, function() {

        callback();
    });
}

module.exports = {

    writeConfig: writeConfig,

    readConfig: readConfig,

    removeConfig: removeConfig
};
