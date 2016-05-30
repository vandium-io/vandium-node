'use strict';

require( './config' );  // this will load the configuration from vandium.json

require( './prevent' ); // prevent calls to unwanted functions

const validation = require( './validation' );

const protect = require( './protect' );

const jwt = require( './jwt' );

const eventPipeline = require( './event_pipeline' );

const utils = require( './utils' );

const STAGES = require( './stages' );

var logUncaughtExceptions = true;

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

function wrapCallback( callback ) {

    return function( error, result ) {

        executePostHandler()
            .catch( function( err ) {

                console.log( '*** vandium - error running afterHandler function', err );
            })
            .then( function() {

                callback( error, result );
            });
    }
}

function wrapContext( context, callback ) {

    let wrappedContext = utils.clone( context );

    wrappedContext.getRemainingTimeInMillis = context.getRemainingTimeInMillis;

    // need to proxy them to our new callback
    wrappedContext.succeed = function( result ) {

            callback( null, result );
        };

    wrappedContext.fail = function( err ) {

            if( !err ) {

                err = new Error();
            }

            callback( err );
        };

    // same as calling callback - but we're not going to let the context stop
    // right away. Might want to change this in the future if people want the old
    // behaviour
    wrappedContext.done = callback;

    return wrappedContext;
}

function wrapHandler( userFunc ) {

	return function( event, context, callback ) {

        let stage = STAGES.START;

		try {

            eventPipeline.process( event, function( pipelineEvent ) {

                stage = pipelineEvent.stage;
            });

            stage = STAGES.EXEC;

            callback = wrapCallback( callback );

            // route context.done(), context.succeed() and context.fail() to callback
            context = wrapContext( context, callback );

			let retValue = userFunc( event, context, callback );

            if( utils.isPromise( retValue ) ) {

				retValue
					.then( function( value ) {

                        callback( null, value );
					})
					.catch( function( err ) {

                        callback( err );
					});
			}
			else {

                return retValue;
			}
		}
		catch( err ) {

            if( logUncaughtExceptions && (stage === STAGES.EXEC) ) {

                console.log( '*** vandium - uncaught exception:', err );
            }

            callback( err );
		}
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

    logUncaughtExceptions = (enable === true);
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
