const { asPromise } = require( '../utils' );

async function simpleExecutor( handler, ...args ) {

    return await handler( ...args );
}

async function asyncExecutor( handler, ...args ) {

    // will create a callback
    return asPromise( handler, ...args );
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
