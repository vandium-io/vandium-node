'use strict';

const utils = require( '../utils' );

const executors = require( './executors' );

function doFinally( afterFunc, handlerContext ) {

    let finallyPromise;

    try {

        if( afterFunc.length <= 1 ) {

            finallyPromise = Promise.resolve( afterFunc( handlerContext ) );
        }
        else {

            finallyPromise = utils.asPromise( afterFunc, handlerContext );
        }
    }
    catch( err ) {

        finallyPromise = Promise.reject( err );
    }

    return finallyPromise.then(

            () => { /* ignore */},
            (err) => {

                console.log( 'uncaught exception during finally:', err );
            }
        );
}

function makeSafeContext( event, context ) {

    let safe = utils.clone( context );
    safe.getRemainingTimeInMillis = context.getRemainingTimeInMillis;

    // remove ability for plugins to breakout
    delete safe.succeed;
    delete safe.fail;
    delete safe.done;

    safe.event = event;

    return safe;
}

function defaultEventProc( event ) {

    return event;
}

class Handler {

    constructor( options = {} ) {

        this.eventProc = defaultEventProc;
        this.afterFunc = function() {};
    }

    addMethodsToHandler( lambdaHandler ) {

        this.addlambdaHandlerMethod( 'finally', lambdaHandler );
    }

    addlambdaHandlerMethod( methodName, lambdaHandler ) {

        lambdaHandler[ methodName ] = ( ...args ) => {

            this[ methodName ]( ...args );
            return lambdaHandler;
        }
    }

    handler( handlerFunc ) {

        this.executor = executors.create( handlerFunc );

        return this;
    }

    executePreprocessors( state ) {

    }

    processResult( result, context ) {

        return { result };
    }

    processError( error, context ) {

        return { error };
    }

    execute( event, context, callback ) {

        try {

            event = utils.clone( event );

            let state = {

                event,
                context: makeSafeContext( event, context ),
                executor: this.executor
            };

            this.executePreprocessors( state );

            if( !state.executor ) {

                throw new Error( 'handler not defined' );
            }

            state.executor( this.eventProc( state.event ), state.context )
                .then(
                    (result) => {

                        let resultObject = this.processResult( result, state.context );

                        return doFinally( this.afterFunc, state.context )
                            .then( () => resultObject );
                    },
                    ( err ) => {

                        let resultObject = this.processError( err, state.context );

                        return doFinally( this.afterFunc, state.context )
                            .then( () => resultObject );
                    }
                )
                .then( ( resultObject ) => {

                    if( state.context.callbackWaitsForEmptyEventLoop === false ) {

                        // let lambda context know that we don't want to wait for the empty event loop
                        context.callbackWaitsForEmptyEventLoop = false;
                    }

                    callback( resultObject.error, resultObject.result );
                });
        }
        catch( err ) {

            callback( err );
        }
    }

    finally( afterFunc ) {

        this.afterFunc = afterFunc;
        return this;
    }

    eventProcessor( eventProc ) {

        this.eventProc = eventProc;
        return this;
    }

    createLambda() {

        let lambdaHandler = ( event, context, callback ) => {

            this.execute( event, context, callback );
        };

        this.addMethodsToHandler( lambdaHandler );

        return lambdaHandler;
    }
}

module.exports = Handler;
