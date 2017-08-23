'use strict';

const utils = require( '../utils' );

const executors = require( './executors' );

function asPromise( func, handlerContext ) {

    let promise;

    try {

        if( func.length <= 1 ) {

            promise = Promise.resolve( func( handlerContext ) );
        }
        else {

            promise = utils.asPromise( func, handlerContext );
        }
    }
    catch( err ) {

        promise = Promise.reject( err );
    }

    return promise;
}

function doBefore( beforeFunc,  handlerContext ) {

    return asPromise( beforeFunc, handlerContext );
}

function doFinally( afterFunc, handlerContext ) {

    return asPromise( afterFunc, handlerContext )
        .then(

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

        this._configuration = {};

        this.beforeFunc = function() {};
        this.afterFunc = function() {};
    }

    addMethodsToHandler( lambdaHandler ) {

        this.addlambdaHandlerMethod( 'before', lambdaHandler );
        this.addlambdaHandlerMethod( 'callbackWaitsForEmptyEventLoop', lambdaHandler );
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

        if( this._configuration.callbackWaitsForEmptyEventLoop === false ) {

            state.context.callbackWaitsForEmptyEventLoop = false;
        }
    }

    processResult( result, context ) {

        return { result };
    }

    processError( error, context ) {

        return { error };
    }

    execute( event, context, callback ) {

        event = utils.clone( event );

        let state = {

            event,
            context: makeSafeContext( event, context ),
            executor: this.executor
        };

        try {

            this.executePreprocessors( state );

            if( !state.executor ) {

                throw new Error( 'handler not defined' );
            }

            doBefore( this.beforeFunc, state.context )
                .then( (beforeResult) => {

                    if( beforeResult ) {

                        state.context.additional = beforeResult;
                    }

                    return state.executor( this.eventProc( state.event ), state.context );
                })
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

            // let handler type determine how we're going to process the error
            let resultObject = this.processError( err, state.context );

            callback( resultObject.error, resultObject.result );
        }
    }

    before( beforeFunc ) {

        this.beforeFunc = beforeFunc;
        return this;
    }

    callbackWaitsForEmptyEventLoop( enabled = true) {

        this._configuration.callbackWaitsForEmptyEventLoop = enabled;
        return this;
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
