'use strict';

const Vandium = require( './vandium' );

const singleton = require( './singleton_instance' );

function getInstance() {

    return singleton.get();
}

function vandium( userFunc ) {

	return getInstance().handler( userFunc )
}

vandium.after = function( afterHandlerFunction ) {

    getInstance().after( afterHandlerFunction );
}

vandium.validation = function( schema ) {

	if( schema ) {

        getInstance().validation.configure( { schema }, true /* schema only */ );
	}

    return getInstance().validation;
}

// allow jwt to be used as a member variable or method
vandium.jwt = function() {

    return getInstance().jwt;
}

vandium.jwt.configure = function( options ) {

    return getInstance().jwt.configure( options );
}

vandium.jwt.enable = function( enable ) {

    return getInstance().jwt.configure( { enable } );
}

vandium.logUncaughtExceptions = function( enable ) {

    getInstance().logUncaughtExceptions = (enable !== false);
}

vandium.stripErrors = function( enable ) {

    getInstance().stripErrors = (enable !== false);
}

vandium.createInstance = function( config ) {

    return new Vandium( config );
}

Object.defineProperty( vandium, 'protect', {

    get: function() {

        return getInstance().protect;
    }
});

Object.defineProperty( vandium, 'types', {

	get: function() {

		return getInstance().validation.types;
	}
});

Object.defineProperty( vandium, 'validator', {

    get: function() {

        return getInstance().validation.validator;
    }
});

module.exports = vandium;
