'use strict';

require( './config' );  // this will load the configuration from vandium.json

const validation = require( './validation' );

const protect = require( './protect' );

const jwt = require( './jwt' );

const utils = require( './utils' );

const STAGE_JWT = 10;

const STAGE_INPUT = 20;

const STAGE_EXEC = 30;

var postHandler = function( done ) { done(); };

var logUncaughtExceptions = true;

function validateJWT( event ) {

	jwt.validate( event );
}

function validateInput( event ) {

	validation.verify( event );

	protect.scan( event );
}

function isPromise( value ) {

    return ( value && utils.isFunction( value.then ) && utils.isFunction( value.catch ) );
}

function logPostHandlerError( err ) {

    if( err ) {

        console.log( '*** vandium - error running afterHandler function', err );
    }
}

function wrapCallback( callback ) {

    return function( error, result ) {

        try {

            let retValue = postHandler( function( err ) {

                logPostHandlerError( err );

                return callback( error, result );
            });

            if( isPromise( retValue ) ) {

                retValue
                    .catch( logPostHandlerError )
                    .then( function() {

                        callback( error, result );
                    });
            }
            else if( postHandler.length === 0 ) {

                // synchronous
                callback( error, result );
            }
        }
        catch( err ) {

            logPostHandlerError( err );

            callback( error, result );
        }
    }
}

function wrapHandler( userFunc ) {

	return function( event, context, callback ) {

        let stage = 0;

		try {

            stage = STAGE_JWT;
			validateJWT( event );

            stage = STAGE_INPUT;
			validateInput( event );

            stage = STAGE_EXEC;

            callback = wrapCallback( callback );

			let retValue = userFunc( event, context, callback );

            if( isPromise( retValue ) ) {

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

            if( logUncaughtExceptions && (stage === STAGE_EXEC) ) {

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

module.exports = Vandium;
