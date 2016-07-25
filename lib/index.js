'use strict';

const config = require( './config' );  // this will load the configuration from vandium.json

require( './prevent' ); // prevent calls to unwanted functions

const Vandium = require( './vandium' );

const vandiumInstance = new Vandium();


function vandium( userFunc ) {

	return vandiumInstance.handler( userFunc )
}

vandium.after = function( afterHandlerFunction ) {

    vandiumInstance.after( afterHandlerFunction );
}

vandium.validation = function( schema ) {

	if( schema ) {

        vandiumInstance.validation.updateSchema( schema );
	}

    return vandium.validation;
}

// allow jwt to be used as a member variable or method
vandium.jwt = function() {

    return {

        configure( options ) {

            return vandiumInstance.jwt.updateConfiguration( options );
        },

        enable( enable ) {

            return vandiumInstance.jwt.enable( enable );
        },

        isEnabled() {

            return vandiumInstance.jwt.isEnabled();
        },

        get state() {

            return vandiumInstance.jwt.state;
        }
    }
}

vandium.jwt.configure = function( options ) {

    return vandiumInstance.jwt.updateConfiguration( options );
}

vandium.jwt.enable = function( enable ) {

    return vandiumInstance.jwt.enable( enable );
}

vandium.logUncaughtExceptions = function( enable ) {

    vandiumInstance.logUncaughtExceptions = (enable !== false);
}

vandium.stripErrors = function( enable ) {

    vandiumInstance.stripErrors = (enable !== false);
}

Object.defineProperty( vandium, 'protect', {

    get: function() {

        return vandiumInstance.protect;
    }
});

Object.defineProperty( vandium, 'types', {

	get: function() {

		return vandiumInstance.validation.types;
	}
});

Object.defineProperty( vandium, 'validator', {

    get: function() {

        return vandiumInstance.validation.validator;
    }
});

vandiumInstance.configure( config );

config.on( 'update', function() {

    vandiumInstance.configure( config );
});

module.exports = vandium;
