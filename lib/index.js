'use strict';

var _ = require( 'lodash' );

var config = require( './config' );

var utils = require( './utils' );

var validation = require( './validation' );

var jwt;		// JWT Validation

var protect;	// SQL Injection Protection *Beta*

function validateJWT( event ) {

	if( jwt ) {

		jwt.validate( event );
	}
}

function validateInput( event ) {

	validation.verify( event );

	if( protect ) {

		protect.scan( event );
	}
}

function wrapHandler( userFunc ) {

	return function( event, context ) {

		try {

			validateJWT( event );

			validateInput( event );

			var retValue = userFunc( event, context );

			if( retValue && _.isFunction( retValue.then ) ) {

				// userFunc just returned a promise

				retValue
					.then( function( value ) {

						context.succeed( value );
					})
					.catch( function( err ) {

						context.fail( err );
					});
			}
		}
		catch( err ) {

			context.fail( err );				
		}
	};
}

function Vandium( userFunc ) {

	return wrapHandler( userFunc )
}

Vandium.validation = function( schema ) {

	if( schema ) {

		validation.configure( schema );
	}

	return validation;
}

Vandium.jwt = function() {

	if( !jwt ) {

		jwt = require( './jwt' );
	}

	return jwt;
}

Vandium.protect = function() {

	if( !protect ) {

		protect = require( './protect' );
	}

	return protect;
}

Object.defineProperty( Vandium, 'types', {

	get: function() {

		return validation.types();
	}
});

config.on( "complete", function() {

	if( config.jwt ) {
		
		// enable JWT if configured
		Vandium.jwt();
	}
});


module.exports = Vandium;
