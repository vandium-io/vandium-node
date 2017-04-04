'use strict';

const utils = require( '../utils' );

const UncaughtError = require( '../errors' ).UncaughtError;

/**
 * @Promise
 */
function simpleExecutor( handler, arg1, handlerContext ) {

    try {

        return Promise.resolve( handler.call( handlerContext, arg1 ) );
    }
    catch( err ) {

        throw new UncaughtError( err );
    }
}

/**
 * @Promise
 */
function asyncExecutor( handler, arg1, handlerContext ) {

    return utils.asPromise( handler, handlerContext, arg1 )
        .catch( (err) => { throw new UncaughtError( err ); } );
}

function createExecutor( handler ) {

    let executor;

    if( handler.length <= 1 ) {

        executor = simpleExecutor;
    }
    else {

        executor = asyncExecutor;
    }

    return function( arg1, handlerContext ) {

        return executor( handler, arg1, handlerContext );
    }
}

module.exports = {

    create: createExecutor
};
