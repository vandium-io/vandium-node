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

    constructor( config, handlerFunc ) {

        this.eventProc = defaultEventProc;
        this.afterFunc = function() {};

        this._configuration = config || {};

        if( handlerFunc ) {

            this.handler( handlerFunc );
        }
    }

    addMethodsToHandler( lambdaHandler ) {

        this.addlambdaHandlerMethod( 'finally', lambdaHandler );
        this.addlambdaHandlerMethod( 'configure', lambdaHandler );
        this.addlambdaHandlerMethod( 'memory', lambdaHandler );
        this.addlambdaHandlerMethod( 'timeout', lambdaHandler );
        this.addlambdaHandlerMethod( 'role', lambdaHandler );
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

    executePreprocessors( /*state*/ ) {

    }

    processResult( result/*, context*/ ) {

        return { result };
    }

    processError( error/*, context*/ ) {

        return { error };
    }

    memory( m ) {

        return this.configure( { memory: m }, true );
    }

    timeout( t ) {

        return this.configure( { timeout: t }, true );
    }

    role( r ) {

        return this.configure( { role: r }, true );
    }

    configure( config, preserve ) {

        let base = preserve ? this._configuration : {};

        this._configuration = Object.assign( base, config );

        return this;
    }

    appendConfiguration( config ) {

        return this.configure( config, true );
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

            // let handler type determine how we're going to process the error
            let resultObject = this.processError( err, state.context );

            callback( resultObject.error, resultObject.result );
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

        const handler = this;

        lambdaHandler._isVandium = true;

        Object.defineProperty( lambdaHandler, 'configuration', {

            get() {

                return handler._configuration;
            }
        });

        return lambdaHandler;
    }
}

module.exports = Handler;
