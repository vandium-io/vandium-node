'use strict';

var config = require( './config' );

var utils = require( './utils' );

var validation = require( './validation' );

var jwt;

function validateJWT( event ) {

	if( jwt ) {

		jwt.validate( event );
	}
}

function validateInput( event ) {

	validation.verify( event );
}

function wrapHandler( userFunc ) {

	return function( event, context ) {

		try {

			validateJWT( event );

			validateInput( event );

			userFunc( event, context );
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
