const utils = require( '../utils' );

const executors = require( './executors' );

const Pipeline = require( './pipeline' );

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

class Handler {

    constructor() {

        this._configuration = {};

        this.afterFunc = () => {};

        this._execPipeline = this._createPipeline();

        this.eventProcessor( (event) => event );
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

    async processResult( result /*, context*/ ) {

        return { result };
    }

    async processError( error /*, context*/ ) {

        return { error };
    }

    async execute( event, context ) {

        const safeContext = makeSafeContext( event, context );

        try {

            const { error, result } = await this._executePipeline( event, safeContext );


            if( error ) {

                throw error
            }

            return result;
        }
        finally {

            updateContext( context, safeContext );
        }
    }

    async _executePipeline( event, context ) {

        let state = {

            event: utils.clone( event ),
            context,
            executor: this.executor,
            extra: {},
        };

        const pipeline = this._execPipeline.executor();

        try {

            const result = await pipeline.run( state );

            return await this.processResult( result, state.context, state.extra );
        }
        catch( err ) {

            return await this.processError( err, state.context, state.extra );
        }
        finally {

            if( pipeline.wasStageRun( 'beforeHandler' ) ) {

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

        this._execPipeline.stage( 'beforeHandler', async (state) => {

            const { context } = state;

            context.additional = await asPromise( beforeFunc, context );
        });

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

        this._execPipeline.stage( 'runHandler', async (state) => {

            const { event, context, executor } = state;

            return await executor( eventProc( event ), context );
        });

        return this;
    }

    createLambda() {

        let lambdaHandler = async ( event, context ) => {

            return this.execute( event, context );
        };

        this.addMethodsToHandler( lambdaHandler );

        return lambdaHandler;
    }

    _createPipeline() {

        let pipeline = new Pipeline( [ 'preprocessors', 'validateExecutor', 'beforeHandler', 'runHandler' ] );

        pipeline.stage( 'preprocessors', (state) => {

            this.executePreprocessors( state );
        });

        pipeline.stage( 'validateExecutor', (state) => {

            if( !state.executor ) {

                throw new Error( 'handler not defined' );
            }
        });

        return pipeline;
    }
}

module.exports = Handler;
