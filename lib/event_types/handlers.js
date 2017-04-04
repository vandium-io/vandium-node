'use strict';

const identifier = require( '@vandium/event-identifier' );

const utils = require( '../utils' );

const executors = require( './executors' );

function validateType( type, event ) {

    let eventType = identifier.identify( event );

    if( type !== eventType ) {

        throw new Error( `Expected event type of ${type} but identified as ${eventType}` );
    }
}

function defaultEventProcessor( event ) {

    return event;
}

function createHandler( type, handler, eventProcessor = defaultEventProcessor ) {

    let executor = executors.create( handler );

    let lambdaHandler = function( event, context, callback ) {

        try {

            validateType( type, event );

            let handlerContext = {

                event,
                context: safeContext( context )
            };

            executor( eventProcessor( event ), handlerContext )
                .then( ( result ) => callback( null, result ) )
                .catch( ( err ) => callback( err ) );
        }
        catch( err ) {

            callback( err );
        }
    };

    return lambdaHandler;
}

function safeContext( context ) {

    let safe = utils.clone( context );
    safe.getRemainingTimeInMillis = context.getRemainingTimeInMillis;

    // remove ability for plugins to breakout
    delete safe.succeed;
    delete safe.fail;
    delete safe.done;

    return safe;
}

module.exports = {

    create: createHandler,
    validateType,
    safeContext
};
