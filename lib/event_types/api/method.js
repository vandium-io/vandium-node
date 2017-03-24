'use strict';

const Validator = require( './validator' );

/**
 * @Promise
 */
function simpleExecutor( handler, event, handlerContext ) {

    try {

        return handler.call( handlerContext, event );
    }
    catch( err ) {

        let error = new Error( 'Uncaught exception: ' + err.message );
        error.cause = err;

        throw error;
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

            let error = new Error( 'Uncaught exception: ' + err.message );
            error.cause = err;

            reject( error );
        }
    })
}

class MethodHandler {

    constructor( handler, options ) {

        this.handler = handler;

        if( handler.length === 1 ) {

            this.executor = simpleExecutor;
        }
        else {

            this.executor = asyncExecutor;
        }

        this.validator = new Validator( options );
    }

    validate( event ) {

        this.validator.validate( event );
    }

    /**
     * @Promise
     */
    execute( event, context ) {

        let handlerContext = {

            event,
            context
        };

        return this.executor( this.handler, event, handlerContext );
    }
}

module.exports = MethodHandler;
