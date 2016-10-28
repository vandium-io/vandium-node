'use strict';

// prevent calls to unwanted functions
const prevent = require( './prevent' );

const Pipeline = require( './pipeline' );

const plugins = require( './plugins' );

const errors = require( './errors' );

const utils = require( './utils' );

const stages = require( './stages' );

const LambdaProxy = require( './lambda_proxy' );

/**
 * @Promise
 */
function executePostHandler( postHandler ) {

    // call post handler
    return new Promise( function( resolve, reject ) {

        try {

            if( postHandler.length === 1 ) {

                // need to tell handler when finished
                postHandler( function( err ) {

                    if( err ) {

                        return reject( err );
                    }

                    resolve();
                });
            }
            else {

                resolve( postHandler() );
            }
        }
        catch( err ) {

            reject( err );
        }
    });
}

function createSafeContext( vandiumInstance, context ) {

    let safeContext = utils.clone( context );
    safeContext.getRemainingTimeInMillis = context.getRemainingTimeInMillis;

    // remove ability for plugins to breakout
    delete safeContext.succeed;
    delete safeContext.fail;
    delete safeContext.done;

    return safeContext;
}


function addPipelineItem( pipeline, stage, plugin ) {

    pipeline.add( stage, ( pipelineEvent, callback ) => {

        try {

            pipelineEvent.session.updateStage( stage );

            plugin.execute( pipelineEvent, callback );
        }
        catch( err ) {

            callback( err );
        }
    });
}

function createPipeline( vandiumInstance, userFunc ) {

    let pipeline = new Pipeline();

    addPipelineItem( pipeline, stages.JWT, vandiumInstance.plugins.jwt );
    addPipelineItem( pipeline, stages.PROTECT, vandiumInstance.plugins.protect );
    addPipelineItem( pipeline, stages.INPUT, vandiumInstance.plugins.validation );

    let execPlugin = new plugins.ExecPlugin();
    execPlugin.setUserFunc( userFunc );

    addPipelineItem( pipeline, stages.EXEC, execPlugin );

    return pipeline;
}

function createSession() {

    return {

        stage: stages.START,

        updateStage( s ) {

            this.stage = s;
        },

        recordError( err ) {

            this.err = err;
            this.errStage = this.stage;
        }
    };
}

function doCallback( event, context, execResult, vandiumInstance, callback ) {

    let error = execResult.error;
    let result = execResult.result;

    try {

        let lambdaProxy = vandiumInstance.lambdaProxy;

        if( lambdaProxy ) {

            if( error ) {

                result = lambdaProxy.onError( event, context, error );

                // result contains proxied error
                error = null;
            }
            else {

                result = lambdaProxy.onResult( event, context, result );
            }
        }
        else if( (vandiumInstance.stringifyErrors === true) && utils.isObject( error ) ) {

            error = errors.stringify( error );
        }
    }
    catch( err ) {

        console.log( 'error while processing callback', err );
    }

    callback( error, result );
}

function wrapHandler( vandiumInstance, userFunc ) {

    if( userFunc.__isVandium === true ) {

        // already vandium wrappeed
        return userFunc;
    }

    let pipeline = createPipeline( vandiumInstance, userFunc );

    let vandiumizedFunction = function( event, context, callback ) {

        let session = createSession();

        // only set if user configures the setting
        if( vandiumInstance.callbackWaitsForEmptyEventLoop === false ) {

            context.callbackWaitsForEmptyEventLoop = false;
        }

        let safeContext = createSafeContext( vandiumInstance, context );

        let pipelineEvent = {

            session,
            event,
            context: safeContext,
            ignored: [],
        };

        pipeline.run( pipelineEvent )
            .then(

                ( results ) => {

                    return { result: results.exec };
                },
                ( err ) => {

                    session.recordError( err );

                    if( vandiumInstance.stripErrors ) {

                        errors.strip( err, (vandiumInstance.stringifyErrors === true) );
                    }

                    return { error: err };
                }
            )
            .then( ( execResult ) => {

                session.updateStage( stages.POST );

                if( safeContext.callbackWaitsForEmptyEventLoop === false ) {

                    // tell lambda to exit on callback()
                    context.callbackWaitsForEmptyEventLoop = false;
                }

                return executePostHandler( vandiumInstance.postHandler )
                    .catch( ( err ) => {

                        session.recordError( err );
                    })
                    .then( () => {

                        doCallback( event, safeContext, execResult, vandiumInstance, callback );
                    });
            });

        return pipelineEvent.returnValue;
	};

    vandiumizedFunction.__isVandium = true;

    return Object.freeze( vandiumizedFunction );
}

function updateEnvVars( env ) {

    for( let key in env ) {

        if( !process.env[ key  ] ) {

            process.env[ key ] = env[ key ].toString();
        }
    }
}

function getBooleanValue( value, defaultValue ) {

    if( value !== undefined ) {

        return utils.parseBoolean( value );
    }

    return defaultValue;
}

class Vandium {

    constructor( config ) {

        this.stripErrors = true;

        this.logUncaughtExceptions = true;

        this.postHandler = function( done ) {

            done();
        };

        this.plugins = {

            jwt: new plugins.JWTPlugin(),

            validation: new plugins.ValidationPlugin(),

            protect: new plugins.ProtectPlugin()
        }

        this.callbackWaitsForEmptyEventLoop = true;

        this.configure( config );
    }

    configure( config ) {

        config = config || {};

        if( utils.isObject( config.env ) ) {

            updateEnvVars( config.env );
        }

        this.stripErrors = getBooleanValue( config.stripErrors, true );
        this.logUncaughtExceptions = getBooleanValue( config.logUncaughtExceptions, true );
        this.stringifyErrors = getBooleanValue( config.stringifyErrors, false );
        this.callbackWaitsForEmptyEventLoop = getBooleanValue( config.callbackWaitsForEmptyEventLoop, true );

        let lambdaProxy;

        if( config.lambdaProxy === true ) {

            lambdaProxy = new LambdaProxy();
        }
        else if( config.lambdaProxy && utils.isFunction( config.lambdaProxy.onError ) && utils.isFunction( config.lambdaProxy.onResult ) ) {

            lambdaProxy = config.lambdaProxy;
        }

        if( lambdaProxy ) {

            this.lambdaProxy = lambdaProxy;

            // these options must be disabled
            this.stripErrors = false;
            this.stringifyErrors = false;
        }

        prevent.configure();

        this.plugins.validation.configure( config.validation || {} );
        this.plugins.jwt.configure( config.jwt || {} );
        this.plugins.protect.configure( config.protect || {} );
    }

    getConfiguration() {

        return {

            stripErrors: this.stripErrors,
            logUncaughtExceptions: this.logUncaughtExceptions,
            stringifyErrors: this.stringifyErrors,
            callbackWaitsForEmptyEventLoop: this.callbackWaitsForEmptyEventLoop,

            validation: this.plugins.validation.getConfiguration(),
            jwt: this.plugins.jwt.getConfiguration(),
            protect: this.plugins.protect.getConfiguration()
        };
    }

    handler( userFunc ) {

        return wrapHandler( this, userFunc );
    }

    after( afterHandlerFunction ) {

        if( utils.isFunction( afterHandlerFunction ) ) {

            this.postHandler = afterHandlerFunction;
        }
    }

    get validation() {

        return this.plugins.validation;
    }

    get jwt() {

        return this.plugins.jwt;
    }

    get protect() {

        return this.plugins.protect;
    }
}

module.exports = Vandium;
