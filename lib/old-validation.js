'use strict';

const Joi = require( 'joi' );

// pre-load
require( 'joi/lib/any' );

const utils = require( './utils' );

const ignoredProperties = require( './ignored-properties' );

const ValidationError = require( './errors' ).ValidationError;

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

var schema;

const types = {

    any: function() {

            return Joi.any();
        },

    array: function() {

            return Joi.array();
        },

    boolean: function() {

            return Joi.boolean();
        },

    binary: function() {

            return Joi.binary().encoding( 'base64' );
        },

    date: function() {

            return Joi.date();
        },

    number: function() {

            return Joi.number();
        },

    object: function() {

            return Joi.object();
        },

    string: function( opts ) {

            var stringValidator = Joi.string();

            if( !opts || (opts.trim === undefined) || (opts.trim === true) ) {

                stringValidator = stringValidator.trim();
            }

            return stringValidator;
        },

    uuid: function() {

            return Joi.string().regex( UUID_REGEX, 'UUID' );
        },

    email: function( opts ) {

            return Joi.string().email( opts );
        }
};

function verify( event, ignoreKeys ) {

    if( !schema ) {

        return;
    }

    // create values object with *only* the values that we want to verify (i.e. hide the noise)
    var values = utils.clone( event );

    // remove all 'VANDIUM_xxxxxx'
    Object.keys( event ).forEach( function( key ) {

        if( (key.charAt( 0 ) === 'V') && (key.indexOf( 'VANDIUM_' ) === 0) ) {

            delete values[ key ];
        }
    });

    ignoredProperties.list().forEach( function( key ) {

        delete values[ key ];
    });

    var result = Joi.validate( values, schema );

    if( result.error ) {

        throw new ValidationError( result.error );
    }

    // update values in event with validated ones
    Object.keys( result.value ).forEach( function( key ) {

        event[ key ] = result.value[ key ];
    });
}

function configure( userSchema ) {

    if( userSchema ) {

        schema = userSchema;

        // warm up during load phase
        try {

            let testEvent = {};

            Object.keys( schema ).forEach( function( key ) {

                testEvent[ key ] = 'test-data';
            });

            verify( testEvent );
        }
        catch( err ) {

            // ignore
        }
    }
}

function ignore() {

    for( var i = 0; i < arguments.length; i++ ) {

        var value = arguments[ i ];

        if( utils.isArray( value ) ) {

            value.forEach( function( v ) {

                ignoredProperties.add( v.toString() );
            });
        }
        else {

            ignoredProperties.add( value.toString() );
        }
    }
}

function getTypes() {

    return types;
}

module.exports = {

    verify: verify,

    configure: configure,

    types: getTypes,

    ignore: ignore,
};
