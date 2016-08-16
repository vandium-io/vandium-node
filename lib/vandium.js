'use strict';

// prevent calls to unwanted functions
const prevent = require( './prevent' );

const Pipeline = require( './pipeline' );

const plugins = require( './plugins' );

const errors = require( './errors' );

const utils = require( './utils' );

const stages = require( './stages' );

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

    pipeline.add( stage, function( pipelineEvent, callback ) {

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

function wrapHandler( vandiumInstance, userFunc ) {

    let pipeline = createPipeline( vandiumInstance , userFunc);

    return function( event, context, callback ) {

        let session = createSession();

        let pipelineEvent = {

            session,
            event,
            context: createSafeContext( vandiumInstance, context ),
            ignored: [],
        }

        pipeline.run( pipelineEvent )
            .then(

                ( results ) => {

                    return { result: results.exec };
                },
                ( err ) => {

                    session.recordError( err );

                    if( vandiumInstance.stripErrors ) {

                        errors.strip( err );
                    }

                    return { error: err };
                }
            )
            .then( ( execResult ) => {

                session.updateStage( stages.POST );

                return executePostHandler( vandiumInstance.postHandler )
                    .catch( ( err ) => {

                        session.recordError( err );
                    })
                    .then( () => {

                        let error = execResult.error;

                        if( (vandiumInstance.stringifyError === true) && utils.isObject( error ) ) {

                            error = errors.stringify( error );
                        }

                        callback( error, execResult.result );
                    });
            });

        return pipelineEvent.returnValue;
	};
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

        this.configure( config );
    }

    configure( config ) {

        config = config || {};

        if( utils.isObject( config.env ) ) {

            updateEnvVars( config.env );
        }

        this.stripErrors = getBooleanValue( config.stripErrors, true );
        this.logUncaughtExceptions = getBooleanValue( config.logUncaughtExceptions, true );
        this.stringifyError = getBooleanValue( config.stringifyError, false );

        prevent.configure();

        this.plugins.validation.configure( config.validation || {} );
        this.plugins.jwt.configure( config.jwt || {} );
        this.plugins.protect.configure( config.protect || {} );
    }

    getConfiguration() {

        return {

            stripErrors: this.stripErrors,
            logUncaughtExceptions: this.logUncaughtExceptions,
            stringifyError: this.stringifyError,

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
