'use strict';

const Validator = require( './validator' );

const UncaughtError = require( '../../errors' ).UncaughtError;

/**
 * @Promise
 */
function simpleExecutor( handler, event, handlerContext ) {

    try {

        return Promise.resolve( handler.call( handlerContext, event ) );
    }
    catch( err ) {

        throw new UncaughtError( err );
    }
}

/**
 * @Promise
 */
function asyncExecutor( handler, event, handlerContext ) {

    return new Promise( (resolve, reject) => {

        try {

            handler.call( handlerContext, event, ( err, result ) => {

                if( err ) {

                    return reject( err );
                }

                resolve( result );
            });
        }
        catch( err ) {

            reject( new UncaughtError( err ) );
        }
    });
}

class MethodHandler {

    constructor( handler, options ) {

        this.handler = handler;

        if( handler.length <= 1 ) {

            this.executor = simpleExecutor;
        }
        else {

            this.executor = asyncExecutor;
        }

        this.validator = new Validator( options );
    }

    /**
     * @Promise
     */
    execute( event, context ) {

        this.validator.validate( event );

        let handlerContext = {

            event,
            context
        };

        return this.executor( this.handler, event, handlerContext );
    }
}

module.exports = MethodHandler;
