'use strict';

// prevent calls to unwanted functions
const prevent = require( './prevent' );

const Pipeline = require( './pipeline' );

const ValidationPlugin = require( './plugins/validation' );

const ProtectPlugin = require( './plugins/protect' );

const JWTPlugin = require( './plugins/jwt' );

const ExecPlugin = require( './plugins/exec' );

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

    safeContext.vandium = {

        after: function( postFunc ) {

            vandiumInstance.after( postFunc );
        }
    }

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

    let execPlugin = new ExecPlugin();
    execPlugin.setUserFunc( userFunc );

    addPipelineItem( pipeline, stages.EXEC, execPlugin );

    return pipeline;
}

function wrapHandler( vandiumInstance, userFunc ) {

    let pipeline = createPipeline( vandiumInstance , userFunc);

	return function( event, context, callback ) {

        let session = {

            stage: stages.START,

            updateStage( s ) {

                this.stage = s;
            },

            recordError( err ) {

                this.err = err;
                this.errStage = this.stage;
            }
        }

        let pipelineEvent = {

            session,
            event,
            context: createSafeContext( vandiumInstance, context ),
            ignored: [],
        }

        pipeline.run( pipelineEvent )
            .then(

                function( results ) {

                    return { result: results.exec };
                },
                function( err ) {

                    session.recordError( err );

                    if( vandiumInstance.stripErrors ) {

                        errors.strip( err );
                    }

                    return { error: err };
                }
            )
            .then( function( execResult ) {

                session.updateStage( stages.POST );

                return executePostHandler( vandiumInstance.postHandler )
                    .catch( function( err ) {

                        session.recordError( err );
                    })
                    .then( function() {

                        callback( execResult.error, execResult.result );
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

class Vandium {

    constructor( config ) {

        this.stripErrors = true;

        this.logUncaughtExceptions = true;

        this.postHandler = function( done ) {

            done();
        };

        this.plugins = {

            jwt: new JWTPlugin(),

            validation: new ValidationPlugin(),

            protect: new ProtectPlugin()
        }

        this.configure( config );
    }

    configure( config ) {

        config = config || {};

        if( utils.isObject( config.env ) ) {

            updateEnvVars( config.env );
        }

        prevent.configure();

        this.plugins.validation.configure( config.validation || {} );
        this.plugins.jwt.configure( config.jwt || {} );
        this.plugins.protect.configure( config.protect || {} );
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
