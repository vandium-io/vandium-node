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

function asPromise( handler, ...args ) {

    return new Promise( (resolve, reject ) => {

        try {

            let handlerArgs = args.slice();

            handlerArgs.push( (err,result) => {

                if( err ) {

                    return reject( err );
                }

                resolve( result );
            });

            handler( ...handlerArgs );
        }
        catch( err ) {

            reject( err );
        }
    });
}

// use vandium-utils as the base
module.exports = Object.assign( {

        parseJSON,
        asPromise
    },
    require( 'vandium-utils' ) );
