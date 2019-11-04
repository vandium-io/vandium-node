'use strict';

const utils = require( '../utils' );

/**
 * @Promise
 */
async function simpleExecutor( handler, ...args ) {

    return await handler( ...args );
}

/**
 * @Promise
 */
async function asyncExecutor( handler, ...args ) {

    // will create a callback
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

    return async function( ...args ) {

        return executor( handler, ...args );
    }
}

module.exports = {

    create: createExecutor
};
