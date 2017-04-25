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


function applyValues( value, ...values ) {

    if( value !== undefined ) {

        return value;
    }

    for( let newValue of values ) {

        if( newValue !== undefined ) {

            return newValue;
        }
    }

    return;
}

function valueFromPath( obj, path ) {

    for( let pathPart of path ) {

        if( (obj === undefined) || (obj === null) ) {

            break;
        }

        obj = obj[ pathPart ];
    }

    return obj;
}

// use vandium-utils as the base
module.exports = Object.assign( {

        parseJSON,
        asPromise,
        applyValues,
        valueFromPath
    },
    require( 'vandium-utils' )
);
