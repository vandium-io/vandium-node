'use strict';

require( './config' );  // this will load the configuration from vandium.json

require( './prevent' ); // prevent calls to unwanted functions

const plugins = require( './plugins' );

const validation = plugins.validation;

const protect = plugins.protect;

const jwt = plugins.jwt;

const errors = require( './errors' );

const utils = require( './utils' );

const STAGES = require( './stages' );

const pipeline = plugins.pipeline;

var logUncaughtExceptions = true;

var stripErrors = true;

var postHandler = function( done ) {

    done();
};

/**
 * @Promise
 */
function executePostHandler() {

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

function createSafeContext( context ) {

    let safeContext = utils.clone( context );
    safeContext.getRemainingTimeInMillis = context.getRemainingTimeInMillis;

    // remove ability for plugins to breakout
    delete safeContext.succeed;
    delete safeContext.fail;
    delete safeContext.done;

    return safeContext;
}

function wrapHandler( userFunc ) {

    // add user defined function to pipeline
    plugins.exec.install( pipeline, userFunc );

	return function( event, context, callback ) {

        let session = {

            stage: STAGES.START,

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
            context: createSafeContext( context ),
            ignored: [],
        }

        pipeline.run( pipelineEvent )
            .then(

                function( results ) {

                    return { result: results.exec };
                },
                function( err ) {

                    session.recordError( err );

                    if( stripErrors ) {

                        errors.strip( err );
                    }

                    return { error: err };
                }
            )
            .then( function( execResult ) {

                session.updateStage( STAGES.POST );

                return executePostHandler()
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

function Vandium( userFunc ) {

	return wrapHandler( userFunc )
}

Vandium.after = function( afterHandlerFunction ) {

    if( utils.isFunction( afterHandlerFunction ) ) {

        postHandler = afterHandlerFunction;
    }
}

Vandium.validation = function( schema ) {

	if( schema ) {

		validation.configure( schema );
	}

	return validation;
}

// allow jwt to be used as a member variable or method
Vandium.jwt = function() {

    return jwt;
}

Vandium.jwt.configure = jwt.configure;

Vandium.jwt.enable = jwt.enable;

Vandium.protect = protect;

Vandium.logUncaughtExceptions = function( enable ) {

    logUncaughtExceptions = (enable !== false);
}

Vandium.stripErrors = function( enable ) {

    stripErrors = (enable !== false);
}


Object.defineProperty( Vandium, 'types', {

	get: function() {

		return validation.types();
	}
});

Object.defineProperty( Vandium, 'validator', {

    get: function() {

        return validation.validator;
    }
});

module.exports = Vandium;
