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

function makeSafeContext( event, { succeed, fail, done, ...context } ) {

    const safe = {

        ...context,
        getRemainingTimeInMillis: context.getRemainingTimeInMillis,
        event,
    };

    return safe;
}

function defaultEventProc( event ) {

    return event;
}

class Handler {

    constructor() {

        this.eventProc = defaultEventProc;

        this._configuration = {};

        this.beforeFunc = () => {};
        this.afterFunc = () => {};
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

    async processResult( result, context ) {

        return { result };
    }

    async processError( error, context ) {

        return { error };
    }

    async execute( event, context ) {

        const safeContext = makeSafeContext( event, context );

        try {

            const { error, result } = await this._execute( event, safeContext );

            if( error ) {

                throw error
            }

            return result;
        }
        finally {

            updateContext( context, safeContext );
        }
    }

    async _execute( event, context ) {

        event = utils.clone( event );

        let state = {

            event,
            context,
            executor: this.executor,
            extra: {},
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

            return await this.processResult( result, state.context, state.extra );
        }
        catch( err ) {

            return await this.processError( err, state.context, state.extra );
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

        let lambdaHandler = async ( event, context ) => {

            return this.execute( event, context );
        };

        this.addMethodsToHandler( lambdaHandler );

        return lambdaHandler;
    }
}

module.exports = Handler;
