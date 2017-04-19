'use strict';

const utils = require( '../utils' );

/**
 * @Promise
 */
function simpleExecutor( handler, ...args ) {

    try {

        return Promise.resolve( handler( ...args ) );
    }
    catch( err ) {

        return Promise.reject( err );
    }
}

/**
 * @Promise
 */
function asyncExecutor( handler, ...args ) {

    return utils.asPromise( handler, ...args );
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
