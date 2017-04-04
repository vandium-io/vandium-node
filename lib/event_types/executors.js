'use strict';

const utils = require( '../utils' );

const UncaughtError = require( '../errors' ).UncaughtError;

/**
 * @Promise
 */
function simpleExecutor( handler, ...args ) {

    try {

        return Promise.resolve( handler( ...args ) );
    }
    catch( err ) {

        throw new UncaughtError( err );
    }
}

/**
 * @Promise
 */
function asyncExecutor( handler, ...args ) {

    return utils.asPromise( handler, ...args )
        .catch( (err) => { throw new UncaughtError( err ); } );
}

function createExecutor( handler ) {

    let executor;

    if( handler.length <= 2 ) {

        executor = simpleExecutor;
    }
    else {

        executor = asyncExecutor;
    }

    return function( ...args ) {

        return executor( handler, ...args );
    }
}

module.exports = {

    create: createExecutor
};
