'use strict';

const identifier = require( '@vandium/event-identifier' );

const executors = require( './executors' );

function validateType( type, event ) {

    let eventType = identifier.identify( event );

    if( type !== eventType ) {

        throw new Error( `Expected event type of ${type} but identified as ${eventType}` );
    }
}

function createHandler( type, handler ) {

    let executor = executors.create( handler );

    let lambdaHandler = function( event, context, callback ) {

        try {

            validateType( type, event );

            let handlerContext = {

                event,
                context
            };

            executor( event.Records, handlerContext )
                .then( ( result ) => callback( null, result ) )
                .catch( ( err ) => callback( err ) );
        }
        catch( err ) {

            callback( err );
        }
    };

    return lambdaHandler;
}

module.exports = createHandler;
