const vandiumUtils = require( 'vandium-utils' )

const qs = require( 'qs' )

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

function qsParse( content ) {

    if( content.indexOf( '=' ) !== -1 ) {

        return ( qs.parse( content ) );
    }
    else {

        throw new Error( 'Expected "=" in querystring' );
    }
}

function parseQueryString( content, callback ) {

    if( callback ) {

        try {

            callback( null, qsParse( content ) );
        }
        catch( err ) {

            callback( err );
        }
    }
    else {

        return qsParse( content );
    }
}

async function asPromise( handler, ...args ) {

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

function map( objOrArray, processor ) {

    if( Array.isArray( objOrArray ) ) {

        return objOrArray.map( processor );
    }
    else {

        return processor( objOrArray, 0 );
    }
}

// use vandium-utils as the base
module.exports = {

        ...vandiumUtils,

        applyValues,
        asPromise,
        map,
        parseJSON,
        parseQueryString,
        valueFromPath
};
