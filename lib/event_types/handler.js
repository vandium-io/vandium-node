'use strict';

const utils = require( '../utils' );

const executors = require( './executors' );

async function asPromise( func, handlerContext ) {

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

function updateContext( context, safeContext ) {

    if( safeContext.callbackWaitsForEmptyEventLoop === false ) {

        // let lambda context know that we don't want to wait for the empty event loop
        context.callbackWaitsForEmptyEventLoop = false;
    }
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

    async processError( error, context ) {

        return { error };
    }

    execute( event, context, callback ) {

        const safeContext = makeSafeContext( event, context );

        this._execute( event, safeContext )
            .then( resultObject => {

                updateContext( context, safeContext );

                callback( resultObject.error, resultObject.result );
            })
            .catch( err => {

                updateContext( context, safeContext );

                // something went wrong
                callback( err );
            });
    }

    async _execute( event, context ) {

        event = utils.clone( event );

        let state = {

            event,
            context,
            executor: this.executor
        };

        let canRunAfterFunc = false;

        try {

            this.executePreprocessors( state );

            if( !state.executor ) {

                throw new Error( 'handler not defined' );
            }

            let beforeResult = await asPromise( this.beforeFunc, state.context );

            if( beforeResult ) {

                state.context.additional = beforeResult;
            }

            canRunAfterFunc = true;
            let result = await state.executor( this.eventProc( state.event ), state.context );

            return this.processResult( result, state.context );
        }
        catch( err ) {

            return await this.processError( err, state.context );
        }
        finally {

            if( canRunAfterFunc ) {

                try {

                    await asPromise( this.afterFunc, state.context );
                }
                catch( err ) {

                    console.log( 'uncaught exception during finally:', err );
                }
            }
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
