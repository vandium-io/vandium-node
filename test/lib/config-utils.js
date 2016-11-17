'use strict';

const fs = require( 'fs' );

const appRoot = require( 'app-root-path' );

const path = appRoot + '/vandium.json';

process.env.LAMBDA_TASK_ROOT = appRoot;

function readConfig( callback ) {

    try {

        let content = fs.readFileSync( path );

        if( callback ) {

            return callback( null, content );
        }

        return content;
    }
    catch( err ) {

        if( callback ) {

            return callback();
        }
    }
}

function writeConfig( data, callback ) {

    if( data ) {

        try {

            fs.writeFileSync( path, data );
        }
        catch( err ) {

            if( callback ) {

                return callback( err );
            }

            throw err;
        }
    }

    if( callback ) {

        callback();
    }
}

function removeConfig( callback ) {

    try {

        fs.unlinkSync( path );
    }
    catch( err ) {

        // do nothing!
    }

    if( callback ) {

        return callback();
    }
}

module.exports = {

    writeConfig: writeConfig,

    readConfig: readConfig,

    removeConfig: removeConfig,

    path
};
