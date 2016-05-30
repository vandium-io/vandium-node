'use strict';

function parseJSON( content, callback ) {

    if( callback ) {

        try {

            callback( null, JSON.parse( content ) );
        }
        catch( err ) {

            callback( err );
        }
    }
    else {

        return JSON.parse( content );
    }
}

// use vandium-utils as the base
module.exports = Object.assign( { parseJSON }, require( 'vandium-utils' ) );
